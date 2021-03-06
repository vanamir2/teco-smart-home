import React from 'react';
import CanvasJSReact from '../canvas/canvasjs.react';
import axios from "axios";
import {REQUEST_TIMEOUT} from "./gridItem";
import * as ComponentUtils from "./componentUtils";
import {Loader} from "./loader";
import {getCurrentDataForDiagramPage, MAX_INT, MIN_INT} from '../utils';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;
const logger = require('logplease').create('DiagramPage');
const DATA_ENDPOINT = '/data';

export class DiagramPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graphData: null,
            loadEntireDaySwitch: false,
            dayValue: getCurrentDataForDiagramPage()
        };
        this.handleSwitchChange = this.handleSwitchChange.bind(this);
        this.handleDateSubmit = this.handleDateSubmit.bind(this);
    }

    handleSwitchChange() {
        let newState = !this.state.loadEntireDaySwitch;
        logger.info("Load entire day switch was changed to: " + newState);
        this.loadData(newState, this.state.dayValue);
        this.setState({loadEntireDaySwitch: newState});
    }

    handleDateSubmit(event) {
        event.preventDefault();
        logger.info("Date was submitted: " + this.state.dayValue);
        this.loadData(this.state.loadEntireDaySwitch, this.state.dayValue);
    }

    loadData(loadEntireDay, dayToLoad) {
        let hours = loadEntireDay ? 24 : 1;
        let jumpByNFields = loadEntireDay ? 10 : 1;

        // load new data upon request
        const axiosWithTimeout = axios.create({timeout: REQUEST_TIMEOUT,});
        axiosWithTimeout.post(DATA_ENDPOINT, {
            "hours": hours,
            "jumpByNFields": jumpByNFields,
            "day": dayToLoad
        }).then((response) => {
            if (response.data.error !== undefined) {
                alert('Request to read data failed. Error: ' + JSON.stringify(response.data.error));
                return;
            }
            this.setState({graphData: response.data});
        }).catch((error) => {
            if (error.response)
                alert(error.response.data);
            else
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
                        <i style={{fontSize: "35px", color: "black"}} className="fa fa-refresh" title="Refresh"/>
                    </div>
                </a>
                <ComponentUtils.MaterialSwitch customClass={"login-form-withoutNewLineAndWidth"}
                                               name={"Load entire day"} checked={this.state.loadEntireDaySwitch}
                                               handleChange={this.handleSwitchChange}/>
                <form onSubmit={this.handleDateSubmit}>
                    <label htmlFor="fname">Date&nbsp;</label>
                    <input type="date" id="fname" name="fname" value={this.state.dayValue}
                           onChange={event => this.setState({dayValue: event.target.value})}/>
                    <input type="submit" value="Submit"/><br/>
                </form>
                <TemperatureDiagram graphData={this.state.graphData} name={"Temperature [°C]"}/>
                <HumidityDiagram graphData={this.state.graphData} name={"Humidity [%]"}/>
                <BooleanDiagram graphData={this.state.graphData} name={"Doors and Electric socket [0/1]"}
                                maxValue={1.05}/>
                <LightDiagram graphData={this.state.graphData} name={"Light brightness [%]"} maxValue={101}/>
            </div>
        );
    }
}

export class TemperatureDiagram extends React.Component {
    render() {
        let yAxisName = "";
        let yAxisAllFields = ["temperature_inner", "temperature_outer"];
        let yAxisAllNames = ["Embedded sensor", "2nd sensor"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames, this.props.maxValue);
    }
}

export class HumidityDiagram extends React.Component {
    render() {
        let yAxisName = "";
        let yAxisAllFields = ["humidity_inner"];
        let yAxisAllNames = ["Humidity inner sensor"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames, this.props.maxValue);
    }
}

export class BooleanDiagram extends React.Component {
    render() {
        let yAxisName = "";
        let yAxisAllFields = ["doorOpened", "electricSocket"];
        let yAxisAllNames = ["Door opened", "Socket on"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames, this.props.maxValue);
    }
}

export class LightDiagram extends React.Component {
    render() {
        let yAxisName = "";
        let yAxisAllFields = ["light"];
        let yAxisAllNames = ["Light brightness"];
        return createCanvasDiagram(this.props.graphData, this.props.name, yAxisName, yAxisAllFields, yAxisAllNames, this.props.maxValue);
    }
}


export function createAllDiagrams() {
    return <DiagramPage/>;
}

// https://en.wikipedia.org/wiki/ISO_8601
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
const TIMEZONE_CORRECTION = '+0200';

// TECO saves +0200 timezone as UTC (+0) timezone. This method repair timezone.
function parseISOStringToDate(isoDate) {
    let isoDateWithoutTimezone = isoDate.substring(0, isoDate.length - 1);
    return new Date(isoDateWithoutTimezone + TIMEZONE_CORRECTION);
}

function getValue(value) {
    if (value === true)
        return 1;
    else if (value === false)
        return 0;
    return value;
}

function createCanvasDiagram(graphData, name, yAxisName, yAxisAllFields, yAxisAllNames, maximum) {
    let dataArr = [];
    let minimum = MAX_INT;
    let currentMaximum = MIN_INT;

    let numberOfItems = yAxisAllFields.length;
    let showLegend = numberOfItems >= 2;

    for (let yAxis of yAxisAllFields) {
        let innerDataArr = [];
        for (let field of graphData) {
            minimum = minimum > field[yAxis] ? field[yAxis] : minimum;
            currentMaximum = currentMaximum < field[yAxis] ? field[yAxis] : currentMaximum;
            innerDataArr.push(
                {
                    x: parseISOStringToDate(field.plcSaveTs),
                    y: getValue(field[yAxis])
                }
            );
        }
        dataArr.push(innerDataArr);
    }
    logger.debug(JSON.stringify(dataArr));
    let range = currentMaximum - minimum;

    const options = {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: name,
            fontSize: 25, // https://canvasjs.com/docs/charts/chart-options/title/fontsize/
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
            minimum: MAX_INT === minimum ? null : minimum - range * 0.08,
            maximum: maximum === undefined ? currentMaximum + range * 0.04 : maximum
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
            showInLegend: showLegend,
            name: yAxisAllNames[0],
            markerType: "square",
            xValueFormatString: "DD/MMM - HH:mm",
            color: "#F08080",
            dataPoints: dataArr[0]
        }, {
            type: "line",
            showInLegend: showLegend,
            name: yAxisAllNames[1],
            lineDashType: "dash",
            dataPoints: dataArr[1]
        }, {
            type: "line",
            showInLegend: showLegend,
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