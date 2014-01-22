/*! blutils 0.4.0 Original author Alan Plum <me@pluma.io>. Released into the Public Domain under the UNLICENSE. @preserve */
var Promise = require('bluebird'),
  slice = Function.prototype.call.bind(Array.prototype.slice);

exports.eacharg = peacharg;
exports.allargs = pallargs;
exports.tee = ptee;
exports.seq = pseq;
exports.append = pappend;
exports.prepend = pprepend;
exports.guard = pguard;

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

function pseq() {
  var fns = slice(arguments, 0);
  return function(arg) {
    var p = Promise.cast(arg);
    fns.forEach(function(fn) {
      p = p.then(fn);
    });
    return p;
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

function pguard(fn, handleFail) {
  return function(value) {
    try {
      return Promise
      .cast(fn(value))
      .catch(handleFail);
    } catch(err) {
      return handleFail(err);
    }
  };
}