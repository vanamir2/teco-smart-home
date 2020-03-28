import React from 'react';
import axios from "axios";
import {SimpleDataSource} from "./SimpleDataSource";

export const TECO_ROUTE_LOGIN_ENDPOINT = '/tecoRouteLogin';
export const TECO_API_ENDPOINT = '/TecoApi';
export const TECO_ROUTE_WITH_COOKIE_ENDPOINT = '/TecoApiViaTecoRouteWithCookie';
export const REQUEST_TIMEOUT = 7000;
import {INTERVAL_BETWEEN_STATUS_REFRESH} from './dataRefresher'
export const ROOM_PREFIX = 'ROOM_';

const logger = require('logplease').create('GridItem');

// při založení tlačítka se mu předá property onClick, které bude zajišťovat reakci na stisk
export function ActionButton(props) {
    return (
        // u Function komponent uz nemusi but lambda notace " () => "
        <div className="signUp">
            <a href="/#">
                <div onClick={props.onClick}>
                    {props.text}
                </div>
            </a>
        </div>
    );
}

export class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            onClick: props.onClick,
        };
    }

    render() {
        // the 1st tag is to make it click-able
        return (
            <a href={"/#"} className="grid-item" onClick={() => {
                this.state.onClick();
                //console.log('AKTIVNI CHAT UVNITR CHAT ELEMENTU: ' + this.state.activeChat());
            }}>
                <div>
                    {this.state.name}
                </div>
            </a>
        );
    }
}

// http://route.tecomat.com:61682/TecoApi/GetObject?ROOM_T2LDvXZhY8OtIHBva29q.light_O_REA_0_100_T2LDvXZhY8OtIHBva29q_TGV2w6EgTEVE
function getRoomPrefixSelectorFromSDSS(sdss){
    return ROOM_PREFIX + new SimpleDataSource(sdss).roomBase64 + '.'
}

// TODO - refactor to tecoApi.js
function setValueToTecoApi(postRequestData, itemId, valueToSet, onSucces) {
    const axiosWithTimeout = axios.create({timeout: REQUEST_TIMEOUT});

    // deep copy of postRequestData
    let data = JSON.parse(JSON.stringify(postRequestData));
    data['command'] = 'SetObject?' + getRoomPrefixSelectorFromSDSS(itemId) + itemId + '=' + valueToSet;
    console.log(data);
    let endPoint = data['plcName'] !== undefined ? TECO_ROUTE_WITH_COOKIE_ENDPOINT : TECO_API_ENDPOINT;

    axiosWithTimeout.post(endPoint, data).then((response) => {
        if (response.data.error !== undefined) {
            alert('Request to read data failed. Error: ' + JSON.stringify(response.data.error));
            return;
        }
        onSucces(valueToSet);
    }).catch((error) => {
        if (error.response) {
            alert(error.response.data);
            console.log(error.response.data);
        } else {
            alert('No answer from PLC: ' + data);
        }
    });
}

export class Light extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            name: props.name,
            onClick: props.onClick,
            value: "",
            lastUserCall: 0,
        };
        this.setValueAfterSuccessfulCall = this.setValueAfterSuccessfulCall.bind(this);
    }

    setValueAfterSuccessfulCall(valueToSet) {
        this.setState({
            value: valueToSet,
            lastUserCall: getCurrentTimeInMs(),
        })
    }

    // set value
    switchOnOff() {
        const valueToSet = this.state.value > 0 ? 0 : 100;
        setValueToTecoApi(this.props.postRequestData, this.props.id, valueToSet, this.setValueAfterSuccessfulCall)
    }

    // TODO - toto je stejne jako gridItem BooleanGridItem
    render() {
        // Set newer value if it wasnt already refreshed by user click.
        let wasInputLoadedFromUserRequest = getCurrentTimeInMs() < this.state.lastUserCall + INTERVAL_BETWEEN_STATUS_REFRESH;
        if (!wasInputLoadedFromUserRequest && this.props.newValue !== undefined && this.props.newValue !== this.state.value)
            this.setState({value: this.props.newValue});
        // the 1st tag is to make it click-able
        return (
            <a href={"/#"} className="grid-item" onClick={() => {
                this.switchOnOff();
                //console.log('AKTIVNI CHAT UVNITR CHAT ELEMENTU: ' + this.state.activeChat());
            }}>
                <div>
                    {this.state.name}{' - ' + this.state.value}
                </div>
            </a>
        );
    }
}

export class RedLight extends Light {

    render() {
        let src = "redLightOff.png";
        let fontColor = "";

        // Set newer value if it wasnt already refreshed by user click.
        let wasInputLoadedFromUserRequest = getCurrentTimeInMs() < this.state.lastUserCall + INTERVAL_BETWEEN_STATUS_REFRESH;
        if (!wasInputLoadedFromUserRequest && this.props.newValue !== undefined && this.props.newValue !== this.state.value)
            this.setState({value: this.props.newValue});
        // the 1st tag is to make it click-able
        if (this.state.value === 100) {
            src = "redLightOn.png";
            fontColor = "red-font";
        }

        return (
            <div className="grid-item">
                <a href={"/#"} onClick={() => this.switchOnOff()}>
                    <div className={"leftColumnBigger"}>
                        <div className={fontColor}>{this.state.name + ' '}</div>
                    </div>
                    <div className="rightColumn2">
                        <img className="margin" height="32" width="32" src={src} alt="Logo"/>
                    </div>
                </a>
            </div>
        );
    }
}

export class ReadOnly extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            name: props.name,
            onClick: props.onClick,
            value: "",
            lastUserCall: 0,
        };
        this.setValueAfterSuccessfulCall = this.setValueAfterSuccessfulCall.bind(this);
    }

    setValueAfterSuccessfulCall(valueToSet) {
        this.setState({
            value: valueToSet,
            lastUserCall: getCurrentTimeInMs(),
        })
    }

    render() {
        // Set newer value if it wasnt already refreshed by user click.
        let wasInputLoadedFromUserRequest = getCurrentTimeInMs() < this.state.lastUserCall + INTERVAL_BETWEEN_STATUS_REFRESH;
        if (!wasInputLoadedFromUserRequest && this.props.newValue !== undefined && this.props.newValue !== this.state.value)
            this.setState({value: this.props.newValue});
        // the 1st tag is to make it click-able
        return (
            <div className="grid-item">
                {this.state.name}{' - ' + this.state.value}
            </div>
        );
    }
}


export class ThermostatValue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            name: props.name,
            value: "",
            isStateSetValue: false,
            valueToSet: "",
            lastUserCall: 0,
        };
        this.handleChange = this.handleChange.bind(this);
        this.changeState = this.changeState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setValueAfterSuccessfulCall = this.setValueAfterSuccessfulCall.bind(this);
    }

    changeState() {
        this.setState({isStateSetValue: !this.state.isStateSetValue});
    }

    // univerzalni vyhodnoceni toho jakou property vzit
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    setValueAfterSuccessfulCall(valueToSet) {
        this.setState({
            value: valueToSet,
            lastUserCall: getCurrentTimeInMs(),
        })
    }

    handleSubmit(event) {
        event.preventDefault();
        setValueToTecoApi(this.props.postRequestData, this.props.id, this.state.valueToSet, this.setValueAfterSuccessfulCall);
        this.changeState();
    }

    render() {
        // Set newer value if it wasnt already refreshed by user click.
        let wasInputLoadedFromUserRequest = getCurrentTimeInMs() < this.state.lastUserCall + INTERVAL_BETWEEN_STATUS_REFRESH;
        if (!wasInputLoadedFromUserRequest && this.props.newValue !== undefined && this.props.newValue !== this.state.value)
            this.setState({value: this.props.newValue});
        let innerSpace = [];
        if (!this.state.isStateSetValue) {
            innerSpace.push(
                <a key={"SUB"} href={"/#"} onClick={() => {
                    this.changeState();
                    //console.log('AKTIVNI CHAT UVNITR CHAT ELEMENTU: ' + this.state.activeChat());
                }}>
                    <div>
                        {this.state.name}{' - ' + this.state.value + ' °C'}
                    </div>
                </a>
            );
        } else {
            innerSpace.push(
                <div key={"SUB"} className="set-value-item-form">
                    <form className="set-value-item-form" onSubmit={this.handleSubmit}>
                        <input className="set-value-item-text" type="text" value={this.state.valueToSet}
                               onChange={this.handleChange}
                               name="valueToSet" placeholder="Value (°C)" required/>
                        <input className="set-value-item-btn" type="submit" value="Set"/>
                        <button onClick={() => this.changeState()} type="button"
                                className="set-value-item-cancel">X
                        </button>
                    </form>
                </div>
            );
        }

        return (
            <div className="grid-item">
                {innerSpace}
            </div>
        );
    }
}

export class BooleanGridItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            name: props.name,
            value: "",
            lastUserCall: 0,
        };
        this.setValueAfterSuccesfulCall = this.setValueAfterSuccesfulCall.bind(this);
    }

    setValueAfterSuccesfulCall(valueToSet) {
        this.setState({
            value: valueToSet,
            lastUserCall: getCurrentTimeInMs(),
        })
    }

    // set value
    switchOnOff() {
        const valueToSet = !this.state.value;
        setValueToTecoApi(this.props.postRequestData, this.props.id, valueToSet, this.setValueAfterSuccesfulCall)
    }

    render() {
        // Set newer value if it wasnt already refreshed by user click.
        let wasInputLoadedFromUserRequest = getCurrentTimeInMs() < this.state.lastUserCall + INTERVAL_BETWEEN_STATUS_REFRESH;
        if (!wasInputLoadedFromUserRequest && this.props.newValue !== undefined && this.props.newValue !== this.state.value)
            this.setState({value: this.props.newValue});
        // the 1st tag is to make it click-able
        return (
            <a href={"/#"} className="grid-item" onClick={() => {
                this.switchOnOff();
                //console.log('AKTIVNI CHAT UVNITR CHAT ELEMENTU: ' + this.state.activeChat());
            }}>
                <div>
                    {this.state.name}{' - ' + this.state.value}
                </div>
            </a>
        );
    }
}

// from UNIX EPOCH
function getCurrentTimeInMs() {
    return new Date().getTime();
}
