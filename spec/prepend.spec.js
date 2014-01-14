/*global describe, it */
var expect = require('expect.js'),
  prepend = require('../').prepend;

describe('blutils.prepend(fn)', function() {
  it('is a function', function() {
    expect(prepend()).to.be.a('function');
  });
  it('returns a promise that resolves to an array', function(done) {
    prepend(function() {})()
    .done(function(result) {
      expect(result).to.be.an('array');
      done();
    });
  });
  it('prepends the result to the input array', function(done) {
    prepend(function() {return 2;})([1])
    .done(function(result) {
      expect(result).to.eql([2, 1]);
      done();
    });
  });
  it('wraps the non-array input in an array', function(done) {
    prepend(function() {return 2;})(1)
    .done(function(result) {
      expect(result).to.eql([2, 1]);
      done();
    });
  });
  it('unwraps array results', function(done) {
    prepend(function() {return [2];})(1)
    .done(function(result) {
      expect(result).to.eql([2, 1]);
      done();
    });
  });
});