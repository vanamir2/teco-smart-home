import React from 'react';
import axios from "axios";

export const TECO_ROUTE_LOGIN_ENDPOINT = '/tecoRouteLogin';
export const TECO_API_ENDPOINT = '/TecoApi';
export const TECO_ROUTE_WITH_COOKIE_ENDPOINT = '/TecoApiViaTecoRouteWithCookie';
export const REQUEST_TIMEOUT = 7000;

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

// TODO - refactor to TecoApi.js
function getValueFromTecoApi(postRequestData, itemId, processData) {
    const axiosWithTimeout = axios.create({timeout: REQUEST_TIMEOUT,});

    // deep copy of postRequestData
    let data = JSON.parse(JSON.stringify(postRequestData));
    data['command'] = 'GetObject?' + itemId;
    logger.debug(data);
    let endPoint = data['plcName'] !== undefined ? TECO_ROUTE_WITH_COOKIE_ENDPOINT : TECO_API_ENDPOINT;

    axiosWithTimeout.post(endPoint, data).then((response) => {
        if (response.data.error !== undefined) {
            alert('Request to read data failed. Error: ' + JSON.stringify(response.data.error));
            return;
        }
        console.log(response.data);
        let value = response.data[itemId];
        console.log(value);
        processData(value);
    }).catch((error) => {
        if (error.response) {
            alert(error.response.data);
            console.log(error.response.data);
        } else
            alert('No answer from PLC: ' + data);
    });
}

// TODO - refactor to TecoApi.js
function setValueToTecoApi(postRequestData, itemId, valueToSet, onSucces) {
    const axiosWithTimeout = axios.create({timeout: REQUEST_TIMEOUT});

    // deep copy of postRequestData
    let data = JSON.parse(JSON.stringify(postRequestData));
    data['command'] = 'SetObject?' + itemId + '=' + valueToSet;
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
        };
        this.setValueAfterSuccesfullCall = this.setValueAfterSuccesfullCall.bind(this);
        this.loadCurrentValue();
    }

    setValueAfterSuccesfullCall(valueToSet) {
        this.setState({value: valueToSet})
    }

    // GET VALUE
    loadCurrentValue() {
        getValueFromTecoApi(this.props.postRequestData, this.props.id, this.setValueAfterSuccesfullCall)
    }

    // set value
    switchOnOff() {
        const valueToSet = this.state.value > 0 ? 0 : 100;
        setValueToTecoApi(this.props.postRequestData, this.props.id, valueToSet, this.setValueAfterSuccesfullCall)
    }

    render() {
        if (this.props.performRefresh)
            this.loadCurrentValue();
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

        if (this.props.performRefresh)
            this.loadCurrentValue();
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
        };
        this.setValueAfterSuccesfullCall = this.setValueAfterSuccesfullCall.bind(this);
        this.loadCurrentValue();
    }

    setValueAfterSuccesfullCall(valueToSet) {
        this.setState({value: valueToSet})
    }

    // GET VALUE
    loadCurrentValue() {
        getValueFromTecoApi(this.props.postRequestData, this.props.id, this.setValueAfterSuccesfullCall)
    }

    render() {
        if (this.props.performRefresh)
            this.loadCurrentValue();
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
        };
        this.handleChange = this.handleChange.bind(this);
        this.changeState = this.changeState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setValueAfterSuccesfullCall = this.setValueAfterSuccesfullCall.bind(this);
        this.loadCurrentValue();
    }

    changeState() {
        this.setState({isStateSetValue: !this.state.isStateSetValue});
    }

    // univerzalni vyhodnoceni toho jakou property vzit
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    setValueAfterSuccesfullCall(valueToSet) {
        this.setState({value: valueToSet})
    }

    // GET VALUE
    loadCurrentValue() {
        getValueFromTecoApi(this.props.postRequestData, this.props.id, this.setValueAfterSuccesfullCall)
    }

    handleSubmit(event) {
        event.preventDefault();
        setValueToTecoApi(this.props.postRequestData, this.props.id, this.state.valueToSet, this.setValueAfterSuccesfullCall);
        this.changeState();
    }

    render() {
        let innerSpace = [];
        if (this.props.performRefresh)
            this.loadCurrentValue();
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
        };
        this.setValueAfterSuccesfulCall = this.setValueAfterSuccesfulCall.bind(this);
        this.loadCurrentValue();
    }

    setValueAfterSuccesfulCall(valueToSet) {
        this.setState({value: valueToSet})
    }

    // GET VALUE
    loadCurrentValue() {
        getValueFromTecoApi(this.props.postRequestData, this.props.id, this.setValueAfterSuccesfulCall)
    }

    // set value
    switchOnOff() {
        const valueToSet = !this.state.value;
        setValueToTecoApi(this.props.postRequestData, this.props.id, valueToSet, this.setValueAfterSuccesfulCall)
    }

    render() {
        if (this.props.performRefresh)
            this.loadCurrentValue();
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
