import React from 'react';
import axios from "axios";
import * as Constants from "./constants";
import {TECO_ROUTE_WITH_COOKIE_ENDPOINT} from "./GridItem";
import {getPostRequestWithNewCommand} from "./utils";

const logger = require('logplease').create('ConnectionStatus');
const INTERVAL_BETWEEN_STATUS_REFRESH = 5000;
const TIMEOUT = 6500;
const TECOAPI_STATUS = 'status';

export class ConnectionStatusCheck extends React.Component {
    state = {
        isConnectionOK: undefined
    };

    componentDidMount() {
        this.getStatus();
        this.interval = setInterval(() => {
            this.getStatus();
        }, INTERVAL_BETWEEN_STATUS_REFRESH);
    }

    getStatus() {
        logger.debug('Connection status check is refreshing.');
        let state = false;
        const axiosWithTimeout = axios.create({timeout: TIMEOUT,});
        // http://route.tecomat.com:61682/PAGE1.XML
        let requestData = getPostRequestWithNewCommand(this.props.postRequestData, Constants.COMMAND_GET_OBJECT + TECOAPI_STATUS);
        axiosWithTimeout.post(TECO_ROUTE_WITH_COOKIE_ENDPOINT, requestData).then((response) => {
            logger.info(response.data);
            if (response.data[Object.keys(response.data)] === true)
                state = true;
        }).catch((error) => logger.error(error)) // log error if catched
            .finally(() => this.setState({isConnectionOK: state})); // set state
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        if (this.state.isConnectionOK === undefined)
            return <div/>;

        let text = this.state.isConnectionOK === true ? 'ONLINE' : 'OFFLINE';
        let cssColor = this.state.isConnectionOK === true ? 'green' : 'red';
        return <div className={`connectionStatusFooter ${cssColor}`}>{text}</div>;
    }
}