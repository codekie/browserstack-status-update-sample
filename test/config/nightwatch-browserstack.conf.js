'use strict';

/* eslint-disable camelcase */

const cloneDeep = require('lodash.clonedeep');
const BaseConfig = require('./nightwatch-base');

const LAUNCH_URL = BaseConfig.test_settings.default.launch_url;
const BROWSERSTACK_USER = process.env.BROWSERSTACK_USER;
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;
const BROWSERSTACK_BUILD_KEY = process.env.BROWSERSTACK_BUILD_KEY;

const CommonCapabilities = {
    'browserstack.console': 'errors',
    'browserstack.key': BROWSERSTACK_ACCESS_KEY,
    'browserstack.local': true,
    'browserstack.networkLogs': true,
    'browserstack.user': BROWSERSTACK_USER,
    'browserstack.debug': true,
    acceptSslCerts: true,
    name: 'Bstack-[Nightwatch] Parallel Test',
    project: 'debugging-status-update',
    build: BROWSERSTACK_BUILD_KEY   // Key is set in the `runner-browserstack.local.js`
};

module.exports = _createConfig();

function _createConfig() {
    const config = cloneDeep(BaseConfig);
    delete config.webdriver;
    delete config.test_workers;
    _setSelenium(config);
    _setTestSettings(config);
    return config;
}

function _setSelenium(config) {
    config.selenium = {
        start_process: false,
        host: 'hub-cloud.browserstack.com',
        port: 80
    };
    config.test_settings.selenium_host = config.selenium.host;
    config.test_settings.selenium_port = config.selenium.port;
    return config;
}

function _setTestSettings(config) {
    delete config.test_settings.dev;
    delete config.test_settings.default;
    config.test_settings.chrome = _createSettings({
        os: 'Windows',
        os_version: '10',
        browser: 'Chrome'
    });
    return config;
}

function _createSettings(capabilities) {
    return {
        launch_url: LAUNCH_URL,
        desiredCapabilities: {
            ...CommonCapabilities,
            ...capabilities
        }
    };
}
