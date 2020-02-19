'use strict';

const { sendBrowserStackSessionStatus } = require('../e2e/util/browserstack');
const { isBrowserStackEnabled } = require('../e2e/util/browserstack');

const TIMEOUT__ASSERTIONS = 10000;
const DELAY__BROWSERSTACK_STATUS = 0;
//const DELAY__BROWSERSTACK_STATUS = 5000;

module.exports = {
    abortOnAssertionFailure : false,
    waitForConditionTimeout : TIMEOUT__ASSERTIONS,

    default: {
        isDefault: true
    },

    // Before every test-suite
    beforeEach(browser, done) {
        // TODO check if this might be a problem, if the screen-size is smaller than the window-size
        browser.resizeWindow(1280, 960, done);
    },

    // After every test-suite
    async afterEach() {
        const { status, reason } = _collectErrors(this.client.currentTest.results);
        const sessionId = this.client.sessionId;
        isBrowserStackEnabled() && setTimeout(
            () => sendBrowserStackSessionStatus(sessionId, status, { reason }),
            // TODO For some reason (which I was not able to figure out), the `reason` won't be applied if the
            //      status is sent immediately (regardless of waiting for the returned promise to resolve, or not)
            DELAY__BROWSERSTACK_STATUS
        );
    },
};

function _collectErrors(results) {
    const testsSuccessful = !results.errors && !results.failed;
    if (testsSuccessful) {
        return { status: true };
    }
    return {
        status: false,
        reason: Object.entries(results.testcases)
            .reduce((res, [testCaseName, { lastError }]) => {
                if (!lastError) {
                    return res;
                }
                res.push(`- ${ testCaseName }`);
                return res;
            }, [])
            .join('\n')
    };
}
