const log4js = require('log4js');
const MongoClient = require('mongodb').MongoClient;
log4js.configure({
    appenders: {book: {type: 'file', filename: 'logs/classifier_be.log'}, out: {type: 'stdout'}},
    categories: {default: {appenders: ['book', 'out'], level: 'debug'}}
});
const logger = log4js.getLogger('book');

const connectionUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'file-server';

MongoClient.connect(connectionUrl, {useNewUrlParser: true}, ( err, client) => {
    if(err) {
        return logger.error('Error in connecting to Server');
    }
    logger.debug('MongoDb is connected successfully');

    const db = client.db(dbName);
    db.collection('users').findOne({email: email}, (err, user) => {
        if(err) {
            return logger.error('Error in retreiving user');
        }
        return user;
    })
});

