const fs = require('fs');
const path = require('path');
const Fields = require('@keystonejs/fields');
const StringList = require('../lib/fields/List')
const {parseSync} = require('subtitle')
const registerWord = require('./dictionary/Word.js');

module.exports.registerModels = function (keystone) {
    keystone.createList('Category', require('./Category.js'));
    keystone.createList('Artist', require('./Artist.js'));
    keystone.createList('Lesson', require('./Lesson.js'));
    keystone.createList('User', require('./User.js'));
    let createFileList = require('./File.js');
    createFileList(keystone, 'Sound', {
        validation: {mimetype: 'audio'},
        fields: {
            duration: {
                type: Fields.Text,
                adminConfig: {isReadOnly: true,},
            }
        },
        sub_directory: 'Sound',
    });
    createFileList(keystone, 'Image', {validation: {mimetype: 'image',}, sub_directory: 'Images', listKey: 'Image'});
    createFileList(keystone, 'Subtitle', {
        validation: {mimetype: ['sub', 'text']},
        sub_directory: "Subtitles",
        listKey: 'Subtitle',
        fields: {
            subtitles: {
                type: StringList,
                adminConfig: {}
            }
        }
    });

    registerWord(keystone);
}