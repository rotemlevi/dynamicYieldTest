const mongo = require('../dal/mongo');
const crypto = require('crypto');

let collection = null;
let db = null;

async function init() {
    try {
        db = await mongo.getDb();
        collection = db.collection('user');
        collection.createIndex('email', {
            unique: true
        })

    } catch (err) {
        console.log(err);
    }

}

module.exports = {
    ...collection,
    insertUserAsync: async (user) => {
        if (collection === null) await init();
        let hashPassword = crypto.createHash('md5').update(user.password).digest("hex");
        return await collection.insertOne({
            "email": user.email,
            "password": hashPassword
        });
    },
    getUserAsync: async (email) => {
        if (collection === null) await init();
        return await collection.findOne({
            "email": email
        });
    },
    getUsersAsync: async () => {
        if (collection === null) await init();
        return await collection.find();
    },
};