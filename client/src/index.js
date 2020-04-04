import React from 'react';
import ReactDOM from 'react-dom';
import "./index.scss";
import * as Login from './components/loginForm.js';
import * as ComponentUtils from './components/componentUtils';
import {Loader} from './components/loader';
import * as Utils from './utils';
import * as Constant from './constants';

const Logger = require('logplease');
const logger = Logger.create('index');
Logger.setLogLevel(Logger.LogLevels.INFO);

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // localhost
            ipAddress: "",
            // TecoApi
            username: "admin",
            password: "admin",
            // TecoRoute
            tecoRouteUsername: "miroslav.vana",
            tecoRoutePw: "12345678",
            plcName: "kufr01",

            // ---------------
            wasLoginSubmitted: false, // to start/stop loader
            selectedRoom: null, // currently user selected room
            postRequestData: null, // login data
            roomToSDSmap: null, // room -> SDS
            isLocalhostSwitchOn: false,
            showDiagramPage: false,

            SDSSfreshDataMap: new Map() // SDS -> value
        };
        this.handleChange = this.handleChange.bind(this);
        this.stopLoader = this.stopLoader.bind(this);
        this.prepareLoginData = this.prepareLoginData.bind(this);
        this.setState = this.setState.bind(this);
        this.selectRoom = this.selectRoom.bind(this);
        this.unselectRoom = this.unselectRoom.bind(this);
        this.handleLocalhostChange = this.handleLocalhostChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
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

    prepareLoginData(isTecoRoute, command, routePLC, softPLC) {
        return Utils.returnLoginDataAsJson(isTecoRoute,//
            // tecoApi
            this.state.username, this.state.password,//
            // tecoRoute
            this.state.tecoRouteUsername, this.state.tecoRoutePw, this.state.plcName,//
            // command and cookie details
            command, routePLC, softPLC,//
            // localhost connection IPv4 address
            this.state.ipAddress);
    }

    stopLoader() {
        this.setState({wasLoginSubmitted: false});
    }

    // universal value changer
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleLocalhostChange() {
        this.setState({isLocalhostSwitchOn: !this.state.isLocalhostSwitchOn});
    }

    handleLoginSubmit(event) {
        logger.debug('HandleLoginSubmit event started...');
        event.preventDefault();
        // to start loader
        this.setState({wasLoginSubmitted: true});
        // login and initialization
        let isTecoRoute = this.state.isLocalhostSwitchOn === false;
        Utils.sendFirstRequestToTecoApi(isTecoRoute, this.prepareLoginData, this.stopLoader, this.setState);
    }

    createLoginPage() {
        let loginForm;
        let localHostSwitch = !Constant.IS_PRODUCTION_ENVIRONMENT ?
            <ComponentUtils.MaterialSwitch name={"Localhost"}
                                           checked={this.state.isLocalhostSwitchOn}
                                           handleChange={this.handleLocalhostChange}/>
            : "";
        if (this.state.isLocalhostSwitchOn)
            loginForm = Login.createLocalhostLoginForm(this.handleChange, this.handleLoginSubmit, this.state.ipAddress, this.state.username, this.state.password);
        else
            loginForm = Login.createTecoRouteLoginForm(this.handleChange, this.handleLoginSubmit, this.state.username, this.state.password, this.state.tecoRouteUsername, this.state.tecoRoutePw, this.state.plcName);

        return (
            <div className="login-form">
                <h1>Teco connection <i className="fa fa-home"/></h1>
                {localHostSwitch}
                {loginForm}
            </div>
        );
    }

    createRoomPage() {
        return ComponentUtils.createRoomGridPage(this.state.roomToSDSmap, this.negateDiagramState, this.handleLoginSubmit, this.selectRoom, this.state.postRequestData);
    }

    createStatsPage() {
        return ComponentUtils.createDiagramPage(this.negateDiagramState, this.state.postRequestData);
    }

    createRoomDetailPage() {
        return ComponentUtils.createRoomDetailPage(this.state.roomToSDSmap, this.state.selectedRoom,//
            this.state.SDSSfreshDataMap, this.state.postRequestData, this.insertSDSSfreshDataMap, this.unselectRoom);
    }

    render() {
        if (this.state.wasLoginSubmitted)
            return <Loader/>;
        else if (this.state.roomToSDSmap === null || this.state.roomToSDSmap === undefined)
            return this.createLoginPage();
        else if (this.state.showDiagramPage)
            return this.createStatsPage();
        else if (this.state.selectedRoom === null)
            return this.createRoomPage();
        else
            return this.createRoomDetailPage();
    }
}

ReactDOM.render(<Main/>, document.getElementById('root'));