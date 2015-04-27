/**
 * Description:
 *   Hubot WeirdMeetup Blog Reader
 *
 * Commands:
 *   hubot lunch
 *   hubot lunch num|help
 *   hubot lunch party
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

var getSlackMembers = function (msg, callback) {
  var q = {
    token: process.env.HUBOT_SLACK_TOKEN
  };

  var members = [];

  msg.http('https://slack.com/api/users.list')
  .query(q)
  .get()(function(err, res, body) {
    JSON.parse(body).members.forEach(function (member) {
      if (member.is_bot === false && member.deleted === false) {
        if (member.real_name) {
          member.real_name = member.real_name.split(' ');
          member.real_name = member.real_name[1] ? member.real_name[1] + member.real_name[0] : member.real_name[0];
          members.push(member.real_name);
        } else {
          members.push(member.name);
        }        
      }
    });

    return callback(members);
  });
};

var suggestParty = function (msg, partyNum, callback) {
  getSlackMembers(msg, function (members) {
    var parties = party.shake(members, partyNum),
        memberText = [];

    var partyInfo = {
      message: "오늘의 점심 파티는 다음과 같습니다. 다들 맛점하세요! (12시 30분 이후의 첫번째 제안을 사용!!)"
    };

    for (var i = 0; i < parties.length; i++) {
      memberText.push((i + 1) + "팀: " + parties[i]);
    }

    partyInfo.memberText = memberText.join("\n");

    callback(partyInfo);
  });
};

var suggestMenu = function (msg, menuNum, callback) {
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
      callback({
        message: message,
        image: CACHED_MENU_IMAGE
      });
    });
  } else {
    callback({
      message: message,
      image: CACHED_MENU_IMAGE
    });
  }
};

module.exports = function(robot) {
  robot.respond(/lunch(\s*([0-9a-z]*))/i, function(msg) {
    var menuNum = null,
        action = null;

    if (msg.match[2]) {
      if (msg.match[2] === 'party') {
        action = 'party';
      } else if (isNaN(msg.match[2])) {
        msg.send('lunch | lunch num');
        return;
      } else {
        menuNum = msg.match[2];
      }
    }

    if (action === 'party') {
      suggestParty(msg, null, function (partyInfo) {
        msg.send(partyInfo.message);
        msg.send(partyInfo.memberText);
      });
    } else {
      suggestMenu(msg, menuNum, function (menuInfo) {
        msg.send(menuInfo.message);
        msg.send(menuInfo.image);
      });      
    }
  });
};
