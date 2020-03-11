
// Base64; UTF-8; https://www.npmjs.com/package/js-base64
const Base64 = require('js-base64').Base64;
// same output as https://www.base64decode.org/

/**
 * Holds information about Simple Data Source ...
 * FORMAT: $Identifikátor_I/O_$DatovýTyp_$Min_$Max_$Místnost_$Název
 * EXAMPLE: LightK_O_REA_0_100_Kuchyň_Světlo
 * EXAMPLE AFTER ENCODING: LightK_O_REA_0_100_S3VjaHnFiA_U3bEm3Rsbw
 *
 * */
module.exports = class SimpleDataSource {
    get dataSourceString() {
        return this._dataSourceString;
    }

    get categoryId() {
        return this._categoryId;
    }

    get inOut() {
        return this._inOut;
    }

    get dataType() {
        return this._dataType;
    }

    get minValue() {
        return this.getValueOrDefault(this._minValue, "");
    }

    get maxValue() {
        return this.getValueOrDefault(this._maxValue, "");
    }

    get roomBase64() {
        return this.getValueOrDefault(this._room, "");
    }

    get nameBase64() {
        return this.getValueOrDefault(this._name, "");
    }

    get room() {
        return this.decodeValueOrDefault(this._room, "");
    }

    get name() {
        return this.decodeValueOrDefault(this._name, "");
    }

    getValueOrDefault(value, defaultVal) {
        return (value === undefined || value === "") ? defaultVal : value;
    }

    decodeValueOrDefault(value, defaultVal) {
        return (value === undefined || value === "") ? defaultVal : Base64.decode(value)
    }

    /**
     * @param {String} dataSourceString  Source defined on Teco side. e.g. S3VjaHnFiA==_RedLight_O_REA_0_100_U3bEm3Rsbw .
     */
    constructor(dataSourceString) {
        this._dataSourceString = dataSourceString;

        this._categoryId = getPartOfSimpleDSSWithValueCheck(dataSourceString, 0, "categoryId");
        this._inOut = getPartOfSimpleDSSWithValueCheck(dataSourceString, 1, "I/O definition");
        if(this._inOut !== "O" && this._inOut !== "I")
            throw new Error(ERROR_STRING +  "value \"I\" or \"O\". Received I/O is: " + this._inOut);
        this._dataType = getPartOfSimpleDSSWithValueCheck(dataSourceString, 2, "data type");

        this._minValue = getPartOfSimpleDSS(dataSourceString, 3);
        this._maxValue = getPartOfSimpleDSS(dataSourceString, 4);

        this._room = getPartOfSimpleDSSWithValueCheck(dataSourceString, 5, "room");
        this._name = getPartOfSimpleDSSWithValueCheck(dataSourceString, 6, "name");
    }

};

// DSS = Data Source String
function getPartOfSimpleDSS(string, part) {
    return string.split("_")[part];
}


const ERROR_STRING = "Simple data source string does not contain ";
function getPartOfSimpleDSSWithValueCheck(string, part, doesNotContain) {
    let partOfString = string.split("_")[part];
    if (partOfString === undefined || partOfString === "" )
        throw new Error(ERROR_STRING + doesNotContain + ". Received string is: " + string);
    return partOfString;
}
