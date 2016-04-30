(function() {

"use strict";

var Categories = module.parent.require('categories');

exports.filerTopicsPrepare = function(data, callback) {
	var sets = typeof data.set === "string"? [data.set]: data.set;
	Categories.getChildren([data.cid], data.uid, function(err, children) {
		if(children && children[0]) {
			children[0].forEach(function(child) {
				sets.push("cid:" + child.cid + ":tids");
			});
		}
		return callback(null, data);
	});
};


})();
