const {LocalFileAdapter} = require('@keystonejs/file-adapters');
const Fields = require('@keystonejs/fields');
const fs = require('fs');
const path = require('path');
const filestorage = process.env.FILE_STORAGE;
const {atTracking, byTracking} = require('@keystonejs/list-plugins');
const FileSize = require('filesize')
const BASE_URL = process.env.BASE_URL;
const mp3Duration = require('mp3-duration');
const {defaultAccessList} = require("./defaultAccess");
const {parseSync} = require('subtitle')

module.exports = (keystone, listKey, {validation: {mimetype: validationMimeType = ''}, fields = {}, sub_directory = ''}) => {
    const storage_path = path.resolve(path.join(filestorage, sub_directory));
    let urlBase = '/files' + (sub_directory.length ? '/' + sub_directory : '');
    const fileAdapter = new LocalFileAdapter({
        src: storage_path,
        path: urlBase,
    });
    const getMongooseModel = () => keystone.adapters.MongooseAdapter.mongoose.models[listKey]
    keystone.createList(listKey, {
        fields: {
            file: {
                type: Fields.File,
                isRequired: true,
                adapter: fileAdapter,
                hooks: {
                    validateInput: ({
                                        operation,
                                        existingItem,
                                        originalInput,
                                        resolvedData,
                                        context,
                                        addFieldValidationError,
                                        listKey,
                                        fieldPath, // exists only for field hooks
                                    }) => {
                        // Throw error objects or register validation errors with addFieldValidationError(<String>)
                        // Return values ignored
                        let mimetype = resolvedData.file.mimetype;
                        let bad_mime_type;
                        if (validationMimeType && Array.isArray(validationMimeType)) {
                            bad_mime_type = !validationMimeType.filter(it => mimetype.indexOf(it) > 0).length;
                        } else {
                            bad_mime_type = mimetype.indexOf(validationMimeType) < 0;
                        }

                        if (bad_mime_type) {
                            console.error('mime type error');
                            addFieldValidationError('delam mikhad!');
                            throw  new Error('Error!');
                        }
                    },
                    beforeChange: async ({existingItem}) => {
                        if (existingItem && existingItem.file) {
                            await fileAdapter.delete(existingItem.file);
                        }
                    },
                    validateDelete: ({
                                         operation,
                                         existingItem,
                                         context,
                                         addFieldValidationError,
                                         listKey,
                                         fieldPath, // exists only for field hooks
                                     }) => {
                        /* todo fix this , field delete show success but don't delete file,
                        // todo dont throe error when item is deleted not field
                         //Throw error objects or register validation errors with addFieldValidationError(<String>)
                         // Return values ignored
                         console.log('validateDelete called with', existingItem);
                         addFieldValidationError('not allowed, please delete the item instead.');
                         // throw new Error('not allowed, please delete the item instead.')*/

                        //Throw error objects or register validation errors with addFieldValidationError(<String>)
                        // Return values ignored
                        // console.log('validateDelete called with', fieldPath);
                        // addFieldValidationError('not allowed, please delete the item instead.');
                    }
                },
                adminConfig: {}
            },
            name: {
                type: Fields.Text,
                //adminConfig: {isReadOnly: true,},
            },
            encoding: {
                type: Fields.Text,
                adminConfig: {isReadOnly: true,},
            },
            mimetype: {
                type: Fields.Text,
                adminConfig: {isReadOnly: true,},
            },
            url: {
                type: Fields.Virtual,
                resolver: (item, args, context) => {
                    return BASE_URL + urlBase + '/' + item.file.filename
                },
                adminConfig: {
                    isReadOnly: true,
                }
            },
            size: {
                type: Fields.Text,
                adminConfig: {
                    isReadOnly: true,
                }
            },
            filePath: {
                type: Fields.Virtual,
                resolver: (item,args,context) => path.resolve(path.join(storage_path,item.file.filename))
            },
            ...fields,
        },
        hooks: {
            resolveInput: ({
                               operation,
                               existingItem,
                               originalInput,
                               resolvedData,
                               context,
                               listKey,
                               fieldPath, // exists only for field hooks
                           }) => {
                // Input resolution logic. Object returned is used in place of `resolvedData`.
                if (!resolvedData.file) {
                    return resolvedData;
                }
                const {originalFilename, mimetype, encoding} = resolvedData.file;
                return new Promise(async (resolve, reject) => {
                    try {
                        const {createReadStream} = await originalInput.file
                        const stream = createReadStream();
                        let file_size = 0;
                        stream.on('data', function (chunk) {
                            file_size += chunk.length;
                        }).on('end', () => {
                            const size = FileSize(file_size);
                            resolvedData = {...resolvedData, size, name: originalFilename, mimetype, encoding};
                            resolve(resolvedData);
                        })
                    } catch (e) {
                        console.error(e);
                        resolvedData = {...resolvedData, name: originalFilename, mimetype, encoding};
                        resolve(resolvedData);
                    }
                })
            },
            afterDelete: async ({
                                    operation,
                                    existingItem,
                                    context,
                                    listKey,
                                    fieldPath, // exists only for field hooks
                                }) => {
                // Perform side effects
                // Return values ignored
                try {
                    console.log('deleting file', existingItem.file.filename);
                    let file_absolute_path = path.resolve(path.join(storage_path, existingItem.file.filename));
                    fs.unlinkSync(file_absolute_path)
                    console.log('woallah! file is deleted successfully');
                } catch (e) {
                    console.error(e);
                }
            },
            afterChange: async ({
                                    operation,
                                    existingItem,
                                    originalInput,
                                    updatedItem,
                                    context,
                                    listKey,
                                    fieldPath, // exists only for field hooks
                                }) => {
                // Perform side effects
                // Return values ignored
                try {
                    if (fields.duration) {
                        let skip = false;
                        if (existingItem) {
                            skip = true;
                        } else if (updatedItem.duration) {
                            skip = true;
                        } else if (existingItem && updatedItem && existingItem.file.filename === updatedItem.file.filename) {
                            skip = true;
                        }
                        if (skip) {
                            console.log('skipping');
                            return;
                        }

                        let file_absolute_path = path.resolve(path.join(storage_path, updatedItem.file.filename));
                        const seconds = await mp3Duration(file_absolute_path);
                        const formatted = new Date(seconds * 1000).toISOString().substr(11, 8)

                        const model = getMongooseModel();
                        const doc = await model.findOne({_id: updatedItem.id});
                        if (!doc) throw new Error('document is null');
                        doc.duration = formatted;
                        await doc.save()
                    }
                } catch (e) {
                    console.error(e);
                }

                try{
                    if (fields.subtitles) {
                        let file_absolute_path = path.resolve(path.join(storage_path, updatedItem.file.filename));
                        const text = fs.readFileSync(file_absolute_path, {encoding: 'utf-8'});
                        const list = parseSync(text).map(it => it.data)
                        const string_list = JSON.stringify(list);
                        const model = getMongooseModel();
                        const doc = await model.findOne({_id: updatedItem.id})
                        doc.subtitles = string_list;
                        const result = await doc.save();
                       // console.log('hahahaha', doc,result);
                    }
                }catch(e){
                    console.error(e);
                }
            }

        },
        labelField: 'name',
        plugins: [
            byTracking(),
            atTracking(),
        ],
        access:defaultAccessList,
    });
}

