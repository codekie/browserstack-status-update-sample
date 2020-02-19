browserstack-status-update-sample
=================================

This repo only exists to reproduce an issue that I'm having with updating a session-status on browserstack.

The issue is that after each test-suite, a session-update will be sent to Browserstack. The request contains a status
and a reason (if the suite had at least one failing test). In this setup, it seems that the status is applied, but the
reason is ignored (or overwritten).


Requirements
------------

Required node version: `lts/dubnium`


Installation
------------

`npm install`


Configuration
-------------

Following environment-variables have to be set:

- `BROWSERSTACK_USER`: Browserstack-username
- `BROWSERSTACK_ACCESS_KEY`: Access-key for the user


Run the tests
-------------

`npm run test`


Important Files
---------------

- The function (`sendBrowserStackSessionStatus`) which sends the session-update to browserstack, is located
  in `test/e2e/util/browserstack.js`
- The hook (`afterEach`) that triggers the session update (which is executed after every completed test-suite) is
  located in `test/config/nightwatch-globals.js`
    - Setting the artificial delay `DELAY__BROWSERSTACK_STATUS` so something like `5000`ms (may vary between a value of
      `1000` and `15000` to make it work), will make the `reason` work
- The Nightwatch-configuration for Browserstack is in `test/config/nightwatch-browserstack.conf.js`
- The test-suites are in `test/e2e/scenarios`

