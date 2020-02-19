module.exports = {
    before(browser) {
        browser.url('https://www.google.com');
    },

    'Expecting to find some random element': function(browser) {
        browser.expect.element('#does_not_exist').to.be.visible;
    }
};
