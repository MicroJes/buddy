var DEFAULT_OPT = {
	ITimeout: function() {},
	IProgress: function() {},
	IStart: function() {},
	IClear: function() {},
	interval: 3000,
	count: 1,
	innerInterval: 66
};

function CountdownTimer(options) {
	_.extend(this, DEFAULT_OPT);
	_.extend(this, options);
	this.timer = null;
	this.startTime = null;
}

CountdownTimer.prototype = {
	start: function() {
		if (this.startTime) {
			this.tick();
		} else {
			this.startTime = +new Date;
			this.lastTime = +new Date;
			this.left = this.count;
			this.passed = 0;
			this.timer = setTimeout(this.tick.bind(this), this.innerInterval);
			this.IStart();
		}
	},
	tick: function() {
		var curTime = +new Date;
		var left = this.count - Math.ceil(
			(curTime - this.startTime) / this.interval
		);
		this.left = left + 1;
		this.passed = this.count - this.left;
		if (left < 0) {
			this.left = 0;
			this.ITimeout();
			this.clear();
		} else {
			if (curTime - this.lastTime > this.interval) {
				this.lastTime = curTime;
				this.IProgress();
			}
			this.timer = setTimeout(this.tick.bind(this), this.innerInterval);
		}
	},
	clear: function() {
		clearTimeout(this.timer);
		this.timer = null;
		this.startTime = null;
		this.IClear();
	}
};

module.exports = CountdownTimer;