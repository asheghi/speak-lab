const {defaultAccessList} = require("./defaultAccess");
const {Text, Checkbox, Relationship,} = require('@keystonejs/fields');
const {atTracking, byTracking} = require('@keystonejs/list-plugins');

module.exports = {
    fields: {
        name: {
            type: Text,
            isRequired: true,
            idUnique: true,
        },
        public: {
            type: Checkbox
        },
        lessons: {
            type: Relationship,
            ref: 'Lesson.category',
            many: true,
        }
    },
    labelField: 'name',
    plugins: [
        atTracking(), byTracking(),
    ],
    access:defaultAccessList,
}