const express = require('express');

require('dotenv').config({path: './.env'});
const {StaticApp} = require('@keystonejs/app-static');
const { NextApp } = require('@keystonejs/app-next');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

const {Keystone} = require('@keystonejs/keystone');
const {PasswordAuthStrategy} = require('@keystonejs/auth-password');
const {GraphQLApp} = require('@keystonejs/app-graphql');
const {AdminUIApp} = require('@keystonejs/app-admin-ui');
const initialiseData = require('./initial-data');
const {registerModels,test} = require("./models");
const defaultAccess = require('./models/defaultAccess.js')
const {MongooseAdapter: Adapter} = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'Awesome CMS';
const adapterConfig = {mongoUri: process.env.MONGO_DB ||  'mongodb://localhost/english-dashboard'};
console.error('adapter config:', adapterConfig);

const keystone = new Keystone({
    adapter: new Adapter(adapterConfig),
    cookieSecret: process.env.COOKIE_SECRET || 'SET_COOKIE_SECRET',
    sessionStore: new MongoStore({url: 'mongodb://localhost/' + PROJECT_NAME.replace(' ','_')}),
    onConnect: /*process.env.CREATE_TABLES !== 'true' &&*/ initialiseData,
    cookie: {
        secure: false, // Default to true in production
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        sameSite: false,
    },

});

registerModels(keystone);

require('./lib/custom-mutation')(keystone)


const authStrategy = keystone.createAuthStrategy({
    type: PasswordAuthStrategy,
    list: 'User',
});

let fileStorageSrc = require('path').resolve(process.env.FILE_STORAGE);
console.error('fileStorageSrc', fileStorageSrc);
module.exports = {
    keystone,
    apps: [
        new GraphQLApp({

        }),
        new AdminUIApp({
            name: PROJECT_NAME,
            enableDefaultRoute: false,
            authStrategy,
            hooks: require.resolve('./admin-ui'),
        }),
    /*    new StaticApp({
            path: '/files',
            src: fileStorageSrc,
        }),*/
    ],
    configureExpress: app => {
        app.set('trust proxy', 1);
        app.use('/files',express.static(fileStorageSrc))
    }
};