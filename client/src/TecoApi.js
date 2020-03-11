import axios from "axios";
import {REQUEST_TIMEOUT, TECO_API_ENDPOINT, TECO_ROUTE_WITH_COOKIE_ENDPOINT} from "./GridItem";

const logger = require('logplease').create('TecoApi');

// Command e.g. GetObject?ROOM2_TEMPERATURE_IN_releTemp&plcData
export function getValueFromTecoApi(postRequestData, command, resolve) {
    const axiosWithTimeout = axios.create({timeout: REQUEST_TIMEOUT,});

    // deep copy of postRequestData
    let data = JSON.parse(JSON.stringify(postRequestData));
    data['command'] = command;
    logger.info(data);
    let endPoint = data['plcName'] !== undefined ? TECO_ROUTE_WITH_COOKIE_ENDPOINT : TECO_API_ENDPOINT;

    axiosWithTimeout.post(endPoint, data).then((response) => {
        if (response.data.error !== undefined)
            logger.error('Request to read data failed. Error: ' + JSON.stringify(response.data.error));
        console.log(response.data);
        resolve(response.data);
    }).catch((error) => {
        if (error.response)
            logger.error(error.response.data);
        else
            logger.error('No answer from PLC: ' + data);
    });
}