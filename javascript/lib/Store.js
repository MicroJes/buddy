 var Store = (function() {

     var EventDispatch = (function() {
         var EventDispatch = function() {
             this._listener = {}
         }

         EventDispatch.prototype = {
             constructor: EventDispatch,
             on: function(type, fn) {
                 if (!this._listener[type]) {
                     this._listener[type] = [];
                 }
                 var args = Array.prototype.slice.call(arguments, 1);
                 for (var i = 0; i < args.length; i++) {
                     this._listener[type].push(args[i]);
                 }
                 return this;
             },
             emit: function(type) {
                 var arr = Array.prototype.slice.call(arguments);
                 arr.shift();
                 if (this._listener[type]) {
                     for (var i = 0; i < this._listener[type].length; i++) {
                         this._listener[type][i].apply(this, arr);
                     }
                 }
                 return this;
             },
             remove: function(type) {
                 if (this._listener[type]) {
                     delete this._listener[type];
                 }
                 return this;
             }
         }
         return EventDispatch;
     })();

     var Store = function() {
         if (!(this instanceof Store)) {
             throw new TypeError("A store instance should be new");
             return;
         }
         this._data = {};
     }

     Store.prototype = {
         constructor: Store,
         define: function(type) {
             var defines = {
                 enumerable: true,
                 configurable: true,
                 get: function() {
                     return this._data[type];
                 },
                 set: function(newValue) {
                     var preValue = this._data[type];
                     if (newValue === preValue) {
                         this.emit(type + ":enteringState", newValue);
                     } else {
                         this.emit(type + ":leavingState", preValue);
                         this._data[type] = newValue;
                         this.emit(type + ":enteringState", newValue);
                         this.emit(type + ":changed", newValue);
                     }
                 }
             }
             Object.defineProperty(this, type, defines);
         },
         event: new EventDispatch(),
         init: function(type, value) {
             this.define(type);
             this._data[type] = value;
             this[type] = this._data[type];
         },
         on: function(type, _listener) {
             this.event.on.call(this.event, type, _listener);
         },
         emit: function(type) {
             this.event.emit.apply(this.event, arguments);
         }
     }

     return Store;
 })();
