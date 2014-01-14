# Synopsis

**blutils** is a utility library for [bluebird](https://github.com/petkaantonov/bluebird) and a direct fork of [qtils](https://github.com/pluma/qtils).

[![Build Status](https://travis-ci.org/pluma/blutils.png?branch=master)](https://travis-ci.org/pluma/blutils) [![Coverage Status](https://coveralls.io/repos/pluma/blutils/badge.png?branch=master)](https://coveralls.io/r/pluma/blutils?branch=master) [![NPM version](https://badge.fury.io/js/blutils.png)](http://badge.fury.io/js/blutils) [![Dependencies](https://david-dm.org/pluma/blutils.png)](https://david-dm.org/pluma/blutils)

# Note

When dealing with multiple arguments in promises, it is customary to pass them around as arrays. Until EcmaScript 6 destructuring becomes widely available, this makes promise control flows with multiple promises a bit unpractical when you can't use `.spread`.

If you find yourself using `.spread` a lot but still want to give the array manipulation helpers in this library a try, consider using [spread-args](https://github.com/pluma/spread-args) to convert functions that take positional arguments into functions that accept a simple argument array.

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

## append(fn:Function):Function

Creates a function that will pass its argument to the given function and returns a promise that will be resolved to the function's result appended to the argument.

If the argument is not an `Array`, it will be wrapped in one before the result is appended.

Example:

```javascript
Promise.cast('foo')
.then(blutils.append(function(str) {
    return str.replace('f', 'b');
}))
.then(console.log); // ['foo', 'boo']
```

## prepend(fn:Function):Function

Creates a function that will pass its argument to the given function and returns a promise that will be resolved to the function's result prepended to the argument.

If the argument is not an `Array`, it will be wrapped in one before the result is prepended.

Example:

```javascript
Promise.cast('foo')
.then(blutils.prepend(function(str) {
    return str.replace('f', 'b');
}))
.then(console.log); // ['boo', 'foo']
```

## tee(fn:Function):Function

Creates a function that will pass its argument to the given function and returns a promise that will be resolved to the argument when the function's result is fulfilled.

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

## seq(fns...):Function

Creates a function that will pass its argument to the given functions in sequence and returns a promise that resolves to the sequence's result.

This is mostly equivalent to `then`ing the functions:

```javascript
Promise.cast('foo')
.then(blutils.seq(
    function(str) {return str.toUpperCase();},
    function(str) {return str.slice(0, 1).toLowerCase() + str.slice(1);}
))
.then(console.log); // 'fOO'
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

## transform(props:Object, [opts]):Function

Creates a function that takes an object and will apply the given transformations to its properties and then returns a promise resolving to the result object.

Example:

```javascript
var person = {firstName: 'John', lastName: 'Doe'};
Promise.cast(person)
.then(blutils.transform({
    lastName: function(str) {return str.toUpperCase();}
}))
.then(function(result) {
    console.log(result); // {lastName: 'DOE'}
    console.log(person); // {firstName: 'John', lastName: 'Doe'}
});
```

If a transformation is not a function, it will be passed through as the transformation result for that property:

```javascript
Promise.cast({foo: 'x', bar: 'y'})
.then(blutils.transform({
    foo: 'static',
    bar: 5
}, true))
.then(function(result) {
    console.log(result.foo); // 'static'
    console.log(result.bar); // 5
});
```

### opts.keep:Boolean (default: false)

If `keep` is `true`, any properties that have no matching transformation will be copied to the result object verbatim. Otherwise they will be omitted.

Example with `keep = true`:

```javascript
var person = {firstName: 'John', lastName: 'Doe'};
Promise.cast(person)
.then(blutils.transform({
    lastName: function(str) {return str.toUpperCase();}
}, {keep: true}))
.then(function(result) {
    console.log(result); // {firstName: 'John', lastName: 'DOE'}
    console.log(person); // {firstName: 'John', lastName: 'Doe'}
});
```

### opts.skipMissing:Boolean (default: false)

If `keepMissing` is `true`, any properties missing on the object will be omitted. Otherwise their transformations will be executed as if they were set to `undefined`.

Example with `skipMissing = true`:

```javascript
Promise.cast({})
.then(blutils.transform({
    bar: function(str) {return str.toUpperCase();}
}, {skipMissing: true}))
.then(console.log); // {}
```

Example with `skipMissing = false`:

```javascript
Promise.cast({})
.then(blutils.transform({
    bar: function(x) {return x;}
}, {skipMissing: false}))
.then(console.log); // {bar: undefined}
```

# License

The MIT/Expat license.