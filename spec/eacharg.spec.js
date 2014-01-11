/*global describe, it */
var expect = require('expect.js'),
  eacharg = require('../').eacharg;

describe('blutils.eacharg(fns...)', function() {
  it('is a function', function() {
    expect(eacharg()).to.be.a('function');
  });
  it('calls no function if input array is empty', function(done) {
    var calledA = false, calledB = false;
    eacharg(
      function() {calledA = true;},
      function() {calledB = true;}
    )([])
    .done(function() {
      expect(calledA).to.equal(false);
      expect(calledB).to.equal(false);
      done();
    });
  });
  it('calls one function if input array contains one item', function(done) {
    var calledA = false, calledB = false;
    eacharg(
      function() {calledA = true;},
      function() {calledB = true;}
    )([1])
    .done(function() {
      expect(calledA).to.equal(true);
      expect(calledB).to.equal(false);
      done();
    });
  });
  it('calls all functions if input array is long enough', function(done) {
    var calledA = false, calledB = false;
    eacharg(
      function() {calledA = true;},
      function() {calledB = true;}
    )([1, 2])
    .done(function() {
      expect(calledA).to.equal(true);
      expect(calledB).to.equal(true);
      done();
    });
  });
  it('loops input array over all functions', function(done) {
    var calledA = 0, calledB = 0;
    eacharg(
      function() {calledA += 1;},
      function() {calledB += 1;}
    )([1, 2, 3, 4, 5])
    .done(function() {
      expect(calledA).to.equal(3);
      expect(calledB).to.equal(2);
      done();
    });
  });
  it('passes each item in the input array to each passed function', function(done) {
    eacharg(
      function(x) {expect(x).to.equal(1);},
      function(y) {expect(y).to.equal(2);}
    )([1, 2])
    .done(function() {
      done();
    });
  });
  it('returns a promise that resolves to the result array', function(done) {
    eacharg(
      function() {return 1;},
      function() {return 2;}
    )(['x', 'y'])
    .done(function(result) {
      expect(result).to.eql([1, 2]);
      done();
    });
  });
});