'use strict';

// IMPORTS

const nanoid = require('nanoid');
const Nightwatch = require('nightwatch');
const browserstack = require('browserstack-local');

// CONSTANTS

const BROWSERSTACK__ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;
const PATH__NIGHTWATCH = require.resolve('nightwatch/bin/nightwatch');
const PREFIX__LOCAL_JOB = 'Local';

// RUN

_run();

// IMPLEMENTATION DETAILS

function _run() {
    let bsLocal;
    try {
        _setBuildKey();
        process.mainModule.filename = PATH__NIGHTWATCH;

        // Code to start browserstack local before start of test
        bsLocal = _startBrowserstackLocal();
    } catch (e) {
        console.log('There was an error while starting the test runner:\n\n');
        process.stderr.write(e.stack + '\n');
        _shutdown(process, bsLocal, { exitCode: 2 });
    }
}

function _setBuildKey() {
    process.env.BROWSERSTACK_BUILD_KEY = `${ PREFIX__LOCAL_JOB } :: ${ nanoid() }`;
}

function _startBrowserstackLocal() {
    console.log('Connecting Browserstack');
    const bsLocal = new browserstack.Local();
    // eslint-disable-next-line camelcase
    Nightwatch.bs_local = bsLocal;
    bsLocal.start({'key': BROWSERSTACK__ACCESS_KEY }, async function (error) {
        if (error) {
            throw error;
        }
        console.log('Connected. Now testing...');
        _bindSignals(process, bsLocal);
        _bindEvents(process, bsLocal);
        await _runNightwatch(bsLocal);
    });
    return bsLocal;
}

async function _runNightwatch(bsLocal) {
    await _runNightwatchEnvironments();
    bsLocal.stop(function () {});
}

function _runNightwatchEnvironments(environmentsString) {
    return new Promise((resolve) => {
        Nightwatch.cli(function (argv) {
            if (environmentsString) {
                // Replace the environments that have been passed via CLI, with the environments passed as argument
                argv.e = environmentsString;
                argv.env = environmentsString;
            }
            Nightwatch.CliRunner(argv)
                .setup()
                .runTests(function (possibleError) {
                    resolve(possibleError);
                });
        });
    });
}

function _bindSignals(process, bsLocal) {
    // Gracefully shutdown on signals
    [
        'SIGINT',
        'SIGTERM'
    ].forEach(signal => process.on(signal, () => _shutdown(process, bsLocal)));
}

function _bindEvents(process, bsLocal) {
    // Gracefully shutdown on errors
    process.on('uncaughtException', err => _logErrorAndShutdown(bsLocal, err));
    process.on('unhandledRejection', err => _logErrorAndShutdown(bsLocal, err));
}

function _logErrorAndShutdown(bsLocal, err) {
    err && _logError(err);
    try {
        _shutdown(process, bsLocal, { exitCode: 1 });
    } catch (e) {
        _logError(e);
        process.exit(1);
    }
}

function _shutdown(process, bsLocal, { exitCode = 0 } = {}) {
    console.log('Disconnecting Browserstack');
    bsLocal.stop(() => {
        console.log('\nDisconnected Browserstack. Exiting now\n');
        process.exit(exitCode);
    });
}

function _logError(error) {
    console.error((new Date).toUTCString() + ' uncaughtException:', error.message);
    console.error(error.stack);
}
