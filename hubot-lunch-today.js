/**
 * Description:
 *   Hubot WeirdMeetup Blog Reader
 *
 * Commands:
 *   hubot lunch
 *   hubot lunch num|help
 *   hubot lunch party
 *   hubot lunch party num
 *
 * Author:
 *   @golbin
 */

var path = require('path'),
    menu = require(path.join(__dirname, '/libs/menu'));
    party = require(path.join(__dirname, '/libs/party'));

var CACHED_MENU = '',
    CACHED_MENU_IMAGE = '',
    UPDATED = 0,
    CACHE_EXPIRES = 60 * 1000; // milliseconds 1분에 한 번씩

var imageMe = function (msg, query, cb) {
  var q = {
    v: '1.0',
    rsz: '8',
    q: query,
    safe: 'active'
  };

  msg.http('http://ajax.googleapis.com/ajax/services/search/images')
    .query(q)
    .get()(function(err, res, body) {
      images = JSON.parse(body);
      images = images.responseData ? images.responseData.results : null;

      if (images && images.length > 0) {
        image = msg.random(images);
        return cb(image.unescapedUrl);
      }
    });
};

var ensureImageExtension = function(url) {
  var ext = url.split('.').pop();

  if (/(png|jpe?g|gif)/i.test(ext)) {
    return url;
  } else {
    return url + ".png";
  }
};

var getSlackMembers = function (callback) {
  var q = {
    token: 'process.env.HUBOT_SLACK_TOKEN'
  };

  var members;

  msg.http('https://slack.com/api/users.list')
  .query(q)
  .get()(function(err, res, body) {
    for (var member in JSON.parse(body).members) {
      members.push(member.name);
    }

    return callback(members);
  });
};

var suggestParty = function (msg, partyNum) {
  getSlackMembers(function (members) {
    var parties = party.shake(members, partyNum);

    msg.send("오늘의 점심 파티는 다음과 같습니다. 다들 맛점하세요!");

    for (var i = 0; i < parties.length; i++) {
      msg.send((i + 1) + "팀" + parties[i]);
    }
  });
};

var suggestMenu = function (msg, menuNum) {
  var isCached = false;

  var message = '';
  if (menuNum !== null) {
    var selected = menu.select(menuNum);
    if (selected) {
      message = '선택하신 메뉴: ' + selected;
    } else {
      message = '해당하는 번호의 메뉴가 없습니다.';
    }
  } else if (Date.now() < UPDATED + CACHE_EXPIRES) {
    isCached = true;
    message = '새로운 메뉴 추천은 1분에 한 번만 가능합니다. 1분 후에 다시 시도해주세요.\n기추천메뉴: ' + CACHED_MENU;
  } else {
    CACHED_MENU = menu.random();
    UPDATED = Date.now();
    message = '추천메뉴: ' + CACHED_MENU;
  }

  if (!isCached) {
    imageMe(msg, CACHED_MENU, function(url) {
      CACHED_MENU_IMAGE = url;
      msg.send(message);
      msg.send(CACHED_MENU_IMAGE);
    });      
  } else {
    msg.send(message);
    msg.send(CACHED_MENU_IMAGE);
  }
};

module.exports = function(robot) {
  robot.respond(/lunch(\s*([0-9a-z]*))/i, function(msg) {
    if (msg.match[2] === 'party') {
      if (isNaN(msg.match[3])) {
        suggestParty(msg, null);
      } else {
        suggestParty(msg, msg.match[3]);
      }
    } else if (isNaN(msg.match[2])) {
      suggestMenu(msg, null);
    } else {
      suggestMenu(msg, msg.match[2]);
    }
  });
};
