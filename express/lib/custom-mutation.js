var translate = require('translation-google');
const fs = require('fs');
const {Upload} = require('graphql-upload');
const path = require('path');
const mime = require('mime');
const DownloadStorage = process.env.DOWNLOAD_STORAGE;
const {downloadUrl} = require('./DownloadHelpers.js');
const FfmpegCommand = require('fluent-ffmpeg');
const {createItem} = require('@keystonejs/server-side-graphql-client');
const {findDefinitions} = require('./dictionary/dictionary.js');
const prepareFile = filePath => {
    const upload = new Upload();
    upload.resolve({
        createReadStream: () => fs.createReadStream(filePath),
        filename: path.basename(filePath),
        mimetype: mime.getType(filePath),
        encoding: 'utf-8',
    });
    return upload;
};

module.exports = keystone => {
    let downloadVideo = async (idk, item, context, idk2, idk3) => {
        const {url, fileName} = item;
        const mp3_file_path = await convertVideo(url, fileName);
        const file = prepareFile(mp3_file_path);
        try {
            const soundItem = await createItem({
                keystone,
                listKey: 'Sound',
                item: {file: file.promise,},
                returnFields: `id`,
            });

            console.log('sound Item', soundItem);
            try {
                fs.unlinkSync(mp3_file_path);
            } catch (e) {
                console.error(e);
            }
            return {id: soundItem.id}
        } catch (e) {
            console.error(e)
            throw e;
        }


    };

    let getDefinitionResolver = (idk, {word, lang = 'en'}) => {
            console.log('getDefinitionResolver', word);
            return new Promise(async (resolve) => {
                    let translation = null;

                    try {
                        translation = await translate(word, {to: 'fa'})
                    } catch (e) {
                        console.error(e);
                    }

                    let response = {translation: JSON.stringify(translation) || 'null'}

                    findDefinitions(word, lang, (error, result) => {
                        console.log('translation', response);
                        response.result = JSON.stringify(result) || 'null'
                        response.error = JSON.stringify(error) || 'null'
                        console.log('translation', response);
                        resolve(response)
                    })
                }
            )
        }
    ;
    keystone.extendGraphQLSchema({
        types: [
            {
                type: `
                    type GetDefinitionResponse {
                        result: String
                        error: String
                        translation: String
                    }
                `
            },
        ],
        mutations: [
            {
                schema: 'downloadVideo(url:String!,fileName:String!) : Sound',
                resolver: downloadVideo,
            }
        ],
        queries: [
            {
                schema: 'getDefinition(word: String!,lang: String) : GetDefinitionResponse',
                resolver: getDefinitionResolver,
            }
        ]
    })

    keystone.extendGraphQLSchema({
        mutations: [
            {
                schema: 'importSoundFromUrl(url:String!,fileName:String) : Boolean',
                resolver: async function (_, args, ctx) {
                    const {url, fileName: argFileName} = args;
                    const http = require('http'); // or 'https' for https:// URLs
                    const fs = require('fs');
                    const fileName = argFileName || decodeURI(url.substring(url.lastIndexOf('/') + 1));
                    let filePath = "/tmp/" + fileName;
                    const file = fs.createWriteStream(filePath);
                    await new Promise((resolve, reject) => {
                        http.get(url, async function (response) {
                            response.pipe(file);
                            file.on('finish', function () {
                                file.close();
                                resolve();
                            });
                        });
                    })

                    const f = prepareFile(filePath);
                    const soundItem = await createItem({
                        keystone,
                        listKey: 'Sound',
                        item: {file: f.promise,},
                        returnFields: `id`,
                    });

                    fs.unlinkSync(filePath);
                    console.log('new sound', soundItem);
                    return true;
                }
            },
            {
                schema: 'importSoundFromDisk(path:String!) : Int',
                resolver: async function (_, args, ctx) {
                    const fs = require('fs');
                    let {path} = args;
                    const Path = require('path');
                    path = Path.resolve(path);

                    if (!fs.existsSync(path)) {
                        throw new Error('invalid path - ' + path);
                    }

                    let list = fs.readdirSync(path).filter(it => it.toLowerCase().endsWith('.mp3'));
                    console.log('check list:', list);

                    let count = 0;
                    for (const file of list) {
                        try {
                            const filePath = Path.join(path, file);
                            //let Sound = keystone?.adapters?.MongooseAdapter?.mongoose?.models?.['Sound'];

                            const f = prepareFile(filePath);
                            const soundItem = await createItem({
                                keystone,
                                listKey: 'Sound',
                                item: {file: f.promise,},
                                returnFields: `id`,
                            });
                            console.log('new sound', soundItem);
                            count++;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return count;
                }
            },
            {
                schema: 'importSubtitleFromDisk(path:String!) : Int',
                resolver: async function (_, args, ctx) {
                    const fs = require('fs');
                    let {path} = args;
                    const Path = require('path');
                    path = Path.resolve(path);

                    if (!fs.existsSync(path)) {
                        throw new Error('invalid path - ' + path);
                    }

                    let list = fs.readdirSync(path).filter(it => it.toLowerCase().endsWith('.srt'));
                    console.log('check list:', list);

                    let count = 0;
                    for (const file of list) {
                        try {
                            const filePath = Path.join(path, file);
                            //let Sound = keystone?.adapters?.MongooseAdapter?.mongoose?.models?.['Sound'];

                            const f = prepareFile(filePath);
                            const soundItem = await createItem({
                                keystone,
                                listKey: 'Subtitle',
                                item: {file: f.promise,},
                                returnFields: `id`,
                            });
                            console.log('new Subtitle', soundItem);
                            count++;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return count;
                }
            }]
    })
}


async function convertVideo(url, file_name) {
    const dest_video_path = path.join(path.resolve(DownloadStorage), file_name + '.mp4');
    const dest_audio_path = path.join(path.resolve(DownloadStorage), file_name + '.mp3');
    const downloadedFile = await downloadUrl(url, dest_video_path);

    return new Promise((resolve, reject) => {
        const command = FfmpegCommand(downloadedFile, {
            logger: {
                debug: console.log,
                info: console.info,
                warn: console.warn,
                error: console.error,
            }
        })
            .noVideo()
            .audioCodec('libmp3lame')
            .save(dest_audio_path)
            .on('end', () => {
                console.log('mp3 file generated!');
                resolve(dest_audio_path);
                try {
                    fs.unlinkSync(dest_video_path)
                } catch (e) {
                    console.error(e)
                }
            })
            .run();
    })
    //console.log(command);
}