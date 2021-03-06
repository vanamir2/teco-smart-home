const createError = require('http-errors');
const express = require('express');
const path = require('path');
const app = express();
const logger = require('logplease').create('backend-app');

// https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded/51844327
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // To use express inbuild middleware that recognize incoming request object as JSON object.
app.use(bodyParser.urlencoded({extended: true})); // To recognize incoming request object as strings or arrays.
app.use(express.static(path.join(__dirname, '../public')));

// incoming request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next()
});

// ---------------------- ENDPOINTS
app.use('/', require('../routes'));

// IMPORTANT - enables client routing
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
} else {
    // load env file
    require("dotenv").config();
    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });
}

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
