
const SimpleDataSource = require('./SimpleDataSource').SimpleDataSource;

// DSS = Data Source String
/**
 * Creates room to SimpleDataSource map.
 * @param sDSList {Array.<String>} Where String is SimpleDataSourceString is string received from Forxtrot PLC. e.g. "LightK_O_REA_0_100_S3VjaHnFiA_U3bEm3Rsbw".
 * */
export function createRoomToSDSmap(sDSList) {
    let map = new Map();
    for (let key in sDSList) {
        //console.log(key);
        let simpleDataSource = "";
        try {
            simpleDataSource = new SimpleDataSource(key);
        }
        catch(error) {
            throw new Error(error);
        }
        const room = simpleDataSource.room;
        // adds SimpleDataSource to Array obtained by room
        if (map.has(room))
            map.get(room).push(simpleDataSource);
        // else creates new room
        else
            map.set(room, [simpleDataSource]);
    }
    return map;
}

export const BOOLEAN_DATA_TYPE = "BOO";

export const RED_LIGHT = "lightRed";
//module.exports.BOOLEAN_DATA_TYPE = BOOLEAN_DATA_TYPE;