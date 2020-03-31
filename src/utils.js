/** Converts '1' to '01'. */
module.exports.decimalToTwoDigits = function decimalToTwoDigits(number) {
    return ("0" + number).slice(-2);
};

// comment
//module.exports.functionName =

// comment
module.exports.getValueFromJson = function getValueFromJson(json) {
    return Object.values(json)[0];
};