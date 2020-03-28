const fetch = require('node-fetch');
const logger = require('logplease').create('TecoApi');
const md5 = require("md5");
const constants = require('./constants');

const CNONCE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TECOAPI_REALM = "TecoApi";
const TECOAPI_QOP = "auth";
const TECOAPI_HTTP_METHOD = 'GET';

function hasLoginError(data, res) {
    if (data.status === 403) {
        res.status(403).send('TecoRoute login expired. Please perform new login.');
        return true;
    }
    return false;
}

/**
 * Sends request to target URL with use of DAA. DAA is calculated based on username and password.
 *
 * @param targetUrl {!String} defines request and where to send this request. E.g. http://route.tecomat.com:61682/TecoApi/GetList.
 * @param username {!String} Username defined on PLC to access web services (webmaker Username - defined in Mosaic).
 * @param password {!String} Password defined on PLC to access web services (webmaker PW - defined in Mosaic).
 * @param res {!Object} Holds connection object to send result back to user/front-end.
 * @param doOnSuccess {Function} Call-back function declaration which is called onSuccesfull request.
 * @param routePLC {String} First part of a cookie which is needed when accessing TecoApi via TecoRoute.
 * @param softPLC {String} Second part of a cookie which is needed when accessing TecoApi via TecoRoute.
 *
 * */
module.exports.sendToTecoApi = function sendToTecoApi(targetUrl, username, password, res, doOnSuccess, routePLC, softPLC) {
    logger.debug('---- Sending 1st request to TecoApi');
    fetch(targetUrl, {headers: {Cookie: constants.COOKIE_STRING.format(routePLC, softPLC)},}).then(data => {
        if (hasLoginError(data, res)) return;
        logger.debug('Data received from 1st TecoApi request. Its status is: ' + data.status);
        logger.debug(data);
        const authorizationTemplate = getAuthorizationTemplate(data.headers, targetUrl, username, password);
        logger.debug('---- Sending 2nd request to TecoApi');
        return fetch(targetUrl, {
            headers: {
                'Authorization': authorizationTemplate,
                Cookie: constants.COOKIE_STRING.format(routePLC, softPLC),
            }
        }).then((res) => res.text())
            .then((text) => text.length ? JSON.parse(text) : {})
            .then(data => {
                logger.debug('Data received from 2st TecoApi request.');
                logger.debug(data);
                if (data.error !== undefined) {
                    res.status(500).send("Error while performing TecoApi request.\n\nError=" + JSON.stringify(data.error));
                }
                if (doOnSuccess === null || doOnSuccess === undefined)
                    res.send(data);
                else
                    doOnSuccess(Object.values(data)[0]);
            })
    }).catch(e => {
        logger.error(e);
        if (doOnSuccess === null)
            res.status(401).send('Error while performing TecoApi request. Try to refresh page and perform new login.');
        else
            res.send(constants.GA_ERROR_RESPONSE);
    });
};

/** Generates cnonce of requested length from ASCII character set. */
function generateCnonce(length) {
    let result = '';
    const charactersLength = CNONCE_CHARACTERS.length;
    for (var i = 0; i < length; i++)
        result += CNONCE_CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
    logger.debug("cnonce=" + result);
    return result;
}

/* Returns www-auth header. **/
function getWwwAuthenticate(headers) {
    const wwwAuthenticate = headers.get('www-authenticate');
    logger.debug("wwwAuth=" + wwwAuthenticate);
    return wwwAuthenticate;
}

/* Returns nonce from www-auth. **/
function getNonce(wwwAuthenticate) {
    const nonce = /nonce="([^"]+)"/g.exec(wwwAuthenticate)[1];
    logger.debug("nonce=" + nonce);
    return nonce;
}

/* Returns opaque from www-auth. **/
function getOpaque(wwwAuthenticate) {
    const opaque = /opaque="([^"]+)"/g.exec(wwwAuthenticate)[1];
    logger.debug("opaque=" + opaque);
    return opaque;
}

/** Returns URI separated from URL and host+port. E.g. "/TecoApi/GetList" */

function getUri(url) {
    const URI = url.replace(/http:\/\/[0-9.]*/, "").replace(/route.tecomat.com:61682/, "");
    logger.debug("URI=" + URI);
    return URI;
}

/** Returns hash calculated to perform DAA request.
 * @see https://en.wikipedia.org/wiki/Digest_access_authentication*/
function getDaaHash(username, password, uri, nonce, nc, cnonce) {
    const ha1 = md5(username + ":" + TECOAPI_REALM + ":" + password);
    logger.debug('Hash1: ' + ha1);
    const ha2 = md5(TECOAPI_HTTP_METHOD + ":" + uri);
    logger.debug('Hash2: ' + ha2);
    const hash = md5(ha1 + ":" + nonce + ":" + nc + ":" + cnonce + ":" + TECOAPI_QOP + ":" + ha2);
    logger.debug('Final hash: ' + hash);
    return hash;
}

/** Builds whole authorization string used in Digest Access Authentication.*/
function getAuthorizationTemplate(headers, targetUrl, username, password) {
    const nc = "00000001";
    let uri = getUri(targetUrl);
    const wwwAuthenticate = getWwwAuthenticate(headers);
    const nonce = getNonce(wwwAuthenticate);
    const opaque = getOpaque(wwwAuthenticate);
    const cnonce = generateCnonce(44);
    const hash = getDaaHash(username, password, uri, nonce, nc, cnonce);
    const authorizationTemplate = `Digest username="${username}", realm="${TECOAPI_REALM}", nonce="${nonce}", uri="${uri}", cnonce="${cnonce}", nc=${nc}, qop=${TECOAPI_QOP}, response="${hash}", opaque="${opaque}"`;
    logger.info("Authorization template=" + authorizationTemplate);
    return authorizationTemplate;
}