const Datastore = require('nedb');
const path = require('path');

class Reporting {
    db = new Datastore({filename: path.join(path.resolve(__dirname), 'reporting.db'), autoload: true});

    constructor() {
    }

    insert(data) {
        this.db.insert([{date: new Date(), ...data}]);
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.find({}).sort({ date: 1 }).exec((err, docs) => {
                if (err) reject(err);
                else resolve(docs);
            })
        })
    }

}

module.exports = new Reporting();
