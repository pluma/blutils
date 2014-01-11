/*global describe, it */
var expect = require('expect.js'),
  Promise = require('bluebird'),
  transform = require('../').transform;

describe('blutils.transform(props)', function() {
  it('is a function', function() {
    expect(transform()).to.be.a('function');
  });
  it('returns a promise resolving to an object', function(done) {
    Promise.cast({})
    .then(transform({}))
    .done(function(result) {
      expect(result).to.be.an('object');
      done();
    });
  });
  it('returns a promise that is rejected when a transformation throws', function(done) {
    Promise.cast({foo: 'bar'})
    .then(transform({foo: function() {throw new Error('Fail');}}))
    .done(null, function(reason) {
      expect(reason).to.be.an(Error);
      done();
    });
  });
  it('returns a promise that is rejected when a transformation rejects', function(done) {
    Promise.cast({foo: 'bar'})
    .then(transform({foo: function() {return Promise.reject(new Error('Fail'));}}))
    .done(null, function(reason) {
      expect(reason).to.be.an(Error);
      done();
    });
  });
  it('calls each function with the property value as argument', function(done) {
    var called = {foo: false, bar: false, qux: false};
    Promise.cast({foo: 'x', bar: 'y', qux: 'z'})
    .then(transform({
      foo: function(x) {called.foo = x;},
      bar: function(y) {called.bar = y;}
    }))
    .done(function() {
      expect(called.foo).to.equal('x');
      expect(called.bar).to.equal('y');
      expect(called.qux).to.equal(false);
      done();
    });
  });
  it('returns a promise resolving to the transformation result', function(done) {
    Promise.cast({foo: 'x', bar: 'y', qux: 'z'})
    .then(transform({
      foo: function(x) {return x.toUpperCase();},
      bar: function(y) {return y.toUpperCase();}
    }))
    .done(function(result) {
      expect(result.foo).to.equal('X');
      expect(result.bar).to.equal('Y');
      expect(result).to.not.have.property('qux');
      done();
    });
  });
  it('transforms missing properties, too', function(done) {
    Promise.cast({foo: 'x'})
    .then(transform({
      foo: function(x) {return x.toUpperCase();},
      bar: function(y) {return y ? true : false;}
    }))
    .done(function(result) {
      expect(result.foo).to.equal('X');
      expect(result).to.have.property('bar');
      expect(result.bar).to.equal(false);
      done();
    });
  });
  it('supports literal transformations', function(done) {
    var transforms = {foo: [], bar: 5, qux: 'a'};
    Promise.cast({foo: 'x', bar: 'y', qux: 'z'})
    .then(transform(transforms))
    .done(function(result) {
      expect(result.foo).to.equal(transforms.foo);
      expect(result.bar).to.equal(transforms.bar);
      expect(result.qux).to.equal(transforms.qux);
      done();
    });
  });
});

describe('blutils.transform(props, {keep: true})', function() {
  it('passes on properties that have no transformations', function(done) {
    Promise.cast({foo: 'x', bar: 'y', qux: 'z'})
    .then(transform({
      foo: function(x) {return x.toUpperCase();},
      bar: function(y) {return y.toUpperCase();}
    }, {keep: true}))
    .done(function(result) {
      expect(result.foo).to.equal('X');
      expect(result.bar).to.equal('Y');
      expect(result.qux).to.equal('z');
      done();
    });
  });
});

describe('blutils.transform(props, {skipMissing: true})', function() {
  it('skips missing properties', function(done) {
    Promise.cast({foo: 'x'})
    .then(transform({
      foo: function(x) {return x.toUpperCase();},
      bar: function() {return true;}
    }, {skipMissing: true}))
    .done(function(result) {
      expect(result.foo).to.equal('X');
      expect(result).not.to.have.property('bar');
      done();
    });
  });
});