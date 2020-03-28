const router = require('express').Router();
require("dotenv").config();

// logger
const Logger = require('logplease');
const logger = Logger.create('index');
Logger.setLogLevel(process.env.LOGGER_LEVEL);

// local sources
const constants = require('../src/constants');
const TecoRoute = require("../src/tecoRoute");
const AzureStorage = require("../src/azureStorage");
const TecoApi = require("../src/tecoApi");
const GoogleAssistant = require("../src/googleAssistant");

// constant shortening
const TECOROUTE_PW = constants.TECOROUTE_PW;
const TECOROUTE_USERNAME = constants.TECOROUTE_USERNAME;
const TECOROUTE_PLC = constants.TECOROUTE_PLC;
const TECOAPI_USERNAME = constants.TECOAPI_USERNAME;
const TECOAPI_PW = constants.TECOAPI_PW;

// pefroms login
router.post('/tecoRouteLogin', (req, res) => {
    TecoRoute.tecoRouteLogin(res, req.body.tecoRouteUsername, req.body.tecoRoutePw, req.body.plcName);
});

// TecoRoute already logged, sends request to TecoApi
router.post('/TecoApiViaTecoRouteWithCookie', (req, res) => {
    const url = constants.TECOROUTE_URL + req.body.command;
    logger.debug('Request body is= ' + JSON.stringify(req.body));
    TecoApi.sendToTecoApi(url, req.body.username, req.body.password, res, null, TecoRoute.getRoutePLC(req.body.cookie), TecoRoute.getSoftPLC(req.body.cookie));
});

// TecoRoute NOT logged yet, sends request to TecoApi
router.post('/TecoApiViaTecoRoute', (req, res) => {
    const url = 'http://route.tecomat.com:61682/TecoApi/' + req.body.command;
    logger.debug('Request body is= ' + req.body);
    TecoRoute.sendToTecoApiViaTecoRoute(res, url, req.body.tecoRouteUsername, req.body.tecoRoutePw, req.body.plcName, req.body.username, req.body.password);
});

// Dialogflow webhook to use Google Assistant.
router.post('/webhook', (req, res) => {
    GoogleAssistant.handleWebHook(req, res);
});

// Endpoint to download data from Azure Storage Tables.
router.post('/data', (req, res) => {
    let hours = req.body.hours;
    let jumpByNFields = req.body.jumpByNFields;
    let dayToLoad = req.body.day;

    logger.debug('hours=' + hours);
    logger.debug('jumpByNFields=' + jumpByNFields);
    logger.debug('day=' + dayToLoad);

    AzureStorage.getData(req, res, hours, jumpByNFields, dayToLoad);
});

// get status of connection
router.post('/statusOfConnection', (req, res) => {
    // localhost connection returns false - it is OFFLINE by default
    if( req.body.ipAddress !== undefined ){
        res.send(false);
        return;
    }
    const url = constants.TECOROUTE_URL + constants.COMMAND_GET_OBJECT + constants.TECOAPI_STATUS;
    TecoApi.sendToTecoApi(url, req.body.username, req.body.password, res, null, TecoRoute.getRoutePLC(req.body.cookie), TecoRoute.getSoftPLC(req.body.cookie));
});

// ------------------------------------------------------------------------------- DEVELOPER ENDPOINTS
if (process.env.NODE_ENV !== 'production') {
    // http://192.168.134.176/TecoApi/GetList
    // localhost TecoApi request
    router.post('/TecoApi', (req, res) => {
        const url = 'http://' + req.body.ipAddress + '/TecoApi/' + req.body.command;
        logger.debug(url);
        TecoApi.sendToTecoApi(url, req.body.username, req.body.password, res, null);
    });

}
// ------------------------------------------------------------------------------- TESTING ENDPOINTS
/* GET home page. */
router.get('/express', function (req, res) {
    res.send('Answer from Express server.')
});

// Load list of SDSS.
router.get('/test', (req, res) => {
    let url = constants.TECOROUTE_URL + constants.COMMAND_GET_LIST;
    TecoRoute.sendToTecoApiViaTecoRoute(res, url, TECOROUTE_USERNAME, TECOROUTE_PW, TECOROUTE_PLC, TECOAPI_USERNAME, TECOAPI_PW, null);
});

// Performs login to testing account.
router.get('/tecoRouteLoginTest', (req, res) => TecoRoute.tecoRouteLogin(res, TECOROUTE_USERNAME, TECOROUTE_PW, TECOROUTE_PLC));

// Testing data download from Azure
router.get('/data', (req, res) => AzureStorage.test(req, res));

module.exports = router;
