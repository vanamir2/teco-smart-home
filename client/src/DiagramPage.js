import React from 'react';
import CanvasJSReact from './canvas/canvasjs.react';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

import * as CanvasConstants from './canvas/CanvasConstants';
import axios from "axios";
import {REQUEST_TIMEOUT} from "./GridItem";
import * as ComponentUtils from "./ComponentUtils";
import {Loader} from "./loader";

const logger = require('logplease').create('DiagramPage');

const MAX_INT = 4294967295;

const DATA_ENDPOINT = '/data';
let graphDataTest = CanvasConstants.graphData_1day_10minutes;

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

export class DiagramPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graphData: null,
            loadEntireDaySwitch: false,
            dayValue: new Date().toDateInputValue()
        };
        this.handleSwitchChange = this.handleSwitchChange.bind(this);
        this.handleDateSubmit = this.handleDateSubmit.bind(this);
    }

    handleSwitchChange() {
        let newState = !this.state.loadEntireDaySwitch;
        logger.info("Load entire day switch was changed to: " +  newState);
        this.loadData(newState, this.state.dayValue);
        this.setState({loadEntireDaySwitch: newState});
    }

    handleDateSubmit(event){
        event.preventDefault();
        logger.info("Date was submitted: " +  this.state.dayValue);
        this.loadData(this.state.loadEntireDaySwitch, this.state.dayValue);
    }

    loadData(loadEntireDay, dayToLoad) {
        let hours = loadEntireDay ? 24 : 1;
        let jumpByNFields = loadEntireDay ? 10 : 1;

        // load new data upon request
        const axiosWithTimeout = axios.create({timeout: REQUEST_TIMEOUT,});
        axiosWithTimeout.post(DATA_ENDPOINT, {"hours": hours, "jumpByNFields": jumpByNFields, "day": dayToLoad}).then((response) => {
            if (response.data.error !== undefined) {
                alert('Request to read data failed. Error: ' + JSON.stringify(response.data.error));
                return;
            }
            console.log(response.data);
            this.setState({graphData: response.data});
        }).catch((error) => {
            if (error.response) {
                alert(error.response.data);
                console.log(error.response.data);
            } else
                alert('No answer from backend server: ' + error);
        });
    }

    render() {
        logger.debug("Day value=" + this.state.dayValue);
        if (this.state.graphData === null) {
            this.loadData(this.state.loadEntireDaySwitch, this.state.dayValue);
            return <Loader/>;
        }
        return (
            <div>
                <a href={"/#"} className="active_chat" onClick={this.handleDateSubmit}>
                    <div className="rightColumn2">
                        <img className="center" height="30" width="30" src="refresh.png" alt="Logo" title="Refresh"/>
                    </div>
                </a>
                <ComponentUtils.MaterialSwitch customClass={"login-form-withoutNewLineAndWidth"}  name={"Load entire day"} checked={this.state.loadEntireDaySwitch} handleChange={this.handleSwitchChange}/>
                <form onSubmit={this.handleDateSubmit}>
                    <label className="login-form-withoutNewLineTop" htmlFor="fname">Date&nbsp;</label>
                    <input type="date" id="fname" name="fname" value={this.state.dayValue} onChange={event => this.setState({dayValue: event.target.value})}/>
                    <input type="submit" value="Submit"/><br/>
                </form>
                <TemperatureDiagram graphData={this.state.graphData} name={"Temperature"}/>
                <HumidityDiagram graphData={this.state.graphData} name={"Humidity"}/>
                <BooleanDiagram graphData={this.state.graphData} name={"True/False values"}/>
                <LightDiagram graphData={this.state.graphData} name={"Light brightness"}/>
            </div>
        );
    }
}

export class TemperatureDiagram extends React.Component {
    render() {
        let yAxisName = "Temperature °C";
        let yAxisAllFields = ["temperature_inner", "temperature_outer"];
        let yAxisAllNames = ["Embedded sensor", "2nd sensor"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames);
    }
}

export class HumidityDiagram extends React.Component {
    render() {
        let yAxisName = "Humidity [%]";
        let yAxisAllFields = ["humidity_inner"];
        let yAxisAllNames = ["Humidity inner sensor"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames);
    }
}

export class BooleanDiagram extends React.Component {
    render() {
        let yAxisName = "True/False";
        let yAxisAllFields = ["doorClosed",  "electricSocket" ];
        let yAxisAllNames = ["Door closed", "Socket on"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames);
    }
}

export class LightDiagram extends React.Component {
    render() {
        let yAxisName = "Light diagram";
        let yAxisAllFields = ["light"];
        let yAxisAllNames = ["Light brightness"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames);
    }
}


export function createAllDiagrams() {
    return <DiagramPage/>;
}

// also changes hour to -1 corresponding to GTM+1
export function parseISOStringToDate(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], --b[3], b[4], b[5], b[6]));
}

function getValue(value){
    if( value === true)
        return 1;
    else if(value === false)
        return 0;
    return value;
}

function createCanvasDiagram(graphData, name, yAxisName, yAxisAllFields, yAxisAllNames) {
    let dataArr = [];
    let minimum = MAX_INT;

    for (let yAxis of yAxisAllFields) {
        let innerDataArr = [];
        for (let field of graphData) {
            minimum = minimum > field[yAxis] ? minimum = field[yAxis] : minimum;
            innerDataArr.push({x: parseISOStringToDate(field.plcSaveTs), y: getValue(field[yAxis]) });
        }
        dataArr.push(innerDataArr);
    }

    const options = {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: name
        },
        axisX: {
            // https://canvasjs.com/docs/charts/chart-options/axisx/valueformatstring/
            valueFormatString: "HH:mm",
            crosshair: {
                enabled: true,
                snapToDataPoint: true
            }
        },
        axisY: {
            title: yAxisName,
            crosshair: {
                enabled: true
            },
            // https://canvasjs.com/docs/charts/chart-options/axisx/minimum/
            minimum: minimum - 0.1,
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
        },
        data: [{
            type: "line",
            showInLegend: true,
            name: yAxisAllNames[0],
            markerType: "square",
            xValueFormatString: "DD/MMM - HH:mm",
            color: "#F08080",
            dataPoints: dataArr[0]
        }, {
            type: "line",
            showInLegend: true,
            name: yAxisAllNames[1],
            lineDashType: "dash",
            dataPoints: dataArr[1]
        }, {
            type: "line",
            showInLegend: true,
            name: yAxisAllNames[2],
            lineDashType: "dash",
            color: "#737df0",
            dataPoints: dataArr[2]
    }]

    };

    return (
        <div>
            <CanvasJSChart options={options}/>
        </div>
    );
}