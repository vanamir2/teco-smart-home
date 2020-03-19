require("dotenv").config();
let azure = require('azure-storage');
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
module.exports.test = (req, res) => {

    //tableService.retrieveEntity('testTable2', '2020-03-19', '000181', function(error, result, response) {

    let query = new azure.TableQuery()
        .top(1)
        .where('PartitionKey eq ?', '2020-03-19');
    tableService.queryEntities('testTable2',query,null, (error, result, response) => {
        if (!error) {
            console.log(result); // WORKING . HELL YEAH
            res.send(result.entries);
            // result contains the entity
        }
    });
    tableService.retrieveEntity('testTable2', '2020-03-19', "", (error, result, response) => {
        if (!error) {
            console.log(result.temperature_inner._); // WORKING . HELL YEAH
            // result contains the entity
        }
    });
};