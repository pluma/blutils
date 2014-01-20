/*global describe, it */
var expect = require('expect.js'),
  Promise = require('bluebird'),
  guard = require('../').guard;

describe('blutils.guard(fn, handleFail)', function() {
  it('is a function', function() {
    expect(guard()).to.be.a('function');
  });
  it('returns a promise resolving to the result of fn', function(done) {
    Promise.cast(5)
    .then(guard(function(x) {return x * 2;}))
    .done(function(result) {
      expect(result).to.equal(10);
      done();
    });
  });
  it('calls the passed fail handler if fn fails', function(done) {
    Promise.cast(5)
    .then(guard(function() {
      throw new Error('Fail');
    }, function() {
      return 'called';
    }))
    .done(function(result) {
      expect(result).to.equal('called');
      done();
    });
  });
});