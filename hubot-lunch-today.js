/**
 * Description:
 *   Hubot WeirdMeetup Blog Reader
 *
 * Commands:
 *   hubot lunch
 *   hubot lunch num|help
 *
 * Author:
 *   @golbin
 */

var path = require('path'),
    menu = require(path.join(__dirname, '/libs/menu'));

var CACHED_MENU = '';
    UPDATED = 0;
    CACHE_EXPIRES = 60 * 1000; // milliseconds 1분에 한 번씩

module.exports = function(robot) {
  robot.respond(/lunch(\s*([0-9a-z]*))/i, function(msg) {
    var menuNum = null;

    if (msg.match[2]) {
      if (isNaN(msg.match[2])) {
        msg.send('lunch | lunch num');
        return;
      } else {
        menuNum = msg.match[2];
      }
    }

    if (menuNum !== null) {
      var selected = menu.select(menuNum);
      if (selected) {
        CACHED_MENU = selected;
      } else {
        msg.send('해당하는 번호의 메뉴가 없습니다.');
        return;
      }
    } else if (Date.now() < UPDATED + CACHE_EXPIRES) {
      msg.send('추천메뉴: ' + CACHED_MENU);
      msg.send('메뉴 추천은 1분에 한 번만 가능합니다. 1분 후에 다시 시도해주세요.');
      return;
    } else {
      CACHED_MENU = menu.random();
    }

    UPDATED = Date.now();
    msg.send(CACHED_MENU);
  });
};
