import React from "react";
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

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
            <div>
                <form onSubmit={this.props.handleSubmit}>
                    <div className={"leftTextAlign"}>TecoApi</div>

                    <InputGroup className="mb-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon1">Username</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            value={this.props.username} onChange={this.props.handleChange}
                            name="username"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            required
                        />
                    </InputGroup>

                    <InputGroup className="mb-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon1">Password</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            value={this.props.password} onChange={this.props.handleChange}
                            name="password" autoComplete="on"
                            type="password"
                            aria-describedby="basic-addon1"
                            required
                        />
                    </InputGroup>
                    <div className={"leftTextAlign"}>TecoRoute</div>
                    <InputGroup className="mb-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon1">Username</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            value={this.props.tecoRouteUsername} onChange={this.props.handleChange}
                            name="tecoRouteUsername"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            required
                        />
                    </InputGroup>

                    <InputGroup className="mb-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon1">Password</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            value={this.props.tecoRoutePw} onChange={this.props.handleChange}
                            name="tecoRoutePw" autoComplete="on"
                            type="password"
                            aria-describedby="basic-addon1"
                            required
                        />
                    </InputGroup>

                    <InputGroup className="mb-1">
                        <InputGroup.Prepend>
                            <InputGroup.Text id="basic-addon1">PLC name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            value={this.props.plcName} onChange={this.props.handleChange}
                            name="plcName" aria-label="Username" aria-describedby="basic-addon1" required
                        />
                    </InputGroup>
                    <Button variant="outline-primary" type="submit"> Connect </Button>
                </form>
            </div>
        );
    }
}