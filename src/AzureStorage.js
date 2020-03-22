require("dotenv").config();
let azure = require('azure-storage');
const logger = require('logplease').create('AzureStorage');
let tableService = azure.createTableService(process.env.AZURE_STORAGE_CONNECTION_STRING);


// tady provést select, zahodit nepotřebná data a na klienta poslat jen to důležité ve formátu json
/*
  [
      { field: ...,
        field: ...,
        field:....    },

      { field: ...,
        field: ...,
        field:....    },

        ....
  ]
 */
// no good ways to filter or aggregate data. https://scotthelme.co.uk/hacking-table-storage-like-queries/
// we have to load all data and do own in-memory selection here on backend
module.exports.test = (req, res) => {

    //tableService.retrieveEntity('testTable2', '2020-03-19', '000181', function(error, result, response) {

    let query = new azure.TableQuery();
    //.top(5)
    //.where('PartitionKey eq ?', '2020-03-20');
    tableService.queryEntities('testTable2', query, null, (error, result, response) => {
        arr = [];
        if (!error) {
            // probrat to a vzit kazdou 10. 
            logger.info("Number of loaded items: " + result.entries.length);
            //for( const entry of result.entries.values()){
            for (let i = 0; i < result.entries.length - 10; i += 10) {
                arr.push(createRow(result.entries[i]));
            }
            logger.info("Number of reduced set of items: " + arr.length);
            //logger.debug(arr); // WORKING . HELL YEAH
            res.send(arr);
        }
    });
    tableService.retrieveEntity('testTable2', '2020-03-19', "", (error, result, response) => {
        if (!error) {
            console.log(result.temperature_inner._); // WORKING . HELL YEAH
            // result contains the entity
        }
    });
};

function decimalToTwoDigits(number){
    return ("0" + number).slice(-2);
}

module.exports.getData = (req, res, hours, jumpByNFields, dayToLoad ) => {
    // this corresponds to 1 hour
    let numberOfItems = 60 * hours;
    let currentDate = new Date();
    logger.debug("Today=" + currentDate);
    // https://stackoverflow.com/questions/18624326/getmonth-in-javascript-gives-last-month
    // get month starts from 0, so I have to add manualy +1 =]
    let today = currentDate.getFullYear() + '-' +  decimalToTwoDigits(currentDate.getMonth()+1)  + '-' +  decimalToTwoDigits(currentDate.getDate());
    logger.debug("Today=" + today);
    let finalDayToLoad = dayToLoad === undefined ? today : dayToLoad;
    logger.debug("Day to load=" + finalDayToLoad);

    let query = new azure.TableQuery().where('PartitionKey eq ?', finalDayToLoad);
    tableService.queryEntities('testTable2', query, null, (error, result, response) => {
        arr = [];
        if (!error) {
            //logger.debug(JSON.stringify(result));
            // probrat to a vzit kazdou 10.
            logger.info("Number of loaded items: " + result.entries.length);
            //for( const entry of result.entries.values()){
            let len = result.entries.length;
            let startingIndex = numberOfItems > len ? 0 : len - numberOfItems;
            logger.debug("Starting index=" + startingIndex);
            for (let i = startingIndex; i < len; i += jumpByNFields) {
                arr.push(createRow(result.entries[i]));
            }
            logger.info("Number of reduced set of items: " + arr.length);
            //logger.debug(arr); // WORKING . HELL YEAH
            res.send(arr);
        }
    });
};


function createRow(entry) {
    return {
        "plcSaveTs": entry.plcSaveTs._,
        "doorClosed": entry.doorClosed._,
        "electricSocket": entry.electricSocket._,
        "temperature_outer": entry.temperature_outer._,
        "temperature_inner": entry.temperature_inner._,
        "humidity_inner": entry.humidity_inner._,
        "light": entry.light._,
    };
}