// https://stackoverflow.com/questions/8595509/how-do-you-share-constants-in-nodejs-modules
module.exports = Object.freeze({
    //SDSS
    SDSS_ROOM_TEMPERATURE: 'releTemp_I_REA_NA_NA_Uk9PTTIK_VGVwbG9txJty',
    SDSS_THERM_TEMPERATURE: 'tempTherm_O_INT_m50_100_Uk9PTTIK_VGVwbG90YSB0ZXJtb3N0YXQ',
    SDSS_LEFT_LIGHT: 'light_O_REA_0_100_T2LDvXZhY8OtIHBva29q_TGV2w6EgTEVE',
    SDSS_THERM_STATE: 'thermState_O_BOO_0_1_Uk9PTTIK_VGVybW9zdGF0IE9OL09GRg',
    SDSS_ELECTRIC_SOCKET: 'socket_O_BOO_0_1_T2LDvXZhY8OtIHBva29q_WsOhc3V2a2E',
    SDSS_MAGNETIC_SWITCH: 'mgnSwitch_I_BOO_0_1_T2LDvXZhY8OtIHBva29q_RHZlxZllIHphdsWZZW55',
    // UTILS
    COOKIE_STRING: "RoutePLC={0};RouteLinkSave=;SoftPLC={1}",
    TECOROUTE_URL: "http://route.tecomat.com:61682/tecoapi/",
    // COMMANDS
    COMMAND_GET_OBJECT: "GetObject?",
    COMMAND_SET_OBJECT: "SetObject?",
    // LOGIN
    TECOROUTE_PW: "12345678",
    TECOROUTE_USERNAME: "miroslav.vana",
    TECOROUTE_PLC: "kufr01",
    TECOAPI_USERNAME: "admin",
    TECOAPI_PW: "admin",

    // Google assistant error response
    GA_ERROR_RESPONSE :  {
        "fulfillmentText": "This is a text response",
        "fulfillmentMessages": [
            {
                "text": {
                    "text": "Something went wrong."
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
                                "textToSpeech": "Something went wrong."
                            }
                        }
                    ]
                }
            }
        }
    }
});

// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// First, checks if it isn't implemented yet.
/** Allows us to insert String arguments in friendly way.*/
if (!String.prototype.format) {
    String.prototype.format = function () {
        let args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}