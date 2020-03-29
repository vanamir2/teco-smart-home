require("dotenv").config();
const azure = require('azure-storage');
const logger = require('logplease').create('AzureStorage');
const tableService = azure.createTableService(process.env.AZURE_STORAGE_CONNECTION_STRING);
const Utils = require('./utils');
const constants = require('./constants');

/**
 * Function to load data in specified range from Azure Table storage.<br/>
 * There are no good ways to filter or aggregate data. https://scotthelme.co.uk/hacking-table-storage-like-queries/.
 * We have to load all data and do own in-memory selection here on backend.<br/>
 *
 * If day to load is not provided. Today is taken
 */
module.exports.getData = (req, res, hours, jumpByNFields, dayToLoad) => {
    let numberOfItems = constants.MEASUREMENTS_PER_HOUR * hours;

    // today formatted to YYYY-MM-DD
    let today = new Date().toISOString().split('T')[0];
    let finalDayToLoad = dayToLoad === undefined ? today : dayToLoad;
    logger.debug("Day to load=" + finalDayToLoad);

    let query = new azure.TableQuery().where('PartitionKey eq ?', finalDayToLoad);
    tableService.queryEntities('testTable2', query, null, (error, result, response) => {
        let arr = [];
        if (!error) {
            logger.info("Number of loaded items: " + result.entries.length);
            let len = result.entries.length;

            let startingIndex = numberOfItems > len ? 0 : len - numberOfItems;
            logger.debug("Starting index=" + startingIndex);
            for (let i = startingIndex; i < len; i += jumpByNFields)
                arr.push(createRow(result.entries[i]));

            logger.info("Number of items in reduced set: " + arr.length);
            res.send(arr);
        } else
            res.status(403).send('Azure tables query was not successful.');
    });
};

function getValueOrDefault(field, defaultValue) {
    return field === undefined ? defaultValue : field._
}

function createRow(entry) {
    return {
        "plcSaveTs": getValueOrDefault(entry.plcSaveTs, null),
        "doorOpened": entry.doorClosed === undefined ? getValueOrDefault(entry.doorOpened, null) : !(entry.doorClosed._),
        "electricSocket": getValueOrDefault(entry.electricSocket, null),
        "temperature_outer": getValueOrDefault(entry.temperature_outer, null),
        "temperature_inner": getValueOrDefault(entry.temperature_inner, null),
        "humidity_inner": getValueOrDefault(entry.humidity_inner, null),
        "light": getValueOrDefault(entry.light, null),
    };
}

// testing query
module.exports.test = (req, res) => {
    let query = new azure.TableQuery().top(5).where('PartitionKey eq ?', "2020-03-29");
    tableService.queryEntities('testTable2', query, null, (error, result, response) => {
        if (error)
            res.send(error);
        let arr = [];
        logger.info("Number of loaded items: " + result.entries.length);
        for (let i = 0; i < result.entries.length; i += 1)
            arr.push(createRow(result.entries[i]));
        logger.info("Number of reduced set of items: " + arr.length);
        res.send(arr);
    });
};