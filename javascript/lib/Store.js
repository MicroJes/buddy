function EventDispatcher() {
    this.listeners = {};
}

EventDispatcher.prototype = {
    on: function(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
    },
    emit: function(type) {
        var listeners = this.listeners[type];
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        if (typeof window.console !== "undefined") {
            window.console.info("on\t" + type + "\t" + args.join(" , "));
        }
        if (listeners) {
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].apply(this, args);
            }
        }
    },
    off: function(type) {
        delete this.listeners[type];
    }
};

function _predefine(obj, key, value) {
    Object.defineProperty(obj, key, {
        value: value,
        enumerable: false,
        writable: false,
        configurable: false
    });
}

var DEFAULT_OPT = Object.freeze({
    readonly: false,
    // READONLY: cannot delete or directly modify
    // but you can set it's descendants value if it's an object
    state: false,
    // STATE: upon changing, trigger 2 events
    // "enteringState" / "leavingState"
    // instead of a mere "changed" event
    noerror: true,
});

function Store() {
    if (!(this instanceof Store)) {
        throw new TypeError("A store instance should be new");
        return;
    }

    var __data = {},
        __opt = {},
        __fn = {},
        store = this;
    _predefine(this, "event", new EventDispatcher());

    function define(type, option) {
        var defines = {
            enumerable: true,
            get: function() {
                return __data[type];
            }
        }

        __opt[type] = option;

        if (option.readonly) {
            Object.defineProperty(store, type, defines);
            return;
        }

        defines.configurable = true;
        if (typeof option.set === "function") {
            defines.set = option.set;
        } else if (!option.state) {
            defines.set = function(newv) {
                if (newv === __data[type]) {
                    return;
                }
                __data[type] = newv;
                store.emit(type + ":changed", newv);
            }
        } else {
            defines.set = function(newv) {
                var prev = __data[type]
                if (newv === prev) {
                    return;
                }

                store.emit(type + ":leavingState", prev);
                __data[type] = newv;
                store.emit(type + ":enteringState", newv);
            }
        }

        Object.defineProperty(store, type, defines);
    }

    function getVal(initer, noerror) {
        try {
            return typeof initer === "function" ? initer() : initer;
        } catch (err) {
            if (noerror) {
                return;
            }
            throw err;
        }
    }

    _predefine(this, "init", function(type, initer, opt) {
        var option = _.defaults(opt || {}, DEFAULT_OPT);
        option.initializer = typeof initer === "function" ? "function call" : "value assign";

        var val = getVal(initer, option.noerror);
        if (val === null || typeof val === "undefined") {
            return false;
        }

        if (type in __opt) {
            // if defined， use outer initial
            this[type] = val;
            return true;
        }

        define(type, option);
        __data[type] = val; // inner initial

        if (!option.state) {
            store.emit(type + ":ready", __data[type]);
        } else {
            store.emit(type + ":enteringState", __data[type]);
        }

        return true;
    });

    _predefine(this, "valueOf", function(type) {
        return "[Store]";
    });
    _predefine(this, "getDescriptorOf", function(type) {
        if (!(type in __opt)) {
            return null;
        }
        var opt = JSON.parse(JSON.stringify(__opt[type]));
        return _.extend(opt, {
            value: __data[type],
        });
    });
    _predefine(this, "eventsHappened", {});
}

Store.prototype = {
    upon: function(evt, fn) {
        this.uponAll([evt], fn);
    },
    uponAll: function(args, fn) {
        if (!(args instanceof Array) || typeof fn !== "function") {
            throw new TypeError("Parameter error, should be array and function");
        }

        var counter = (function(total, callback) {
            var i = 0;
            return function() {
                i++;
                if (i >= total) {
                    callback();
                }
            }
        })(args.length, fn);

        var store = this;
        args.forEach(function(evtName) {
            if (!(evtName in store.eventsHappened)) {
                store.once(evtName, counter);
            } else {
                counter();
            }
        });
    },
    uponAny: function(args, fn) {
        if (!(args instanceof Array) || typeof fn !== "function") {
            throw new TypeError("Parameter error, should be array and function");
        }

        var counter = (function(total, callback) {
            var i = 0;
            return function() {
                i++;
                if (i === 1) {
                    callback();
                }
            }
        })(args.length, fn);

        var store = this;
        args.forEach(function(evtName) {
            if (!(evtName in store.eventsHappened)) {
                store.once(evtName, counter);
            } else {
                counter();
            }
        });
    },
    uponNone: function(args, fn) {
        if (!(args instanceof Array) || typeof fn !== "function") {
            throw new TypeError("Parameter error, should be array and function");
        }

        var store = this;
        args.every(function(evtName) {
            return !(evtName in store.eventsHappened);
        }) && fn();
    },
    print: function(event){
        console.log(event);
    },
};

[
    "addListener", "on", "once",
    "removeListener", "removeAllListeners",
    "setMaxListeners", "listeners", "listenerCount"
].forEach(function(key) {
    Store.prototype[key] = function() {
        this.event[key].apply(this.event, arguments);
    };
});
Store.prototype.emit = function() {
    this.eventsHappened[arguments[0]] = 1;
    this.print(arguments[0]);
    this.event.emit.apply(this.event, arguments);
};
Store.prototype.constructor = Store;

Object.defineProperty(Store.prototype, "allListener", {
    get: function() {
        return Object.keys(this.event._events);;
    },
    enumerable: false,
    configurable: false
});
Object.defineProperty(Store.prototype, "allData", {
    get: function() {
        return Object.keys(this);
    },
    enumerable: false,
    configurable: false
})

module.exports = Store;