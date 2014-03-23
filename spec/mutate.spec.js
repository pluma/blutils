/*global describe, it */
var expect = require('expect.js'),
  Promise = require('bluebird'),
  mutate = require('../').mutate;

describe('blutils.mutate(obj)', function() {
  it('is a function', function() {
    expect(mutate()).to.be.a('function');
  });
  it('returns a promise resolving to the input', function(done) {
    var input = [1];
    Promise.cast(input)
    .then(mutate({}))
    .done(function(result) {
      expect(result).to.equal(input);
      done();
    });
  });
  it('applies the given mutations to arrays', function(done) {
    var mutations = [];
    Promise.cast(['x', 'y', 'z'])
    .then(mutate([
      function(x) {mutations[0] = [x, 'a']; return 'a';},
      function(x) {mutations[1] = [x, 'b']; return 'b';},
      function(x) {mutations[2] = [x, 'c']; return 'c';}
    ]))
    .done(function(result) {
      expect(result).to.eql(['a', 'b', 'c']);
      expect(mutations).to.eql([['x', 'a'], ['y', 'b'], ['z', 'c']]);
      done();
    });
  });
  it('applies the given mutations to objects', function(done) {
    var mutations = {};
    Promise.cast({x: 0, y: 1, z: 2})
    .then(mutate({
      x: function(x) {mutations.x = x; return 'a';},
      y: function(x) {mutations.y = x; return 'b';},
      z: function(x) {mutations.z = x; return 'c';}
    }))
    .done(function(result) {
      expect(result).to.eql({x: 'a', y: 'b', z: 'c'});
      expect(mutations).to.eql({x: 0, y: 1, z: 2});
      done();
    });
  });
  it('skips missing mutations', function(done) {
    var mutations = {};
    Promise.cast({x: 0, y: 1, z: 2})
    .then(mutate({
      x: function(x) {mutations.x = x; return 'a';},
      z: function(x) {mutations.z = x; return 'c';}
    }))
    .done(function(result) {
      expect(result).to.eql({x: 'a', y: 1, z: 'c'});
      expect(mutations).to.eql({x: 0, z: 2});
      done();
    });
  });
  it('applies nested mutations', function(done) {
    var mutation = null;
    Promise.cast({x: {y: {z: 2}}})
    .then(mutate({
      x: {y: {z: function(x) {mutation = x; return 'b';}}}
    }))
    .done(function(result) {
      expect(result).to.eql({x: {y: {z: 'b'}}});
      expect(mutation).to.equal(2);
      done();
    });
  });
  it('rejects if a mutation fails', function(done) {
    Promise.cast(['x'])
    .then(mutate([
      function() {throw new Error('Fail');}
    ]))
    .catch(function(reason) {
      expect(reason).to.an(Error);
      expect(reason).to.have.property('message', 'Fail');
      done();
      return null;
    });
  });
  it('handles mutation promises', function(done) {
    Promise.cast(['x', 'y', 'z'])
    .then(mutate([
      function() {return Promise.cast('a');},
      function() {return 'b';},
      function() {return Promise.cast('c');}
    ]))
    .then(function(result) {
      expect(result).to.eql(['a', 'b', 'c']);
      done();
      return null;
    });
  });
});