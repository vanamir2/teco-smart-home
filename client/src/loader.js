import React from "react";

export class Loader extends React.Component {
    render() {
        // the 1st tag is to make it click-able
        return (
            <div className="gooey">
                <span className="dot"></span>
                <div className="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }
}