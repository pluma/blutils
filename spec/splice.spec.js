/*global describe, it */
var expect = require('expect.js'),
  Promise = require('bluebird'),
  splice = require('../').splice;

describe('blutils.splice(start, count, step)', function() {
  it('is a function', function() {
    expect(splice()).to.be.a('function');
  });
  it('returns a promise', function() {
    var p = splice(0, 1)([]);
    expect(p).to.have.property('then');
    expect(p.then).to.be.a('function');
  });
  it('passes the matching slice to the function', function(done) {
    var arr = [0, 1, 2, 3, 4, 5, 6];
    Promise.cast(arr)
    .done(splice(2, 3, function(slice) {
      expect(slice).to.eql(arr.slice(2, 2 + 3));
      done();
    }));
  });
  it('replaces the matching slice with the function result', function(done) {
    var arr = [0, 1, 2, 3, 4, 5, 6];
    Promise.cast(arr)
    .then(splice(2, 3, function() {
      return 'x';
    }))
    .done(function(result) {
      expect(result).to.eql([0, 1, 'x', 5, 6]);
      done();
    });
  });
  it('handles negative offsets', function(done) {
    var arr = [0, 1, 2, 3, 4, 5, 6];
    Promise.cast(arr)
    .then(splice(2 - arr.length, 3, function(slice) {
      expect(slice).to.eql([2, 3, 4]);
      return 'x';
    }))
    .done(function(result) {
      expect(result).to.eql([0, 1, 'x', 5, 6]);
      done();
    });
  });
  it('handles promises', function(done) {
    var arr = [0, 1, 2, 3, 4, 5, 6];
    Promise.cast(arr)
    .then(splice(2 - arr.length, 3, function(slice) {
      expect(slice).to.eql([2, 3, 4]);
      return Promise.resolve('x');
    }))
    .done(function(result) {
      expect(result).to.eql([0, 1, 'x', 5, 6]);
      done();
    });
  });
  it('handles missing count', function(done) {
    var arr = [0, 1, 2, 3, 4, 5, 6];
    Promise.cast(arr)
    .then(splice(2, function(slice) {
      expect(slice).to.eql([2, 3, 4, 5, 6]);
      return 'x';
    }))
    .done(function(result) {
      expect(result).to.eql([0, 1, 'x']);
      done();
    });
  });
});