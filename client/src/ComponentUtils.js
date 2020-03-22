import React from "react";
import Switch from "react-switch"; // https://www.npmjs.com/package/react-switch

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