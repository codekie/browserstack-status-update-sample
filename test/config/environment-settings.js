'use strict';

/**
 * Containts the environment-settings for Nightwatch, on a local instance (mock-server)
 */

const { ChromeOption } = require('./chrome-option');

const LAUNCH_URL = 'https://www.google.com';

const Browser = {
    chrome: 'chrome'
};

// Disable rule, because a configuration will be supplied, which require that exact naming
/* eslint-disable camelcase */

const DefaultSettings = {
    launch_url: LAUNCH_URL,
    desiredCapabilities: {
        browserName: Browser.chrome,
        chromeOptions: {
            args: [
                ChromeOption.noSandbox,
                ChromeOption.disableGpu
            ]
        }
    }
};

module.exports = {
    default: DefaultSettings,
    dev: DefaultSettings
};
