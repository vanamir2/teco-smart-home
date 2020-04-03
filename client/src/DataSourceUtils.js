const SimpleDataSource = require('./SimpleDataSource').SimpleDataSource;
const logger = require('logplease').create('dataSourceUtils');

// DSS = Data Source String
/**
 * Creates room to SimpleDataSource map.
 * @param SDSSList {Array.<String>} Where String is SimpleDataSourceString is string received from Forxtrot PLC. e.g. "LightK_O_REA_0_100_S3VjaHnFiA_U3bEm3Rsbw".
 * */
export function createRoomToSDSmap(SDSSList) {
    let map = new Map();
    SDSSList.forEach((sdss) => {
        logger.debug(sdss);
        let simpleDataSource = "";
        try {
            simpleDataSource = new SimpleDataSource(sdss);
        } catch (error) {
            // be quiet on error - otherwise app will crash with any PUBLIC_API variable that does not correspond to our SDS schema.
        }
        const room = simpleDataSource.room;
        // adds SimpleDataSource to Array obtained by room
        if (map.has(room))
            map.get(room).push(simpleDataSource);
        else // else creates new room
            map.set(room, [simpleDataSource]);
    });
    return map;
}

export function createSDSStoValueMap(SDSSList) {
    let map = new Map();
    for (let key in SDSSList)
        if (SDSSList.hasOwnProperty(key))
            map.set(key, SDSSList[key]);
    return map;
}

export const BOOLEAN_DATA_TYPE = "BOO";

export const RED_LIGHT = "lightRed";
export const BLUE_LIGHT = "lightBlue";
export const GREEN_LIGHT = "lightGreen";
export const LIGHT = "light";