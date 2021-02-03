const { List , MongoIntegerInterface, KnexIntegerInterface } = require('./Implementaion');

const { Text } = require('@keystonejs/fields');

module.exports = {
    type: 'List',
    implementation: List,
    adapters: {
        mongoose: MongoIntegerInterface,
        knex: KnexIntegerInterface,
    },
    views: {
        Controller: Text.views.Controller,
        Field: require.resolve('./views/Field'),
        Filter: Text.views.Filter,
        Cell: require.resolve('./views/Cell'),
    },
};

