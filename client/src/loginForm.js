import React from "react";
import Switch from "react-switch"; // https://www.npmjs.com/package/react-switch

export class LocalhostSwitch extends React.Component {
    render() {
        return (
            <label htmlFor="material-switch" className="login-form-withoutNewLine">
                <div className="login-form-withoutNewLineTop">Localhost&nbsp;</div>
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


export function createLocalhostLoginForm(handleChange, handleSubmit, ipAddr, username, pw) {
    return (
        <LocalhostLoginForm
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            ipAddress={ipAddr}
            username={username}
            password={pw}
        />
    );
}

export class LocalhostLoginForm extends React.Component {
    render() {
        // the 1st tag is to make it click-able
        return (
            <form onSubmit={this.props.handleSubmit}>
                <input type="text" value={this.props.ipAddress} onChange={this.props.handleChange}
                       name="ipAddress"
                       placeholder="PLC IP address" required/>
                <input type="text" value={this.props.username} onChange={this.props.handleChange}
                       name="username"
                       placeholder="Username (TecoApi)" required/>
                <input type="password" value={this.props.password} onChange={this.props.handleChange}
                       name="password" autoComplete="on" placeholder="Password (TecoApi)" required/>
                <input type="submit" value="Connect"/>
            </form>
        );
    }
}


export function createTecoRouteLoginForm(handleChange, handleSubmit, username, pw, tecoRouteUsername, tecoRoutePw, plcName) {
    return (
        <TecoRouteLoginForm
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            username={username}
            password={pw}
            tecoRouteUsername={tecoRouteUsername}
            tecoRoutePw={tecoRoutePw}
            plcName={plcName}
        />
    );
}

export class TecoRouteLoginForm extends React.Component {
    render() {
        // the 1st tag is to make it click-able
        return (
            <form onSubmit={this.props.handleSubmit}>
                <div className={"leftTextAlign"}>TecoApi</div>
                <input type="text" value={this.props.username} onChange={this.props.handleChange}
                       name="username" placeholder="Username (TecoApi)" required/>
                <input type="password" value={this.props.password} onChange={this.props.handleChange}
                       name="password" autoComplete="on" placeholder="Password (TecoApi)" required/>
                <div className={"leftTextAlign"}>TecoRoute</div>
                <input type="text" value={this.props.tecoRouteUsername} onChange={this.props.handleChange}
                       name="tecoRouteUsername" placeholder="Username (TecoRoute)" required/>
                <input type="password" value={this.props.tecoRoutePw} onChange={this.props.handleChange}
                       name="tecoRoutePw" autoComplete="on" placeholder="Password (TecoRoute)" required/>
                <input type="text" value={this.props.plcName} onChange={this.props.handleChange}
                       name="plcName" placeholder="Name of PLC" required/>

                <input type="submit" value="Connect"/>
            </form>
        );
    }
}