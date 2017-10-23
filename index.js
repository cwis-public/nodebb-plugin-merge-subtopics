(function() {
  "use strict";

  var Categories = module.parent.require("./categories");
  var db = module.parent.require("./database");

  exports.filterTopicsPrepare = function(data, callback) {
    var sets = typeof data.set === "string" ? [data.set] : data.set;
    getCategoryIDs(data.data.cid, function(err, children) {
      if (children.length > 0) {
        children.forEach(function(child) {
          sets.push("cid:" + child + ":tids");
        });
      }
      data.set = [{ unionArray: sets }];
      return callback(null, data);
    });
  };

  exports.init = function init(params, callback) {
    var orig_getSortedSetRevIntersect = db.getSortedSetRevIntersect;
    db.getSortedSetRevIntersect = function(params, callback) {
      var sets = params.sets;
      if (Array.isArray(sets) && sets[0] && sets[0].unionArray) {
        return db.getSortedSetRevRange(
          sets[0].unionArray,
          params.start,
          params.stop,
          callback
        );
      } else {
        return orig_getSortedSetRevIntersect.apply(this, arguments);
      }
    };

    var orig_getSortedSetIntersect = db.getSortedSetIntersect;
    db.getSortedSetIntersect = function(params, callback) {
      var sets = params.sets;
      if (Array.isArray(sets) && sets[0] && sets[0].unionArray) {
        return db.getSortedSetRange(
          sets[0].unionArray,
          params.start,
          params.stop,
          callback
        );
      } else {
        return orig_getSortedSetIntersect.apply(this, arguments);
      }
    };

    return callback();
  };

  function getCategoryIDs(cid, resolve) {
    var _key = new RegExp("^" + "category:");
    var dbClient = db.client; // get the database client
    var find = { parentCid: cid.toString(), _key: { $regex: _key } };
    var option = { cid: true };
    dbClient
      .collection("objects")
      .find(find, option)
      .toArray(function(err, response) {
        if (err) {
          resolve(err, null);
        } else {
          var cidsArray = [];
          response.forEach(function(value, itration) {
            cidsArray.push(parseInt(value.cid));
          });
          resolve(null, cidsArray);
        }
      });
  }
})();
