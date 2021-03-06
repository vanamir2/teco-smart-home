import React from 'react';
import axios from "axios";
import {TECO_API_ENDPOINT, TECO_ROUTE_WITH_COOKIE_ENDPOINT, ROOM_PREFIX} from "../components/gridItem";
import {createSDSStoValueMap} from "../dataSource/dataSourceUtils";
import * as Constants from "../constants";
import {getPostRequestWithNewCommand} from "../utils";

const logger = require('logplease').create('dataRefresher');
export const INTERVAL_BETWEEN_STATUS_REFRESH = 2000;
const TIMEOUT = 8000;

export class DataRefresher extends React.Component {
    // to prevent memory leak https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component
    _isMounted = false;
    state = {
        lastDataRefresh: undefined
    };

    componentDidMount() {
        this._isMounted = true;
        this.refreshData();
        this.interval = setInterval(() => {
            this.refreshData();
        }, INTERVAL_BETWEEN_STATUS_REFRESH);
    }

    refreshData() {
        logger.debug('Connection status check is refreshing.');
        let roomWithPrefix = ROOM_PREFIX + this.props.selectedRoomEncoded;
        let requestData = getPostRequestWithNewCommand(this.props.postRequestData, Constants.COMMAND_GET_OBJECT + roomWithPrefix);
        logger.debug(requestData);
        let ENDPOINT = requestData.ipAddress !== undefined ? TECO_API_ENDPOINT : TECO_ROUTE_WITH_COOKIE_ENDPOINT;

        const axiosWithTimeout = axios.create({timeout: TIMEOUT,});
        // http://route.tecomat.com:61682/PAGE1.XML
        axiosWithTimeout.post(ENDPOINT, requestData).then((response) => {
            let roomData = response.data[roomWithPrefix];
            logger.debug(roomData);
            // create and insert map
            let SDSSmap = createSDSStoValueMap(roomData);
            this.props.insertSDSSfreshDataMap(SDSSmap);
            if (this._isMounted)
                this.setState({lastDataRefresh: new Date()});
        }).catch((error) => logger.error(error)); // log error if catched
    }

    componentWillUnmount() {
        this._isMounted = false;
        clearInterval(this.interval);
    }

    render() {
        if (this.state.lastDataRefresh === undefined)
            return <div/>;
        let dateTime = new Date();
        dateTime.toLocaleString();
        return <div
            className="connectionStatusFooterLeft"> {`Last refresh: ${this.state.lastDataRefresh.toLocaleTimeString()}`}</div>;
    }
}