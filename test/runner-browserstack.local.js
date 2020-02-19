'use strict';

// IMPORTS

const nanoid = require('nanoid');
const Nightwatch = require('nightwatch');
const browserstack = require('browserstack-local');

// CONSTANTS

const ARGV__ENV__SHORT = '-e';
const ARGV__ENV__LONG = '--env';
const CI__JOB_ID = process.env.CI_JOB_ID;
const CI__JOB_NAME = process.env.CI_JOB_NAME;
const CI__COMMIT_REF_NAME = process.env.CI_COMMIT_REF_NAME;
const CI__COMMIT_SHORT_SHA = process.env.CI_COMMIT_SHORT_SHA;
const BROWSERSTACK__ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;
const PATH__NIGHTWATCH = require.resolve('nightwatch/bin/nightwatch');
const PREFIX__LOCAL_JOB = 'Local';
const _runBrowsersInParallel = process.env.BROWSERSTACK_PARALLEL === 'true';

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
    } catch (ex) {
        console.log('There was an error while starting the test runner:\n\n');
        process.stderr.write(ex.stack + '\n');
        _shutdown(process, bsLocal, { exitCode: 2 });
    }
}

function _setBuildKey() {
    process.env.BROWSERSTACK_BUILD_KEY = CI__JOB_NAME && CI__COMMIT_REF_NAME  // If running as CI-job
        ? `${ CI__JOB_NAME } :: ${ CI__COMMIT_REF_NAME } :: ${ CI__COMMIT_SHORT_SHA } :: ${ CI__JOB_ID }`
        : `${ PREFIX__LOCAL_JOB } :: ${ nanoid() }`;
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
    if (_runBrowsersInParallel) {
        await _runNightwatchEnvironments();
    } else {
        await _runEnvironmentsSequential(process.argv);
    }
    bsLocal.stop(function () {});
}

async function _runEnvironmentsSequential(argv, { callback } = {}) {
    const success = {};
    for await (let [env, possibleError] of _generateSettingsSequence(argv)) {
        success[env] = possibleError;
    }
    callback && callback(success);
}

async function* _generateSettingsSequence(argv) {
    let indexEnv = argv.indexOf(ARGV__ENV__SHORT);
    if (indexEnv === -1) {
        indexEnv = argv.indexOf(ARGV__ENV__LONG);
    }
    if (indexEnv === -1) { return argv; }
    const envs = argv[indexEnv + 1].split(',');
    for (let env of envs) {
        const possibleError = await _runNightwatchEnvironments(env);
        yield [env, !possibleError];
    }
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
