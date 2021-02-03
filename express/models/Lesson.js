const {Text, Checkbox, Relationship,} = require('@keystonejs/fields');
const { atTracking , byTracking } = require('@keystonejs/list-plugins');
const Stars = require('../lib/fields/Stars');
const {defaultAccessList} = require("./defaultAccess");


module.exports = {
    fields: {
        name: {
            type: Text,
            isRequired: true,
            isUnique:true,
        },
        public: {
            type: Checkbox
        },
        category: {
            type:Relationship,
            ref:'Category.lessons',
        },
        rating:{
            type:Stars,
            starCount: 5,
        },
        sound:{
            type:Relationship,
            ref:'Sound',
        },
        image:{
            type:Relationship,
            ref:'Image',
        },
        subtitle:{
            type:Relationship,
            ref:'Subtitle',
        },
        artist:{
            type:Relationship,
            ref:'Artist.lessons',
        }
    },
    plugins:[
        atTracking(),
        byTracking(),
    ]
    // labelField:'title',
   /* labelResolver:item => {
        console.log('resolve label:', item);
        return item.title;
    }*/
    ,
    access:defaultAccessList,
}