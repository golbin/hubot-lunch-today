var nodeunit = require('nodeunit');

var path = require('path'),
    party = require(path.resolve('libs', 'party'));

var members = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

exports['menu library'] = nodeunit.testCase({
  'Random party': function (test) {
    var parties = party.shake(members);

    test.ok(parties && parties.length);
    test.done();
  },
  'Random party with party number': function (test) {
    var parties = party.shake(members, 3);

    test.ok(parties && parties.length);
    test.ok(parties.length === 3);
    test.done();
  },
});
