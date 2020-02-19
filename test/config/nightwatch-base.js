'use strict';

// IMPORTS

const path = require('path');
const chromeDriver = require('chromedriver');
const EnvSettings = require('./environment-settings');

// CONSTANTS

const Path = {
    tests: path.join(__dirname, '../e2e/scenarios'),
    output: path.join(__dirname, '../../reports/e2e')
};
const FILE_PATH__EXCLUDE = path.join(__dirname, '../e2e/scenarios/_common');
const FILE_PATH__GLOBALS = path.join(__dirname, 'nightwatch-globals.js');
const WORKERS_AUTO = 'auto';

// Disable rule, because a configuration will be supplied, which require that exact naming
/* eslint-disable camelcase */

module.exports = {
    exclude: FILE_PATH__EXCLUDE,
    globals_path: FILE_PATH__GLOBALS,
    live_output: true,
    output_folder: Path.output,
    src_folders: [Path.tests],
    test_settings: EnvSettings,
    test_workers: {
        enabled: true,
        workers: WORKERS_AUTO
    },
    webdriver: {
        start_process: true,
        server_path: chromeDriver.path,
        port: 9515
    }
};
