import * as Constant from "./constants";
import axios from "axios";
import * as GridItem from "./components/gridItem";
import * as DataSourceUtils from "./dataSource/dataSourceUtils";

const logger = require('logplease').create('utils');

export const MAX_INT = 4294967295;
export const MIN_INT = -4294967295;

export function getPostRequestWithNewCommand(postRequestData, command) {
    let data = JSON.parse(JSON.stringify(postRequestData));
    data['command'] = command;
    return data;
}

export function getCurrentDataForDiagramPage() {
    let local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
}

export function returnLoginDataAsJson(isTecoRoute, username, pw, routeUsername, routePw, plcName, command, routePLC, softPLC, ipAddress) {
    if (isTecoRoute)
        return {
            username: username,
            password: pw,
            tecoRouteUsername: routeUsername,
            tecoRoutePw: routePw,
            plcName: plcName,
            command: command,
            routePLC: routePLC,
            softPLC: softPLC,
        };
    else
        return {
            ipAddress: ipAddress,
            username: username,
            password: pw,
            command: command,
        };
}

export function roundFloatValues(val) {
    if (isFloat(val))
        return val.toFixed(2);
    return val;
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

export function getUnitByItemType(itemType) {
    if (itemType === Constant.ITEM_TYPE_TEMP)
        return '°C';
    else if (itemType === Constant.ITEM_TYPE_HUMID)
        return '%';
    return '';
}

export function sendFirstRequestToTecoApi(isTecoRoute, prepareLoginData, stopLoader, setState) {

    let loginData = prepareLoginData(isTecoRoute, Constant.COMMAND_GET_LIST);
    if (isTecoRoute) {
        // perform TecoRoute LOGIN
        const axiosWithTimeout = axios.create({timeout: GridItem.REQUEST_TIMEOUT});
        axiosWithTimeout.post(GridItem.TECO_ROUTE_LOGIN_ENDPOINT, loginData).then((response) => {
            let routePLC = response.data.routePLC;
            let softPLC = response.data.softPLC;
            logger.debug("Received routePLC from TecoRoute login: " + routePLC);
            logger.debug("Received softPLC from TecoRoute login: " + softPLC);
            let loginDataWithCookie = prepareLoginData(isTecoRoute, Constant.COMMAND_GET_LIST, routePLC, softPLC);
            loadAllRooms(isTecoRoute, GridItem.TECO_ROUTE_WITH_COOKIE_ENDPOINT, loginDataWithCookie, stopLoader, setState);
        }).catch((error) => {
            stopLoader();
            if (error.response) {
                alert(error.response.data);
                logger.error(error.response.data);
            } else {
                alert('Login error, try it again please.');
                logger.error('Login error');
            }
        });
    } else
        loadAllRooms(isTecoRoute, GridItem.TECO_API_ENDPOINT, loginData, stopLoader, setState);
}


export function loadAllRooms(isTecoRoute, endPoint, data, stopLoader, setState) {
    const axiosWithTimeout = axios.create({timeout: GridItem.REQUEST_TIMEOUT,});
    axiosWithTimeout.post(endPoint, data).then((response) => {
        if (response.data.error !== undefined) {
            alert('Request failed. Error: ' + JSON.stringify(response.data.error));
            stopLoader();
            return;
        }
        // prepare room command
        let command = Constant.COMMAND_GET_OBJECT;
        for (let key in response.data)
            if (key.startsWith('ROOM_'))
                command = command + key + '&';
        command.slice(0, -1);
        logger.debug('Command to load all rooms: ' + command);
        // another request to load SDSS of rooms
        data = getPostRequestWithNewCommand(data, command);
        axiosWithTimeout.post(endPoint, data).then((response) => {
            if (response.data.error !== undefined) {
                alert('Request failed. Error: ' + JSON.stringify(response.data.error));
                stopLoader();
                return;
            }
            let SDSSArray = [];
            for (let room in response.data) {
                logger.info(room);
                for (let sdss in response.data[room])
                    SDSSArray.push(sdss);
            }
            logger.debug('SDSS from those rooms:' + SDSSArray);
            let map;
            try {
                map = DataSourceUtils.createRoomToSDSmap(SDSSArray);
            } catch (error) {
                alert(error);
            }
            setState({
                wasLoginSubmitted: false,
                roomToSDSmap: map,
                postRequestData: data
            })
        });
    }).catch((error) => {
        stopLoader();
        if (error.response) {
            alert(error.response.data);
            logger.error(error.response.data);
        } else {
            alert('Login error, try it again please.');
            logger.error('Login error');
        }
    });
}