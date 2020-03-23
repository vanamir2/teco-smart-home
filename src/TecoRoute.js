const fetch = require('node-fetch'); // https://www.npmjs.com/package/node-fetch
const logger = require('logplease').create('TecoRoute');
const crypto = require('crypto'); // SHA1
const sendToTecoApi = require("./tecoApi").sendToTecoApi;
var constants = require('./constants');

const TECOROUTE_LOGIN_TEMPLATE = "USER={0}&PASS={1}&PLC={2}";
const TECOROUTE_URL = "http://route.tecomat.com:61682/TR_LOGIN.XML";

function isStatusOk(res, reject, result) {
    if (res.status === 500) {
        if (reject !== undefined)
            reject("Rejected. PLC is offline. Ensure that PLC is connected to network and try it again.");
        else
            result.status(500).send('PLC is offline. Ensure that PLC is connected to network and try it again.');
        return false;
    }
    if (res.status === 200) {
        if (reject !== undefined)
            reject("TecoRoute - login or PLC name is incorrect.");
        else
            result.status(500).send("TecoRoute - login or PLC name is incorrect.");
        return false;
    }
    return true;
}

/** Returns cookie necessary to log via tecoRoute. */
module.exports.tecoRouteLogin = function tecoRouteLogin(result, tecoRouteUsername, tecoRoutePw, tecoRoutePlc, resolve, reject) {
    logger.debug("--------------- TecoRoute LOGIN - sending 1st request ---------------------");
    fetch(TECOROUTE_URL, {redirect: 'manual'}).then(res => {
        logger.debug("TecoRoute login - processing 1st request. Its status is: " + res.status);
        let routePLC = module.exports.getRoutePLC(getCookieString(res.headers));
        let tecoRouteLogin = getTecoRouteLogin(res, tecoRoutePw, tecoRouteUsername, tecoRoutePlc, routePLC);
        // 2nd request - send cookies (RoutePLC,RouteLinkSave) and formData(username,password,PLC name)
        fetch(TECOROUTE_URL, getTecoRoute2ndRequest(routePLC, tecoRouteLogin)).then(res => {
            logger.debug("TecoRoute login - processing 2st request. Its status is: " + res.status);
            if (!isStatusOk(res, reject, result))
                return;
            let softPLC = module.exports.getSoftPLC(getCookieString(res.headers));
            if (resolve !== undefined)
                resolve({"routePLC": routePLC, "softPLC": softPLC});
            else
                result.send(constants.COOKIE_STRING.format(routePLC, softPLC));
        });
    }).catch(e => {
        logger.error(e);
        if (doOnSuccess === null)
            result.status(401).send('Error while performing TecoRoute request.');
        else
            result.send(constants.GA_ERROR_RESPONSE);
    });
};

/** Sends request to TecoApi through TecoRoute service and performs new login. */
module.exports.sendToTecoApiViaTecoRoute = function sendToTecoApiViaTecoRoute(result, url, tecoRouteUsername, tecoRoutePw, tecoRoutePlc, tecoApiUsername, tecoApiPw, doOnSuccess) {
    new Promise((resolve, reject) => {
        module.exports.tecoRouteLogin(null, tecoRouteUsername, tecoRoutePw, tecoRoutePlc, resolve, reject)
    }).then((data) => {
        logger.debug("Received data from tecoRouteLogin =" + data);
        sendToTecoApi(url, tecoApiUsername, tecoApiPw, result, doOnSuccess, data["routePLC"], data["softPLC"]);
    }).catch((error) => {
        logger.error("Received ERROR from tecoRouteLogin: " + error);
        if (doOnSuccess === null || doOnSuccess === undefined)
            result.status(401).send("Received ERROR from tecoRouteLogin: " + error);
        else
            result.send(constants.GA_ERROR_RESPONSE);
    });
};

/** Replaces tecoRoute login form. Returns same string format as original tecoRouteLogin.  */
function getTecoRouteLogin(res, tecoRoutePw, tecoRouteUsername, tecoRoutePlc, routePLC) {
    const PASS = getSHA1Hash(routePLC + tecoRoutePw);
    const tecoRouteLogin = TECOROUTE_LOGIN_TEMPLATE.format(tecoRouteUsername, PASS, tecoRoutePlc);
    logger.info("loginFormBody=" + tecoRouteLogin);
    return tecoRouteLogin;
}

function getTecoRoute2ndRequest(routePLC, tecoRouteLogin) {
    return {
        redirect: 'manual',
        method: 'POST',
        headers: {Cookie: 'RoutePLC=' + routePLC + '; RouteLinkSave='},
        body: tecoRouteLogin
    };
}

module.exports.getRoutePLC = function getRoutePLC(string) {
    let a = string.indexOf("RoutePLC=") + 9;
    let b = string.indexOf(";", a);
    if (b === -1) b = string.length;
    let routePLC = unescape(string.substring(a, b));
    logger.info("RoutePLC=" + routePLC);
    return routePLC;
};

module.exports.getSoftPLC = function getSoftPLC(string) {
    let a = string.indexOf("SoftPLC=") + 8;
    let b = string.indexOf(";", a);
    if (b === -1) b = string.length;
    let softPLC = unescape(string.substring(a, b));
    logger.info("SoftPLC=" + softPLC);
    return softPLC;
};

/** Returns String with cookies separated from result header.
 *  E.g. "RoutePLC=67022671; RouteLinkSave=; SoftPLC=10342317"
 */
function getCookieString(headers) {
    let cookie = headers.raw()['set-cookie'];
    logger.info("set-cookie=" + cookie);
    if (cookie === undefined)
        throw new Error("Cookie was not obtained from TecoRoute server. Error occurred.");
    return cookie.toString();
}

/** PW = SHA1(RoutePLC+password) ... same as http://www.sha1-online.com/*/
function getSHA1Hash(string) {
    const hash = crypto.createHash('sha1').update(string).digest('hex');
    logger.info("SHA1 hash=" + hash);
    return hash;
}

