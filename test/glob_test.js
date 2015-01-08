'use strict';
var assert = require('assert');
var Glob = require('../lib/glob');

function errorHandler(err){
    process.nextTick(function rethrow() { throw err; });
}

(new Glob).run(null, {
    patterns: './fixtures/**/*.*'
}).then(function(inputs){
    assert.deepEqual(inputs, []);
}).catch(errorHandler);

(new Glob).run(null, {
    patterns: './fixtures/**/*.*',
    cwd: __dirname,
}).then(function(inputs){
    assert.equal(inputs.length, 2);
}).catch(errorHandler);

(new Glob).run(null, {
    patterns: './fixtures/**/*.*',
    cwd: __dirname,
    read: false
}).then(function(inputs){
    assert.equal(inputs.length, 2);
    assert.equal(inputs[0].contents, null);
}).catch(errorHandler);

(new Glob).run(null, {
    patterns: './fixtures/',
    cwd: __dirname
}).then(function(inputs){
    assert.equal(inputs.length, 1);
    assert.equal(inputs[0].contents, null);
}).catch(errorHandler);



