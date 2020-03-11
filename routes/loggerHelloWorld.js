// https://github.com/haadcode/logplease
const Logger = require('logplease');
const logger = Logger.create('utils');
// Levels:
logger.debug(`This is a debug message`);
logger.log(`This is a log message`); // alias for debug()
logger.info(`This is a info message`);
logger.warn(`This is a warning`);
logger.error(`This is an error`);

// global log level
Logger.setLogLevel(Logger.LogLevels.ERROR); // Show only ERROR messages
// or
// Logger.setLogLevel('ERROR')
// or mute all loggers
// Logger.setLogLevel(Logger.LogLevels.NONE) // output nothing

console.log('---');
logger.debug(`This is a debug message`);
logger.log(`This is a log message`); // alias for debug()
logger.info(`This is a info message`);
logger.warn(`This is a warning`);
logger.error(`This is an error`);
