const constants = require('./constants');
const logger = require('logplease').create('GoogleAssistant');
const sendToTecoApiViaTecoRoute = require("./tecoRoute").sendToTecoApiViaTecoRoute;

module.exports.handleWebHook = (req, res) => {
    const action = req.body.queryResult.action;
    logger.debug('Invoked action = ' + action);
    logger.debug(req.body);

    let url = constants.TECOROUTE_URL;
    let doOnSuccess = null;

    switch (action) {
        //--------------------------------------- GET VALUE
        case 'getRoomTemperature':
            url = url + constants.COMMAND_GET_OBJECT + constants.SDSS_ROOM_TEMPERATURE;
            doOnSuccess = (number) => res.send(createTextResponse('Temperature is ' + number.toFixed(1) + ' degrees of celsius.'));
            break;
        case 'isSocketOn':
            url = url + constants.COMMAND_GET_OBJECT + constants.SDSS_ELECTRIC_SOCKET;
            doOnSuccess = (state) => res.send(createTextResponse("The electric socket is " + (state === true ? "on." : "off.")));
            break;
        case 'isDoorOpen':
            url = url + constants.COMMAND_GET_OBJECT + constants.SDSS_MAGNETIC_SWITCH;
            doOnSuccess = (state) => res.send(createTextResponse("The door is " + (state !== true ? "open." : "closed.")));
            break;
        //--------------------------------------- SET VALUE
        case 'lightOn':
            url = url + constants.COMMAND_SET_OBJECT + constants.SDSS_LEFT_LIGHT + '=100';
            doOnSuccess = () => res.send(createTextResponse("Light is on."));
            break;
        case 'lightOff':
            url = url + constants.COMMAND_SET_OBJECT + constants.SDSS_LEFT_LIGHT + '=0';
            doOnSuccess = () => res.send(createTextResponse("Light is off."));
            break;
        case 'thermostatOff':
            url = url + constants.COMMAND_SET_OBJECT + constants.SDSS_THERM_STATE + '=false';
            doOnSuccess = () => res.send(createTextResponse("Thermostat is off."));
            break;
        case 'thermostatOn':
            url = url + constants.COMMAND_SET_OBJECT + constants.SDSS_THERM_STATE + '=true';
            doOnSuccess = () => sendPredefinedRequst(res, constants.TECOROUTE_URL + constants.COMMAND_GET_OBJECT + constants.SDSS_THERM_TEMPERATURE,
                (number) => res.send(createTextResponse("Do you want to change temperature from " + number + ' degrees of celsius?')));
            break;
        case 'thermostatOn.yes':
        case 'setRoomTemperature':
            let temperature = req.body.queryResult.parameters.number;
            logger.debug("Change temperature on thermostat to " + temperature);
            url = url + constants.COMMAND_SET_OBJECT + constants.SDSS_THERM_TEMPERATURE + '=' + temperature;
            doOnSuccess = () => res.send(createTextResponse("OK. Changed."));
            break;
        case 'turnSocketOff':
            url = url + constants.COMMAND_SET_OBJECT + constants.SDSS_ELECTRIC_SOCKET + '=false';
            doOnSuccess = () => res.send(createTextResponse("Turned off."));
            break;
        case 'turnSocketOn':
            url = url + constants.COMMAND_SET_OBJECT + constants.SDSS_ELECTRIC_SOCKET + '=true';
            doOnSuccess = () => res.send(createTextResponse("Turned on."));
            break;
    }

    // send response
    if (doOnSuccess !== null)
        sendPredefinedRequst(res, url, doOnSuccess);
    else
        res.send(createTextResponse("Action " + action + " is not implemented."));
};


function sendPredefinedRequst(res, url, doOnSuccess) {
    sendToTecoApiViaTecoRoute(res, url, constants.TECOROUTE_USERNAME, constants.TECOROUTE_PW, constants.TECOROUTE_PLC, constants.TECOAPI_USERNAME, constants.TECOAPI_PW, doOnSuccess);
}

// https://www.youtube.com/watch?v=enplPV8_uuM
// https://github.com/raparri01/DialogFlowVideos/blob/master/routes/weather.js

// FULL RESPOSNE IS HERE:
// https://cloud.google.com/dialogflow/docs/fulfillment-how#webhook_request
function createTextResponse(textResponse) {
    return {
        "fulfillmentText": "This is a text response",
        "fulfillmentMessages": [
            {
                "text": {
                    "text": [textResponse]
                }
            }
        ],
        "source": "example.com",
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [
                        {
                            "simpleResponse": {
                                "textToSpeech": textResponse
                            }
                        }
                    ]
                }
            }
        }
    };
}