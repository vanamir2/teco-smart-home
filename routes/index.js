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

/** Performs TecoRoute login based on username, pw and plcName.<br/>
 * See apiary documentation for more info: {@link https://tecosmarthome.docs.apiary.io/}.
 * */
router.post('/tecoRouteLogin', (req, res) => {
    TecoRoute.tecoRouteLogin(res, req.body.tecoRouteUsername, req.body.tecoRoutePw, req.body.plcName);
});

/** TecoRoute already logged.
 *  Performs TecoApi request via TecoRoute service based on username, pw, routePLC, softPLC and command.<br/>
 * See apiary documentation for more info: {@link https://tecosmarthome.docs.apiary.io/}.
 * */
router.post('/tecoApiViaTecoRouteWithCookie', (req, res) => {
    const url = constants.TECOROUTE_URL + req.body.command;
    logger.debug('Request body is= ' + JSON.stringify(req.body));
    TecoApi.sendToTecoApi(url, req.body.username, req.body.password, res, null, req.body.routePLC, req.body.softPLC);
});

/** TecoRoute NOT logged yet. TecoApi requests through TecoRoute without login cookie.<br/>
 *  Performs TecoApi request via TecoRoute service (with new login) based on credentials and command.<br/>
 * See apiary documentation for more info: {@link https://tecosmarthome.docs.apiary.io/}.
 * */
router.post('/tecoApiViaTecoRoute', (req, res) => {
    const url = 'http://route.tecomat.com:61682/TecoApi/' + req.body.command;
    logger.debug('Request body= ' + req.body);
    TecoRoute.sendToTecoApiViaTecoRoute(res, url, req.body.tecoRouteUsername, req.body.tecoRoutePw, req.body.plcName, req.body.username, req.body.password);
});

/** Dialogflow webhook to use Google Assistant.<br/>
 * See apiary documentation for more info: {@link https://tecosmarthome.docs.apiary.io/}.
 * */
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

// ------------------------------------------------------------------------------------------------- DEVELOPER ENDPOINTS
if (process.env.NODE_ENV !== 'production') {
    /** Performs localhost TecoApi request based on username, pw, ipAddress and command.<br/>
     * See apiary documentation for more info: {@link https://tecosmarthome.docs.apiary.io/}.
     * */
    router.post('/tecoApi', (req, res) => {
        //     // http://192.168.134.176/TecoApi/GetList
        const url = 'http://' + req.body.ipAddress + '/TecoApi/' + req.body.command;
        logger.debug(url);
        TecoApi.sendToTecoApi(url, req.body.username, req.body.password, res, null);
    });

    // ------------------------------------------------------------------------------- TESTING ENDPOINTS
    // Load list of SDSS.
    router.get('/test', (req, res) => {
        let url = constants.TECOROUTE_URL + constants.COMMAND_GET_LIST;
        TecoRoute.sendToTecoApiViaTecoRoute(res, url, TECOROUTE_USERNAME, TECOROUTE_PW, TECOROUTE_PLC, TECOAPI_USERNAME, TECOAPI_PW, null);
    });

    // Performs login to testing account.
    router.get('/tecoRouteLoginTest', (req, res) => TecoRoute.tecoRouteLogin(res, TECOROUTE_USERNAME, TECOROUTE_PW, TECOROUTE_PLC));

    // Testing data download from Azure
    router.get('/data', (req, res) => AzureStorage.test(req, res));
}

/* GET home page. */
router.get('/express', function (req, res) {
    res.send('Answer from Express server.')
});

module.exports = router;
