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
            let diffAccumulator = 0;

            res.json(data.map((e, i) => {
                const {currentStatistics} = e;
                const diff = data[i - 1] ? (currentStatistics.unpaid - data[i - 1].currentStatistics.unpaid) / 1000000000000000000 : 0;

                let profit = 0;
                diffAccumulator += data[i - 1] ? (currentStatistics.unpaid - data[i - 1].currentStatistics.unpaid) : 0;

                if (diff === 0 || i === (data.length - 1)) {
                    profit = diffAccumulator / 1000000000000000000;
                    diffAccumulator = 0;
                }

                return {
                    date: e.date,
                    unpaid: currentStatistics.unpaid / 1000000000000000000,
                    diff,
                    profit
                }
            }))
        })
        .catch((err) => {
            console.error('ERR: ', err);
            res.status(200).send('err!');
        })
});

module.exports = router;
