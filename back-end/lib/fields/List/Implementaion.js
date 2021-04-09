const {Text,} = require('@keystonejs/fields');

class List extends Text.implementation {
    extendAdminMeta(meta) {
        return { ...meta, starCount: this.config.starCount || 5 };
    }
}
module.exports = {
    List,
    MongoIntegerInterface: Text.adapters.mongoose,
    KnexIntegerInterface: Text.adapters.knex,
};