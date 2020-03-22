process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;
const express = require('express');
const router = express.Router();
const constants = require('../src/constants');

// https://github.com/haadcode/logplease
const Logger = require('logplease');
const logger = Logger.create('index');
Logger.setLogLevel(Logger.LogLevels.DEBUG);

const sendToTecoApiViaTecoRoute = require("../src/TecoRoute").sendToTecoApiViaTecoRoute;
const tecoRouteLogin = require("../src/TecoRoute").tecoRouteLogin;
const getSoftPLC = require("../src/TecoRoute").getSoftPLC;
const getRoutePLC = require("../src/TecoRoute").getRoutePLC;
const sendToTecoApi = require("../src/TecoApi").sendToTecoApi;
const handleWebHook = require("../src/GoogleAssistant").handleWebHook;
const test = require("../src/AzureStorage").test;
const getData = require("../src/AzureStorage").getData;

const TECOROUTE_PW = constants.TECOROUTE_PW;
const TECOROUTE_USERNAME = constants.TECOROUTE_USERNAME;
const TECOROUTE_PLC = constants.TECOROUTE_PLC;
const TECOAPI_USERNAME = constants.TECOAPI_USERNAME;
const TECOAPI_PW = constants.TECOAPI_PW;

/* GET home page. */
router.get('/express', function (req, res) {
    res.send('Answer from Express server.')
});

router.get('/test', (req, res) => {
    let url = "http://route.tecomat.com:61682/TecoApi/GetList";
    sendToTecoApiViaTecoRoute(res, url, TECOROUTE_USERNAME, TECOROUTE_PW, TECOROUTE_PLC, TECOAPI_USERNAME, TECOAPI_PW, null);
});
router.get('/testLongUri', (req, res) => {
    let url = "http://route.tecomat.com:61682/tecoapi/GetObject?light_O_REA_0_100_T2LDvXZhY8OtIHBva29q_TGV2w6EgTEVE&light_O_REA_0_100_T2LDvXZhY8OtIHBva29q_U3TFmWVkIGLDrWzDoSBMRUQ&light_O_REA_0_100_T2LDvXZhY8OtIHBva29q_xb1sdXTDoSBMRUQ";
    sendToTecoApiViaTecoRoute(res, url, TECOROUTE_USERNAME, TECOROUTE_PW, TECOROUTE_PLC, TECOAPI_USERNAME, TECOAPI_PW, null);
});
router.get('/tecoRouteLoginTest', (req, res) => {
    tecoRouteLogin(res, TECOROUTE_USERNAME, TECOROUTE_PW, TECOROUTE_PLC);
});

// pefroms login
router.post('/tecoRouteLogin', (req, res) => {
    logger.info('Request to endpoint \/tecoRouteLogin...' + req);
    tecoRouteLogin(res, req.body.tecoRouteUsername, req.body.tecoRoutePw, req.body.plcName);
});

// TecoRoute already logged, sends request to TecoApi
router.post('/TecoApiViaTecoRouteWithCookie', (req, res) => {
    const url = 'http://route.tecomat.com:61682/TecoApi/' + req.body.command;
    logger.info('Request to endpoint \/TecoApiViaTecoRouteWithCookie...' + url);
    logger.debug('Request body is= ' + JSON.stringify(req.body));
    sendToTecoApi(url, req.body.username, req.body.password, res, null, getRoutePLC(req.body.cookie), getSoftPLC(req.body.cookie));
});

// TecoRoute NOT logged yet, sends request to TecoApi
router.post('/TecoApiViaTecoRoute', (req, res) => {
    const url = 'http://route.tecomat.com:61682/TecoApi/' + req.body.command;
    logger.info('Request to endpoint \/TecoApiViaTecoRoute...' + url);
    logger.debug('Request to endpoint \/TecoApiViaTecoRoute. Request body is= ' + req.body);
    sendToTecoApiViaTecoRoute(res, url, req.body.tecoRouteUsername, req.body.tecoRoutePw, req.body.plcName, req.body.username, req.body.password);
});

//http://192.168.134.176/TecoApi/GetList
// localhost TecoApi request
router.post('/TecoApi', (req, res) => {
    const url = 'http://' + req.body.ipAddress + '/TecoApi/' + req.body.command;
    console.log(url);
    sendToTecoApi(url, req.body.username, req.body.password, res, null);
});

// webhook test - request is accepted
router.post('/webhook', (req, res) => {
    handleWebHook(req, res);
});

// download data from Azure
router.get('/data', (req, res) => {
    let hours = 1;
    let jumpByNFields = 1;
    // test(req, res);
    getData(req, res, hours, jumpByNFields);
});

// download data from Azure
router.post('/data', (req, res) => {
    let hours = req.body.hours;
    let jumpByNFields = req.body.jumpByNFields;
    let dayToLoad = req.body.day;

    logger.debug('Hours=' + hours );
    logger.debug('jumpByNFields=' + jumpByNFields);
    logger.debug('day=' + dayToLoad);

    // test(req, res);
    getData(req, res, hours, jumpByNFields, dayToLoad);
});


module.exports = router;
