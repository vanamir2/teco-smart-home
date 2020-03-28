import React from 'react';
import ReactDOM from 'react-dom';
import "./index.scss";
import * as Login from './loginForm.js';
import * as ComponentUtils from './ComponentUtils';
import {DiagramPage} from './DiagramPage.js';
import axios from "axios";
import * as GridItem from "./GridItem.js";
import * as DataSourceUtils from "./DataSourceUtils.js";
import {ConnectionStatusCheck} from './connectionStatus';
import {DataRefresher} from './dataRefresher';
import {Loader} from './loader';
import * as Utils from './utils';

const Logger = require('logplease');
const logger = Logger.create('index');
Logger.setLogLevel(Logger.LogLevels.INFO);

const GET_LIST_OF_OBJECTS = "GetList";
const GET_OBJECT = "GetObject?";
const THERMOSTAT_TEMP = 'thermTemp';
const IS_PRODUCTION_ENVIRONMENT = process.env.NODE_ENV === 'production';

//http://192.168.134.176/TecoApi/GetList
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // localhost
            ipAddress: "",
            // TecoApi
            username: "",
            password: "",
            // TecoRoute
            tecoRouteUsername: "",
            tecoRoutePw: "",
            plcName: "",

            // ---------------
            wasLoginSubmitted: false, // primary usage of this variable is to start/stop loader
            selectedRoom: null, // currently user selected room
            postRequestData: null, // login data
            roomToSDSmap: null, // room -> SDS
            isLocalhostSwitchOn: false,
            showDiagramPage: false,

            SDSSfreshDataMap: new Map() // SDS -> value
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleLocalhostChange = this.handleLocalhostChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.negateDiagramState = this.negateDiagramState.bind(this);
        this.insertSDSSfreshDataMap = this.insertSDSSfreshDataMap.bind(this);
    }

    insertSDSSfreshDataMap(SDSSfreshDataMap) {
        logger.debug('Fresh data=' + SDSSfreshDataMap);
        this.setState({SDSSfreshDataMap: SDSSfreshDataMap});
    }

    selectRoom(room) {
        logger.debug('Selected room=' + room);
        this.setState({selectedRoom: room});
    }

    unselectRoom() {
        this.setState({selectedRoom: null});
    }

    negateDiagramState(event) {
        event.preventDefault();
        this.setState({showDiagramPage: !this.state.showDiagramPage});
    }

    getRoutePLC(string) {
        let a = string.indexOf("RoutePLC=") + 9;
        let b = string.indexOf(";", a);
        if (b === -1) b = string.length;
        let routePLC = unescape(string.substring(a, b));
        logger.debug("RoutePLC=" + routePLC);
        return routePLC;
    }

    getSoftPLC(string) {
        let a = string.indexOf("SoftPLC=") + 8;
        let b = string.indexOf(";", a);
        if (b === -1) b = string.length;
        let softPLC = unescape(string.substring(a, b));
        logger.debug("SoftPLC=" + softPLC);
        return softPLC;
    };

    prepareDataForTecoApi(isTecoRoute, command, cookie) {
        if (isTecoRoute)
            return {
                username: this.state.username,
                password: this.state.password,
                tecoRouteUsername: this.state.tecoRouteUsername,
                tecoRoutePw: this.state.tecoRoutePw,
                plcName: this.state.plcName,
                command: command,
                routePLC: cookie !== undefined  ? this.getRoutePLC(cookie) : undefined,
                softPLC: cookie !== undefined  ? this.getSoftPLC(cookie) : undefined,
            };
        else
            return {
                ipAddress: this.state.ipAddress,
                username: this.state.username,
                password: this.state.password,
                command: command,
            };
    }

    loadAllRooms(isTecoRoute, cookie, endPoint, data) {
        const axiosWithTimeout = axios.create({timeout: GridItem.REQUEST_TIMEOUT,});
        axiosWithTimeout.post(endPoint, data).then((response) => {
            if (response.data.error !== undefined) {
                alert('Request failed. Error: ' + JSON.stringify(response.data.error));
                return;
            }
            // prepare room command
            let command = GET_OBJECT;
            for (let key in response.data)
                if (key.startsWith('ROOM_'))
                    command = command + key + '&';
            command.slice(0, -1);
            logger.debug('Command to load all rooms: ' + command);
            // another request to load SDSS of rooms
            data = Utils.getPostRequestWithNewCommand(data, command);
            axiosWithTimeout.post(endPoint, data).then((response) => {
                if (response.data.error !== undefined) {
                    alert('Request failed. Error: ' + JSON.stringify(response.data.error));
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
                console.log(map);

                this.setState({
                    wasLoginSubmitted: false,
                    roomToSDSmap: map,
                    postRequestData: this.prepareDataForTecoApi(isTecoRoute, null, cookie)
                })
            });
        }).catch((error) => {
            this.setState({wasLoginSubmitted: false});
            if (error.response) {
                alert(error.response.data);
                console.log(error.response.data);
            } else
                alert('No answer from IP address: ' + this.state.ipAddress);
        });
    }

    // login and initialization
    sendFirstRequestToTecoApi() {
        let command = GET_LIST_OF_OBJECTS;
        const axiosWithTimeout = axios.create({timeout: GridItem.REQUEST_TIMEOUT,});
        let isTecoRoute = this.state.isLocalhostSwitchOn === false;
        let loginData = this.prepareDataForTecoApi(isTecoRoute, command);
        if (isTecoRoute) {
            // perform LOGIN
            axiosWithTimeout.post(GridItem.TECO_ROUTE_LOGIN_ENDPOINT, loginData).then((response) => {
                let cookie = response.data;
                logger.debug("Received cookie from TecoRoute login: " + cookie);
                let loginDataWithCookie = this.prepareDataForTecoApi(isTecoRoute, command, cookie);
                this.loadAllRooms(isTecoRoute, cookie, GridItem.TECO_ROUTE_WITH_COOKIE_ENDPOINT, loginDataWithCookie);
            }).catch((error) => {
                if (error.response) {
                    alert(error.response.data);
                    console.log(error.response.data);
                } else
                    alert('No answer from IP address: ' + this.state.ipAddress);
                // if login was not succesfull, stop Loader
                this.setState({wasLoginSubmitted: false})
            });
        } else
            this.loadAllRooms(isTecoRoute, null, GridItem.TECO_API_ENDPOINT, loginData);
    }

    // univerzalni vyhodnoceni toho jakou property vzit
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleLocalhostChange() {
        logger.debug("Localhost switch was changed to: " + !this.state.isLocalhostSwitchOn);
        this.setState({isLocalhostSwitchOn: !this.state.isLocalhostSwitchOn});
    }

    handleSubmit(event) {
        logger.debug('HandleSubmit event started...');
        event.preventDefault();
        this.setState({wasLoginSubmitted: true});
        this.sendFirstRequestToTecoApi();
    }

    createLoginForm() {
        let loginForm;
        let localHostSwitch = !IS_PRODUCTION_ENVIRONMENT ?
            <ComponentUtils.MaterialSwitch name={"Localhost"} checked={this.state.isLocalhostSwitchOn}
                                           handleChange={this.handleLocalhostChange}/>
            : "";
        if (this.state.isLocalhostSwitchOn)
            loginForm = Login.createLocalhostLoginForm(this.handleChange, this.handleSubmit, this.state.ipAddress, this.state.username, this.state.password);
        else // predelat handle change
            loginForm = Login.createTecoRouteLoginForm(this.handleChange, this.handleSubmit, this.state.username, this.state.password, this.state.tecoRouteUsername, this.state.tecoRoutePw, this.state.plcName);

        return (
            <div className="login-form">
                <h1>Teco connection</h1>
                {localHostSwitch}
                {loginForm}
            </div>
        );
    }

    createRoomGrid() {
        let gridElements = [];
        if (this.state.roomToSDSmap === undefined)
            return <Loader/>;
        for (const [key] of this.state.roomToSDSmap.entries())
            gridElements.push(<GridItem.Room className="grid-item"
                                             key={key} name={key}
                                             onClick={this.selectRoom.bind(this, key)}/>);
        return (
            <div>
                <div className="grid-container">
                    {gridElements}
                </div>
                <div className="login-form">
                    <form onSubmit={this.handleSubmit}>
                        <input type="submit" value="Refresh"/>
                    </form>
                    <br/>
                    <form onSubmit={this.negateDiagramState}>
                        <input type="submit" value="Diagrams"/>
                    </form>
                    <GridItem.ActionButton
                        // force page refresh
                        onClick={() => window.location.reload(false)}
                        text={'Logout'}/>
                </div>
                <ConnectionStatusCheck
                    postRequestData={this.state.postRequestData}
                />
            </div>
        );
    }

    createDiagramPage() {
        return (
            <div>
                <a href={"/#"} className="active_chat" onClick={this.negateDiagramState}>
                    <div className="leftColumn">
                        <img className="center" height="30" width="30" src="return-button.svg" alt="Back button" title="Back"/>
                    </div>
                </a>
                <DiagramPage/>
                <ConnectionStatusCheck
                    postRequestData={this.state.postRequestData}
                />
            </div>);
    }

    render() {
        // <div className="loader"/>
        if (this.state.wasLoginSubmitted)
            return <Loader/>;
        // the 1st tag is to make it click-able
        if (this.state.roomToSDSmap === null || this.state.roomToSDSmap === undefined)
            return this.createLoginForm();
        // diagram page
        else if (this.state.showDiagramPage)
            return this.createDiagramPage();
        // room selection
        else if (this.state.selectedRoom === null)
            return this.createRoomGrid();
        // room detail
        else {
            let roomElements = [];
            let roomEncoded = null;
            let arrayOfSDS = this.state.roomToSDSmap.get(this.state.selectedRoom);
            for (let i = 0; i < arrayOfSDS.length; ++i) {
                let sds = arrayOfSDS[i];
                roomEncoded = sds.roomBase64;

                const itemType = sds.categoryId;
                const inOut = sds.inOut;
                const dataSourceString = sds.dataSourceString;
                const name = sds.name;
                /*   logger.debug('SDSS=' + sds.dataSourceString);
                   logger.debug('CategoryId=' + sds.categoryId);
                   logger.debug('DataType=' + sds.dataType);

                   logger.debug('Value=' + this.state.SDSSfreshDataMap[dataSourceString]);*/

                if (inOut === 'I')
                    roomElements.push(
                        <GridItem.ReadOnly
                            id={dataSourceString}
                            postRequestData={this.state.postRequestData}
                            name={name}
                            newValue={this.state.SDSSfreshDataMap.get(dataSourceString)}
                        />);
                else if (itemType === THERMOSTAT_TEMP) {
                    roomElements.push(
                        <GridItem.ThermostatValue className="grid-item"
                                                  id={dataSourceString}
                                                  key={dataSourceString}
                                                  postRequestData={this.state.postRequestData}
                                                  name={name}
                                                  newValue={this.state.SDSSfreshDataMap.get(dataSourceString)}
                        />);
                } else if (sds.dataType === DataSourceUtils.BOOLEAN_DATA_TYPE) {
                    roomElements.push(
                        <GridItem.BooleanGridItem className="grid-item"
                                                  id={dataSourceString}
                                                  key={dataSourceString}
                                                  postRequestData={this.state.postRequestData}
                                                  name={name}
                                                  newValue={this.state.SDSSfreshDataMap.get(dataSourceString)}
                        />);
                } else if (itemType === DataSourceUtils.RED_LIGHT) {
                    roomElements.push(
                        <GridItem.RedLight className="grid-item"
                                           id={dataSourceString}
                                           key={dataSourceString}
                                           postRequestData={this.state.postRequestData}
                                           name={name}
                                           newValue={this.state.SDSSfreshDataMap.get(dataSourceString)}
                        />)
                } else roomElements.push(
                    <GridItem.Light className="grid-item"
                                    id={dataSourceString}
                                    key={dataSourceString}
                                    postRequestData={this.state.postRequestData}
                                    name={name}
                                    newValue={this.state.SDSSfreshDataMap.get(dataSourceString)}
                    />);
            }

            // automaticky bere obrazek z public slozky
            return (
                <div>
                    <div>
                        <a href={"/#"} className="active_chat" onClick={() => this.unselectRoom()}>
                            <div className="leftColumn">
                                <img className="center" height="42" width="42" src="return-button.svg" alt="Logo" title="Back"/>
                            </div>
                        </a>
                        <div className="rightColumn">
                            <h1 className="signUp">
                                {this.state.selectedRoom}
                            </h1>
                        </div>
                    </div>
                    <div className="oneColumn">
                        <div className="grid-container">
                            {roomElements}
                        </div>
                    </div>
                    <ConnectionStatusCheck
                        postRequestData={this.state.postRequestData}
                    />
                    <DataRefresher
                        postRequestData={this.state.postRequestData}
                        selectedRoomEncoded={roomEncoded}
                        insertSDSSfreshDataMap={(data) => this.insertSDSSfreshDataMap(data)}
                    />
                </div>
            );
        }
    }
}

ReactDOM.render(
    <Main/>,
    document.getElementById('root')
);