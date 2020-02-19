const path = require('path');

const LAUNCH_URL = 'https://www.google.com';
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
    const config = {
        globals_path: path.join(__dirname, 'nightwatch-globals.js'),
        live_output: true,
        output_folder: path.join(__dirname, '../../reports/e2e'),
        src_folders: [path.join(__dirname, '../e2e/scenarios')],
        test_settings: {
            chrome: _createSettings({
                os: 'Windows',
                os_version: '10',
                browser: 'Chrome'
            })
        }
    };
    _setSelenium(config);
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

function _createSettings(capabilities) {
    return {
        launch_url: LAUNCH_URL,
        desiredCapabilities: {
            ...CommonCapabilities,
            ...capabilities
        }
    };
}
