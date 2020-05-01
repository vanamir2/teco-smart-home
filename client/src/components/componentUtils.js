import React from "react";
import Switch from "react-switch";
import {ConnectionStatusCheck} from "../schedule/connectionStatus";
import {DiagramPage} from "./diagramPage";
import {Loader} from "./loader";
import * as GridItem from "./gridItem";
import Button from "react-bootstrap/Button";
import * as Utils from "../utils";
import * as Constant from "../constants";
import * as DataSourceUtils from "../dataSource/dataSourceUtils";
import {DataRefresher} from "../schedule/dataRefresher"; // https://www.npmjs.com/package/react-switch

export class MaterialSwitch extends React.Component {
    render() {
        let textCss = this.props.customClass === undefined ? "login-form-withoutNewLine" : this.props.customClass;
        return (
            <label htmlFor="material-switch" className={textCss}>
                <div className="login-form-withoutNewLineTop">{this.props.name}&nbsp;</div>
                <Switch
                    checked={this.props.checked}
                    onChange={this.props.handleChange}
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={20}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={15}
                    width={35}
                    id="material-switch"
                />
            </label>
        );
    }
}

export function createDiagramPage(negateDiagramState, postRequestData) {
    return (
        <div>
            <a href={"/#"} className="active_chat" onClick={negateDiagramState}>
                <div className="leftColumn">
                    <i style={{fontSize: "35px", color: "black"}} className="fa fa-arrow-left" title="Back button"/>
                </div>
            </a>
            <p/>
            <DiagramPage/>
            <ConnectionStatusCheck
                postRequestData={postRequestData}
            />
        </div>);
}

export function createRoomGridPage(roomToSDSmap, negateDiagramState, handleSubmit, selectRoom, postRequestData) {
    let gridElements = [];
    if (roomToSDSmap === undefined)
        return <Loader/>;
    for (const [key] of roomToSDSmap.entries())
        gridElements.push(<GridItem.Room className="grid-item"
                                         key={key} name={key}
                                         onClick={selectRoom.bind(this, key)}/>);
    return (
        <div>
            <div className="grid-container">
                {gridElements}
            </div>
            <div className="centerIt">
                <Button variant="outline-primary"
                        onClick={negateDiagramState}>Stats <i className="fa fa-bar-chart"/></Button>
                <div className="smallSpace"/>
                <Button variant="outline-secondary"
                        onClick={handleSubmit}>Refresh <i className="fa fa-refresh"/></Button>
                <div className="smallSpace"/>
                <Button variant="outline-secondary"
                        onClick={() => window.location.reload(false)}>Logout <i
                    className="fa fa-sign-out"/></Button>
            </div>

            <ConnectionStatusCheck
                postRequestData={postRequestData}
            />
        </div>
    );
}

export function createRoomDetailPage(roomToSDSmap, selectedRoom, SDSSfreshDataMap, postRequestData, insertSDSSfreshDataMap, unselectRoom) {
    let roomElements = [];
    let roomEncoded = null;
    let arrayOfSDS = roomToSDSmap.get(selectedRoom);
    for (let i = 0; i < arrayOfSDS.length; ++i) {
        let sds = arrayOfSDS[i];
        roomEncoded = sds.roomBase64;
        let itemType = sds.categoryId;
        let inOut = sds.inOut;
        let dataSourceString = sds.dataSourceString;
        let name = sds.name;
        let value = Utils.roundFloatValues(SDSSfreshDataMap.get(dataSourceString));
        let maxValue = sds.maxValue;
        let minValue = sds.minValue;

        let unit = Utils.getUnitByItemType(itemType);

        if (inOut === 'I')
            roomElements.push(
                <GridItem.ReadOnly
                    key={dataSourceString}
                    id={dataSourceString}
                    postRequestData={postRequestData}
                    name={name}
                    newValue={value}
                    unit={unit}
                />);
        else if (itemType === Constant.THERMOSTAT_TEMP) {
            roomElements.push(
                <GridItem.ThermostatValue className="grid-item"
                                          id={dataSourceString}
                                          key={dataSourceString}
                                          postRequestData={postRequestData}
                                          name={name}
                                          newValue={value}
                                          maxValue={maxValue}
                                          minValue={minValue}
                />);
        } else if (sds.dataType === DataSourceUtils.BOOLEAN_DATA_TYPE) {
            roomElements.push(
                <GridItem.BooleanGridItem className="grid-item"
                                          id={dataSourceString}
                                          key={dataSourceString}
                                          postRequestData={postRequestData}
                                          name={name}
                                          newValue={value}
                />);
        } else if (itemType === DataSourceUtils.RED_LIGHT || itemType === DataSourceUtils.BLUE_LIGHT || itemType === DataSourceUtils.GREEN_LIGHT || itemType === DataSourceUtils.LIGHT) {
            roomElements.push(
                <GridItem.Light className="grid-item"
                                id={dataSourceString}
                                key={dataSourceString}
                                postRequestData={postRequestData}
                                name={name}
                                newValue={value}
                                itemType={itemType}
                />)
        } else roomElements.push(
            <GridItem.ReadOnly
                key={dataSourceString}
                id={dataSourceString}
                postRequestData={postRequestData}
                name={name}
                newValue={value}
                unit={unit}
            />);
    }

    return (
        <div>
            <p/>
            <div>
                <a href={"/#"} className="active_chat" onClick={() => unselectRoom()}>
                    <div className="leftColumn">
                        <i style={{fontSize: "35px", color: "black"}} className="fa fa-arrow-left"
                           title="Back button"/>
                    </div>
                </a>
                <div className="rightColumn">
                    <h3 className="centerIt">{selectedRoom}</h3>
                </div>
            </div>
            <div className="oneColumn">
                <div className="grid-container">
                    {roomElements}
                </div>
            </div>
            <ConnectionStatusCheck
                postRequestData={postRequestData}
            />
            <DataRefresher
                postRequestData={postRequestData}
                selectedRoomEncoded={roomEncoded}
                insertSDSSfreshDataMap={(data) => insertSDSSfreshDataMap(data)}
            />
        </div>
    );
}