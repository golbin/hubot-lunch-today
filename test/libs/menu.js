var nodeunit = require('nodeunit');

var path = require('path'),
    menu = require(path.resolve('libs', 'menu'));

exports['menu library'] = nodeunit.testCase({
  'Random menu': function (test) {
    test.equal(typeof menu.random(), 'string');
    test.done();
  },
  'Select menu': function (test) {
    test.equal(typeof menu.select(0), 'string');
    test.done();
  },
  'Menu is not exists': function (test) {
    test.equal(menu.select(-1), null);
    test.done();
  },
});
