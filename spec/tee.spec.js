/*global describe, it */
var expect = require('expect.js'),
  Promise = require('bluebird'),
  tee = require('../').tee;

describe('blutils.tee(fns...)', function() {
  it('is a function', function() {
    expect(tee()).to.be.a('function');
  });
  it('returns a promise resolving to its input', function(done) {
    Promise.cast(5)
    .then(tee(function() {}))
    .done(function(result) {
      expect(result).to.equal(5);
      done();
    });
  });
  it('returns a promise that is rejected when the tee fails', function(done) {
    Promise.cast(5)
    .then(tee(function() {throw new Error('Fail');}))
    .done(null, function(reason) {
      expect(reason).to.be.an(Error);
      done();
    });
  });
  it('calls the passed function', function(done) {
    var called = false;
    Promise.cast()
    .then(tee(function() {called = true;}))
    .done(function() {
      expect(called).to.equal(true);
      done();
    });
  });
  it('applies each function in sequence', function(done) {
    var timesCalled = 0;
    Promise.cast(5)
    .then(tee(
      function() {timesCalled += 1;},
      function() {timesCalled += 1;}
    ))
    .done(function(result) {
      expect(result).to.eql(5);
      expect(timesCalled).to.eql(2);
      done();
    });
  });
});