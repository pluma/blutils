/*global describe, it */
var expect = require('expect.js'),
  Promise = require('bluebird'),
  seq = require('../').seq;

describe('blutils.seq(fns...)', function() {
  it('is a function', function() {
    expect(seq()).to.be.a('function');
  });
  it('returns a promise resolving to the sequence\'s result', function(done) {
    function dub(x) {return x * 2;}
    Promise.cast(5)
    .then(seq(dub, dub))
    .done(function(result) {
      expect(result).to.equal(5 * 2 * 2);
      done();
    });
  });
  it('returns a promise that is rejected when the sequence fails', function(done) {
    Promise.cast(5)
    .then(seq(function() {throw new Error('Fail');}))
    .done(null, function(reason) {
      expect(reason).to.be.an(Error);
      done();
    });
  });
});