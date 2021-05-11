const express = require('express');
const router = express.Router();
const axios = require('axios');
const cron = require('node-cron');
const reportingDb = require('../db/reporting');

cron.schedule('0 * * * *', () => {
    console.log(new Date(), 'Logged!');

    axios
        .get(`https://api.ethermine.org/miner/${process.env.MINING_ADDRESS}/dashboard`)
        .then(data => {
            if (data.status === 200)
                reportingDb.insert(data.data.data);
        })
        .catch(err => console.log(err));
});

/* GET reporting listing. */
router.get('/', function (req, res, next) {
    reportingDb
        .getAll()
        .then(data => {
            res.json(data.map((e, i) => {
                const {currentStatistics} = e;

                if (data[i - 1]) console.log(i, currentStatistics.unpaid, data[i - 1].currentStatistics.unpaid);

                return {
                    date: e.date,
                    unpaid: currentStatistics.unpaid / 1000000000000000000,
                    diff: data[i - 1] ? (currentStatistics.unpaid - data[i - 1].currentStatistics.unpaid) / 1000000000000000000 : 0
                }
            }))
        })
        .catch(() => res.status(200).send('err!'))
});

module.exports = router;
