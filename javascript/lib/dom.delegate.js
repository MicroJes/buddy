module.exports = function() {
	HTMLDocument.prototype.delegate = delegate;
	HTMLElement.prototype.delegate = delegate;
};

function delegate(events, selector, fn) {
	function getTarget(parent, target) {
		var children = parent.querySelectorAll(selector);
		for (var i = 0, l = children.length; i < l; i++) {
			if (children[i] === target) {
				return children[i];
			} else if(children[i].contains(target)){
				return children[i];
			}
		}
		return false;
	}
	var parent = this;

	events.split(" ").forEach(function(evt) {
		parent.addEventListener(evt, function(e) {
			var target = getTarget(parent, e.target);
			if (!target) {
				return false;
			}
			fn.apply(target, arguments);
		}, false);
	})
}
