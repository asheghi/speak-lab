const { Stars, MongoIntegerInterface, KnexIntegerInterface } = require('./Implementaion');

const { Integer } = require('@keystonejs/fields');

module.exports = {
    type: 'Stars',
    implementation: Stars,
    adapters: {
        mongoose: MongoIntegerInterface,
        knex: KnexIntegerInterface,
    },
    views: {
        Controller: Integer.views.Controller,
        Field: require.resolve('./views/Field'),
        Filter: Integer.views.Filter,
        Cell: require.resolve('./views/Cell'),
    },
};

