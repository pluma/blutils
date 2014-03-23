# Synopsis

**blutils** is a utility library for [bluebird](https://github.com/petkaantonov/bluebird) and a direct fork of [qtils](https://github.com/pluma/qtils).

[![stability 2 - unstable](http://b.repl.ca/v1/stability-2_--_unstable-yellow.png)](http://nodejs.org/api/documentation.html#documentation_stability_index) [![license - Unlicense](http://b.repl.ca/v1/license-Unlicense-lightgrey.png)](http://unlicense.org/) [![Flattr this](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=pluma&url=https://github.com/pluma/blutils)

[![Build Status](https://travis-ci.org/pluma/blutils.png?branch=master)](https://travis-ci.org/pluma/blutils) [![Coverage Status](https://coveralls.io/repos/pluma/blutils/badge.png?branch=master)](https://coveralls.io/r/pluma/blutils?branch=master) [![Dependencies](https://david-dm.org/pluma/blutils.png?theme=shields.io)](https://david-dm.org/pluma/blutils)

[![NPM status](https://nodei.co/npm/blutils.png?compact=true)](https://npmjs.org/package/blutils)

# Note

When dealing with multiple arguments in promises, it is customary to pass them around as arrays. Until EcmaScript 6 destructuring becomes widely available, this makes promise control flows with multiple promises a bit unpractical when you can't use `.spread`.

If you find yourself using `.spread` a lot but still want to give the array manipulation helpers in this library a try, consider using [spread-args](https://github.com/pluma/spread-args) to convert functions that take positional arguments into functions that accept a simple argument array.

As of version 0.4, `blutils.transform` has been removed. Consider using [transform-object](https://github.com/pluma/transform-object) instead.

# Install

## With NPM

```sh
npm install blutils
```

## From source

```sh
git clone https://github.com/pluma/blutils.git
cd blutils
npm install
make test
```

# API

## seq(fns...):Function

Creates a function that will pass its argument to the given sequence of functions and returns a promise that resolves to the sequence's result.

This is mostly equivalent to `then`ing the functions:

```javascript
Promise.cast('qux')
.then(blutils.seq(
    function(str) {return str.toUpperCase();},
    function(str) {return str.slice(0, 1).toLowerCase() + str.slice(1);}
))
.then(console.log); // 'qUX'
```

## append(fns...):Function

Creates a function that will pass its argument to the given sequence of functions and returns a promise that will be resolved to the functions' result appended to the argument.

If the argument is not an `Array`, it will be wrapped in one before the result is appended.

Example:

```javascript
Promise.cast('foo')
.then(blutils.append(
    function(str) {
        return str.replace('f', 'b');
    },
    function(str) {
        return str.replace('oo', 'ar');
    }
))
.then(console.log); // ['foo', 'boo']
```

## prepend(fns...):Function

Creates a function that will pass its argument to the given sequence of functions and returns a promise that will be resolved to the functions' result prepended to the argument.

If the argument is not an `Array`, it will be wrapped in one before the result is prepended.

Example:

```javascript
Promise.cast('foo')
.then(blutils.prepend(
    function(str) {
        return str.replace('f', 'b');
    },
    function(str) {
        return str.replace('oo', 'ar');
    }
))
.then(console.log); // ['bar', 'foo']
```

## tee(fns...):Function

Creates a function that will pass its argument to the given sequence of functions and returns a promise that will be resolved to the argument when the function's result is fulfilled.

In other words, `tee` allows you to add `then`able side-effects to a promise chain (without having to modify them so they return their inputs).

Example without `tee`:

```javascript
Promise.cast('foo')
.then(function(str) {
    console.log('Result is:', str); // 'Result is: "foo"'
    return str; // Must return the input or next `then` will see `null`
})
.then(console.log); // 'foo'
```

Example with `tee`:

```javascript
Promise.cast('foo')
.then(blutils.tee(function(str) {
    console.log('Result is:', str); // 'Result is: "foo"'
}))
.then(console.log); // 'foo'
```

## guard(fn, handleRejection):Function

Creates a function that will pass its argument to the given function and returns a promise that resolves to the sequence's result or the result of `handleRejection` if the function fails.

Naive example without `guard`:

```javascript
frobnicateDoodads()
.then(embiggenDoodads)
.catch(recoverFromEmbiggeningFailure) // will also trigger if frobnication fails
.then(rasterizeDoodads)
.catch(recoverFromRasterizationFailure) // will also trigger if recovery from embiggening failure fails
.done(logResults, logFailure);
```

Non-naive example without `guard`:

```javascript
frobnicateDoodads()
.then(function(doodads) {
    return Promise.cast(doodads)
    .then(embiggenDoodads)
    .catch(recoverFromEmbiggeningFailure);
})
.then(function(doodads) {
    return Promise.cast(doodads)
    .then(rasterizeDoodads)
    .catch(recoverFromRasterizationFailure);
})
.done(logResults, logFailure);
```

Example with `guard`:

```javascript
frobnicateDoodads()
.then(blutils.guard( // only called if frobnication was successful
    embiggenDoodads,
    recoverFromEmbiggeningFailure // only catches embiggening failures
))
.then(blutils.guard( // only called if embiggening was successful
    rasterizeDoodads,
    recoverFromRasterizationFailure // only catches rasterization failures
))
.done(logResults, logFailure);
```

## eacharg(fns...):Function

Creates a function that will pass each item in an array to each function and returns a promise that will be resolved to an array containing the results.

If the number of functions is smaller than the number of items in the array, it will loop over the functions.

Example:

```javascript
Promise.cast(['Foo', 'Bar', 'Qux'])
.then(blutils.eacharg(
    function(str) {return str.toUpperCase();},
    function(str) {return str.toLowerCase();}
))
.then(console.log); // ['FOO', 'bar', 'QUX']
```

## allargs(fns...):Function

Creates a function that will pass its argument to each function and returns a promise that will be resolved to an array containing the results.

Example:

```javascript
Promise.cast(['foo', 'bar', 'qux'])
.then(blutils.allargs(
    function(arr) {return arr.join('-');},
    function(arr) {return arr.join('+');}
))
.then(console.log); // ['foo-bar-qux', 'foo+bar+qux']
```

## mutate(mutation:Object):Function

Creates a function that will mutate its argument by applying the each function of the given mutation object to each property value (or array item) of the argument.

The function returns a promise that resolves to the mutated object when all mutation results have resolved or is rejected if any of the mutation results are rejected.

The mutations modify properties of the input object in-place.

Example:

```javascript
Promise.cast(['foo', 'bar', 'qux'])
.then(blutils.mutate({
    0: function(arg) {return arg.toUpperCase();},
    2: function(arg) {return Promise.cast(arg.toUpperCase());}
}))
.then(console.log); // ['FOO', 'bar', 'QUX']
```

Nesting example:

```javascript
Promise.cast(['foo', 'bar', {qux: 'baz', soup: 'chunky'}])
.then(blutils.mutate({
    2: {
        qux: function(arg) {return arg.toUpperCase();}
    }
}))
.then(console.log); // ['foo', 'bar', {qux: 'BAZ', soup: 'chunky'}]
```

# Unlicense

This is free and unencumbered public domain software. For more information, see http://unlicense.org/ or the accompanying [UNLICENSE](https://github.com/pluma/blutils/blob/master/UNLICENSE) file.