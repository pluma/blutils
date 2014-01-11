/*! blutils 0.1.0 Copyright (c) 2014 Alan Plum. MIT licensed. @preserve */
var Promise = require('bluebird'),
  slice = Function.prototype.call.bind(Array.prototype.slice);

exports.eacharg = peacharg;
exports.allargs = pallargs;
exports.tee = ptee;
exports.append = pappend;
exports.prepend = pprepend;
exports.transform = ptransform;

function peacharg() {
  var fns = slice(arguments, 0), n = fns.length;
  return function(arr) {
    return Promise.all(arr.map(function(arg, i) {
      return fns[i % n](arg);
    }));
  };
}

function pallargs() {
  var fns = slice(arguments, 0);
  return function(arg) {
    return Promise.all(fns.map(function(fn) {
      return fn(arg);
    }));
  };
}

function ptee(fn) {
  return function(arg) {
    return Promise.cast(fn(arg)).thenReturn(arg);
  };
}

function pappend(fn) {
  return function(arg) {
    return Promise.cast(fn(arg)).then(function(result) {
      return Promise.all((Array.isArray(arg) ? arg : [arg]).concat(result));
    });
  };
}

function pprepend(fn) {
  return function(arg) {
    return Promise.cast(fn(arg)).then(function(result) {
      return Promise.all((Array.isArray(result) ? result : [result]).concat(arg));
    });
  };
}

function ptransform(props, opts) {
  props = props || {};
  opts = opts || {keep: false, skipMissing: false};
  var keys = Object.keys(props);
  return function(data) {
    var dataKeys = Object.keys(data),
      result = {};

    if (opts.keep) {
      dataKeys.forEach(function(key) {
        result[key] = data[key];
      });
    }

    if (opts.skipMissing) {
      keys = keys.filter(function(key) {
        return ~dataKeys.indexOf(key);
      });
    }

    return Promise.all(keys.map(function(key) {
      var trans = props[key];
      return Promise.cast(typeof trans === 'function' ? trans(data[key]) : trans)
      .then(function(value) {
        result[key] = value;
      });
    }))
    .thenReturn(result);
  };
}
