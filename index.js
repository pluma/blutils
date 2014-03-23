/*! blutils 0.7.0 Original author Alan Plum <me@pluma.io>. Released into the Public Domain under the UNLICENSE. @preserve */
var Promise = require('bluebird'),
  slice = Function.prototype.call.bind(Array.prototype.slice);

exports.eacharg = peacharg;
exports.allargs = pallargs;
exports.tee = ptee;
exports.seq = pseq;
exports.append = pappend;
exports.prepend = pprepend;
exports.guard = pguard;
exports.mutate = pmutate;

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

function ptee() {
  var fns = slice(arguments, 0);
  return function(arg) {
    var p = Promise.cast(arg);
    fns.forEach(function(fn) {
      p = p.then(fn);
    });
    return p.thenReturn(arg);
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

function pappend() {
  var fns = slice(arguments, 0);
  return function(arg) {
    var p = Promise.cast(arg);
    fns.forEach(function(fn) {
      p = p.then(fn);
    });
    return p.then(function(result) {
      return Promise.all(
        (Array.isArray(arg) ? arg : [arg]).concat(result)
      );
    });
  };
}

function pprepend() {
  var fns = slice(arguments, 0);
  return function(arg) {
    var p = Promise.cast(arg);
    fns.forEach(function(fn) {
      p = p.then(fn);
    });
    return p.then(function(result) {
      return Promise.all(
        (Array.isArray(result) ? result : [result]).concat(arg)
      );
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

function pmutate(mutation) {
  return function(arg) {
    var arr = [];
    Object.keys(arg).forEach(function(key) {
      if (typeof mutation[key] === 'object') {
        arr.push(pmutate(mutation[key])(arg[key]));
      }
      else if (typeof mutation[key] === 'function') {
        arr.push(
          Promise
          .cast(arg[key])
          .then(mutation[key])
          .then(function(result) {
            arg[key] = result;
          })
        );
      }
    });
    return Promise.all(arr)
    .thenReturn(arg);
  };
}
