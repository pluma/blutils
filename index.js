/*! blutils 0.8.0 Original author Alan Plum <me@pluma.io>. Released into the Public Domain under the UNLICENSE. @preserve */
var Promise = require('bluebird'),
  slice = Function.prototype.call.bind(Array.prototype.slice);

exports.eacharg = peacharg;
exports.allargs = pallargs;
exports.tee = ptee;
exports.seq = pseq;
exports.append = _pappend(false);
exports.prepend = _pappend(true);
exports.guard = pguard;
exports.mutate = pmutate;
exports.splice = psplice;

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

function _pappend(prepend) {
  return function() {
    var fns = slice(arguments, 0);
    return function(arg) {
      var p = Promise.cast(arg);
      fns.forEach(function(fn) {
        p = p.then(fn);
      });
      return p.then(function(result) {
        return Promise.all(
          prepend
          ? (Array.isArray(result) ? result : [result]).concat(arg)
          : (Array.isArray(arg) ? arg : [arg]).concat(result)
        );
      });
    };
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

function psplice(offset, count, fn) {
  if (typeof count === 'function') {
    fn = count;
    count = null;
  }
  return function(arr) {
    var start = offset >= 0 ? offset : offset + arr.length;
    var end = count === +count ? start + count : arr.length;
    var head = arr.slice(0, start);
    var slice = arr.slice(start, end);
    var tail = arr.slice(end);
    return Promise.cast(slice)
    .then(fn)
    .then(function(result) {
      return head
      .concat(result)
      .concat(tail);
    });
  };
}