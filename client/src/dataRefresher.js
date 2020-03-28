// SDSfreshDataMap

import React from 'react';
import axios from "axios";
import {TECO_ROUTE_WITH_COOKIE_ENDPOINT} from "./GridItem";
import {createSDSStoValueMap} from "./DataSourceUtils";

const logger = require('logplease').create('dataRefresher');
export const INTERVAL_BETWEEN_STATUS_REFRESH = 3000;
const TIMEOUT = 5000;

export class DataRefresher extends React.Component {
    state = {
        lastDataRefresh: undefined
    };

    componentDidMount() {
        this.refreshData();
        this.interval = setInterval(() => {
            this.refreshData();
        }, INTERVAL_BETWEEN_STATUS_REFRESH);
    }

    refreshData() {
        logger.debug('Connection status check is refreshing.');
        let requestData = JSON.parse(JSON.stringify(this.props.postRequestData));
        requestData['command'] = 'GetObject?' + this.props.selectedRoomEncoded;
        logger.debug(requestData);

        const axiosWithTimeout = axios.create({timeout: TIMEOUT,});
        // http://route.tecomat.com:61682/PAGE1.XML
        axiosWithTimeout.post(TECO_ROUTE_WITH_COOKIE_ENDPOINT, requestData).then((response) => {
            let roomData = response.data[this.props.selectedRoomEncoded];
            logger.info(roomData);
            // create and insert map
            let SDSSmap = createSDSStoValueMap(roomData);
            this.props.insertSDSSfreshDataMap(SDSSmap);
            this.setState({lastDataRefresh: new Date()});
        }).catch((error) => logger.error(error)); // log error if catched
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        if (this.state.lastDataRefresh === undefined)
            return <div/>;
        let dateTime = new Date();
        dateTime.toLocaleString();
        return <div className="connectionStatusFooterLeft"> {`Last refresh: ${this.state.lastDataRefresh.toLocaleTimeString()}`}</div>;
    }
}