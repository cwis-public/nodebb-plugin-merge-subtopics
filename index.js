(function() {

"use strict";

var Categories = module.parent.require('./categories');
var db = module.parent.require('./database');

exports.filterTopicsPrepare = function(data, callback) {
	var sets = typeof data.set === "string"? [data.set]: data.set;
	Categories.getChildren([data.cid], data.uid, function(err, children) {
		if(children && children[0]) {
			children[0].forEach(function(child) {
				sets.push("cid:" + child.cid + ":tids");
			});
		}
		data.set = [ { unionArray: sets } ];
		return callback(null, data);
	});
};

exports.init = function init(callback) {
	var orig_getSortedSetRevIntersect = db.getSortedSetRevIntersect;
	db.getSortedSetRevIntersect = function(params, callback) {
		var sets = params.sets;
		if(Array.isArray(sets) && sets[0] && sets[0].unionArray) {
			return db.getSortedSetRevRange(sets[0].unionArray, params.start, params.stop, callback);
		} else {
			return orig_getSortedSetRevIntersect.apply(this, arguments);
		}
	};

	var orig_getSortedSetIntersect = db.getSortedSetIntersect;
	db.getSortedSetIntersect = function(params, callback) {
		var sets = params.sets;
		if(Array.isArray(sets) && sets[0] && sets[0].unionArray) {
			return db.getSortedSetRange(sets[0].unionArray, params.start, params.stop, callback);
		} else {
			return orig_getSortedSetIntersect.apply(this, arguments);
		}
	};

	return callback();
};

})();
