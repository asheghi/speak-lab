const {Text, Relationship} = require('@keystonejs/fields');

module.exports = keystone => {

    keystone.createList('Word', {
        fields: {
            word: {type: Text, isRequired: true,},
            phonetics: {
                type: Relationship,
                ref: "Phonetic.word",
                many: true,
            },
            meanings: {
                type: Relationship,
                ref: "Meaning.word",
                many: true,
            }
        },
        labelField: 'word',
    })

    keystone.createList('Phonetic', {
        fields: {
            text: {type: Text,},
            audio: {type: Text,},
            word: {
                type: Relationship,
                ref: "Word.phonetics",
            },
        },
        labelField: 'text',
    })

    keystone.createList('Meaning', {
        fields: {
            partOfSpeech: {type: Text, isRequired: true,},
            word: {
                type: Relationship,
                ref: 'Word.meanings'
            },
            definitions: {
                type: Relationship,
                ref: 'Definition.meaning',
                many: true,
            },
        }
    })

    keystone.createList('Definition', {
        fields: {
            definition: {type: Text,},
            example: {type: Text,},
            synonyms: {
                type: Relationship,
                ref: 'Synonym.definition',
                many: true,
            },
            meaning: {
                type: Relationship,
                ref: 'Meaning.definitions',
            },
        }
    })

    keystone.createList('Synonym', {
        fields: {
            name: {
                type: Text,
                isUnique: true,
            },
            definition: {
                type: Relationship,
                ref: 'Definition.synonyms',
            }
        }
    })
}