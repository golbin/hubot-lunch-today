var shake = function (members, partyNum) {
  var parties = [], memberNum = 0;

  members = shuffle(members);

  if (!partyNum || partyNum > members.length) {
    partyNum = Math.floor(Math.random() * members.length / 7) + 2;
  }

  memberNum = Math.ceil(members.length / partyNum);

  for (var i = 0; i < partyNum; i++) {
    parties.push(members.slice(i * memberNum, (i + 1) * memberNum));
  }

  return parties;
};

// code from http://stackoverflow.com/a/6274398
function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

module.exports = {
  shake: shake
};
