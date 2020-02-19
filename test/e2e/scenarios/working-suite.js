// IMPORTS

module.exports = {
    before(browser) {
        browser.url('https://www.google.com');
    },

    'There should be the logo': function(browser) {
        browser.expect.element('#hplogo').to.be.visible;
    }
};
