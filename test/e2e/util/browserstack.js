'use strict';

const fetch = require('node-fetch');

const STATUS__FAILED = 'failed';
const STATUS__PASSED = 'passed';
const BROWSERSTACK__USER = process.env.BROWSERSTACK_USER;
const BROWSERSTACK__ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;
const createBrowserStackSuccessUrl = _urlFactory`https://api.browserstack.com/automate/sessions/${0}.json`;

module.exports = {
    isBrowserStackEnabled,
    sendBrowserStackSessionStatus
};

function isBrowserStackEnabled() {
    return process.env.BROWSERSTACK === 'true';
}

async function sendBrowserStackSessionStatus(sessionId, testsSuccessful, { reason } = {}) {
    if (!BROWSERSTACK__USER || !BROWSERSTACK__ACCESS_KEY) {
        return;
    }
    if (!sessionId) {
        console.log('sendBrowserStackSessionStatus: Session-ID is unavailable. Can\'t update status');
        return;
    }
    console.log(`sendBrowserStackSessionStatus: Sending status to Browserstack for session: ${ sessionId }`);
    let result;
    try {
        result = await _sendStatus(sessionId, testsSuccessful, { reason });
        if (!result.ok) {
            //noinspection ExceptionCaughtLocallyJS
            throw new Error(result.statusText);
        }
        const jsonResponse = await result.json();
        console.log('sendBrowserStackSessionStatus: Browserstack-repsonse:');
        console.log(JSON.stringify(jsonResponse, null, '  '));
        console.log('sendBrowserStackSessionStatus: Sending status to Browserstack has been successful');
    } catch (e) {
        console.error(`sendBrowserStackSessionStatus: ${
            (new Date).toUTCString()
        } Error while sending status to browserstack: ${ e.message }`);
        console.error(e.stack);
        throw e;
    }
    return result;
}

async function _sendStatus(sessionId, testsSuccessful, { reason } = {}) {
    return fetch(createBrowserStackSuccessUrl(sessionId), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: _createAuthorization(BROWSERSTACK__USER, BROWSERSTACK__ACCESS_KEY)
        },
        body: JSON.stringify({
            status: testsSuccessful
                ? STATUS__PASSED
                : STATUS__FAILED,
            ...(reason ? { reason } : {})
        })
    });
}

function _urlFactory(segs) {
    return sessionId => `${ segs[0] }${ sessionId }${ segs[1] }`;
}

function _createAuthorization(username, accessKey) {
    return `Basic ${
        Buffer.from(`${ username }:${ accessKey }`).toString('base64')
    }`;
}
