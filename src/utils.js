/** Converts '1' to '01'. */
module.exports.decimalToTwoDigits = function decimalToTwoDigits(number) {
    return ("0" + number).slice(-2);
};

//module.exports.getValueOrDefault =