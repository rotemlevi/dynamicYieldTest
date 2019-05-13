const Logger = require('../logger/log');
const mongo = require('mongodb');
const { MONGO_URI = 'mongodb://localhost:27017' } = process.env;
let db = null;
let client = mongo.MongoClient(MONGO_URI, {
    useNewUrlParser: true
});;

async function init() {
    try {
        // Database Name
        const dbName = 'test';
        
        // Connect using MongoClient
        client = await client.connect();

        // Create a collection we want to drop later
        db = client.db(dbName);

        client.on('error', err => {
            Logger.error(err);
        });
    } catch (err) {
        console.log(err);
    }

}

module.exports = {
    getDb: async function () {
        if (db != null) return db;
        await init();
        return db;
    },
    getClient: async function () {
        if (client != null) return client;
        await init();
        return client;
    }
}