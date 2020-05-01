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
module.exports.getData = (res, hours, jumpByNFields, dayToLoad) => {
    // clear global variable
    entities = [];
    let numberOfItems = constants.MEASUREMENTS_PER_HOUR * hours;
    logger.debug("Requested items=" + numberOfItems);

    // today formatted to YYYY-MM-DD
    let today = new Date().toISOString().split('T')[0];
    let finalDayToLoad = dayToLoad === undefined ? today : dayToLoad;
    logger.debug("Day to load=" + finalDayToLoad);

    let query = new azure.TableQuery().where('PartitionKey eq ?', finalDayToLoad);
    // optimalized query in case it loads last hour of today
    if (dayToLoad === today) {
        let queryDate = new Date();
        queryDate.setHours(queryDate.getHours() - hours);
        query = new azure.TableQuery().where('PartitionKey eq ?', finalDayToLoad).and('Timestamp >= ?date?', queryDate);
    }
    queryEntitiesSegmented(constants.AZURE_TABLE, query, null, res, jumpByNFields, numberOfItems);
};

// https://docs.microsoft.com/en-us/rest/api/storageservices/querying-tables-and-entities
// https://stackoverflow.com/questions/53385166/retrieving-more-than-1000-records-from-azure-storage-table-js
var entities = [];
function queryEntitiesSegmented(table, tableQuery, continuationToken, res, jumpByNFields, numberOfItems) {
    tableService.queryEntities(table, tableQuery, continuationToken, (error, results, response) => {
        if (error) {
            logger.error(error);
            res.status(403).send('Azure tables query was not successful.');
        } else {
           // logger.debug('Response=' + JSON.stringify(response));
            entities.push.apply(entities, results.entries);
            if (results.continuationToken) {
                queryEntitiesSegmented(table, tableQuery, results.continuationToken, res, jumpByNFields, numberOfItems);
            } else {
                let entitiesSubset = [];
                let len = entities.length;
                logger.info("Number of loaded items: " + len);

                let startingIndex = numberOfItems > len ? 0 : len - numberOfItems;
                logger.debug("Starting index=" + startingIndex);
                for (let i = startingIndex; i < len; i += jumpByNFields)
                    entitiesSubset.push(createRow(entities[i]));

                logger.info("Number of items in reduced set: " + entitiesSubset.length);
                logger.debug(entitiesSubset);
                res.send(entitiesSubset.length === 0 ? "" : entitiesSubset);
            }
        }
    });
    return entities;
}

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