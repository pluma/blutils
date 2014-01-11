/*global describe, it */
var expect = require('expect.js'),
  allargs = require('../').allargs;

describe('blutils.allargs(fns...)', function() {
  it('is a function', function() {
    expect(allargs()).to.be.a('function');
  });
  it('calls all passed functions', function(done) {
    var calledA = false, calledB = false;
    allargs(
      function() {calledA = true;},
      function() {calledB = true;}
    )()
    .done(function() {
      expect(calledA).to.equal(true);
      expect(calledB).to.equal(true);
      done();
    });
  });
  it('passes the input to all passed functions', function(done) {
    var input = {};
    allargs(
      function(x) {expect(x).to.equal(input);},
      function(y) {expect(y).to.equal(input);}
    )(input)
    .done(function() {
      done();
    });
  });
  it('returns a promise that resolves to the result array', function(done) {
    allargs(
      function() {return 1;},
      function() {return 2;}
    )()
    .done(function(result) {
      expect(result).to.eql([1, 2]);
      done();
    });
  });
});