require("dotenv").config();

// https://stackoverflow.com/questions/8595509/how-do-you-share-constants-in-nodejs-modules
module.exports = Object.freeze({
    //SDSS
    // ROOM 2
    SDSS_ROOM_TEMPERATURE: 'ROOM_Um9vbSAy.temp_I_REA_NA_NA_Um9vbSAy_VGVtcGVyYXR1cmU',
    SDSS_THERM_TEMPERATURE: 'ROOM_Um9vbSAy.thermTemp_O_INT_m5_40_Um9vbSAy_VGhlcm1vc3RhdCB0ZW1w',
    SDSS_THERM_STATE: 'ROOM_Um9vbSAy.thermState_O_BOO_0_1_Um9vbSAy_VGhlcm1vc3RhdCBzdGF0ZQ',
    // obyvaci pokoj
    SDSS_LEFT_LIGHT: 'ROOM_Um9vbSAx.light_O_REA_0_100_Um9vbSAx_TGVmdCBMRUQ',
    SDSS_ELECTRIC_SOCKET: 'ROOM_Um9vbSAx.socket_O_BOO_0_1_Um9vbSAx_U29ja2V0',
    SDSS_MAGNETIC_SWITCH: 'ROOM_Um9vbSAx.mgnSwitch_I_BOO_0_1_Um9vbSAx_RG9vciBvcGVuZWQ',
    // UTILS
    COOKIE_STRING: "RoutePLC={0};RouteLinkSave=;SoftPLC={1}",
    TECOROUTE_URL: "http://route.tecomat.com:61682/tecoapi/",
    // COMMANDS
    COMMAND_GET_OBJECT: "GetObject?",
    COMMAND_GET_LIST: "GetList",
    COMMAND_SET_OBJECT: "SetObject?",
    // LOGIN
    TECOROUTE_PW: process.env.TECOROUTE_PW,
    TECOROUTE_USERNAME: process.env.TECOROUTE_USERNAME,
    TECOROUTE_PLC: process.env.TECOROUTE_PLC,
    TECOAPI_USERNAME: process.env.TECOAPI_USERNAME,
    TECOAPI_PW: process.env.TECOAPI_PW,
    // NUMBERS
    MEASUREMENTS_PER_HOUR: 60,

    // Google assistant error response
    GA_ERROR_RESPONSE: {
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