var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var globSync = require('glob').sync;
var Execution = require('execution');
var Record = require('record');

module.exports = Execution.extend({
    // The type of option could be HTML5 input types: file, directory, number, range, select,
    // url, email, tel, color, date, time, month, time, week, datetime(datetime-local),
    // string(text), boolean(checkbox), array, regexp, function and object.
    options: {
        // https://github.com/isaacs/node-glob#options
        patterns: {
            type: 'array',
            placeholder: 'patterns to search for'
        },
        cwd: {
            default: process.cwd(),
            type: 'directory',
            placeholder: 'the current working directory in which to search'
        },
        read: {
            default: true,
            type: 'boolean'
        }
    },
    run: function (inputs, options, logger, settings) {
        if (_.isString(options) || _.isArray(options)) {
            options = {patterns: options};
        }
        return this._run(inputs, options, logger, settings);
    },
    execute: function (resolve, reject) {
        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        var records = expand(options).map(function (filepath) {
            if (options.cwd)
                filepath = path.join(options.cwd, filepath);

            var record = {
                path: filepath
            };

            if(
                (options.read == null || options.read == true)
                && fs.statSync(filepath).isFile()
            ){
                record.contents = fs.readFileSync(filepath)
            }

            return new Record(record);
        });

        if(!records.length){
            logger.warn('No files globbing with', options.patterns, 'in', options.cwd);
        }else{
            logger.log('Globbing', records.length, 'files with', options.patterns, 'in', options.cwd)
        }

        resolve(inputs.concat(records));
    }
})

/**
 * Return a unique array of all file or directory paths that match the given globbing pattern(s).
 * @method expand(patterns [, options])
 * @param  {array} patterns
 * @param  {object} options  [description]
 * @return {array} matche files
 * @example
 *     file.expand(['!./foo/*.css', './foo/*'])
 */
function expand(patterns, options) {
    // patterns is optional
    if (_.isObject(patterns)) {
        options = patterns;
        patterns = options.patterns;
    }
    // wrap stirng as a array
    if (_.isString(patterns)) {
        patterns = [patterns];
    }

    // make options param not undefined
    options = options || {};

    // all matching filepaths.
    var matches = [];

    if (!Array.isArray(patterns)) {
        return matches;
    }
    // Iterate over flattened patterns array.
    _.flatten(patterns).forEach(function (pattern) {
        // If the first character is ! it should be omitted
        var exclusion = pattern.indexOf('!') === 0;
        // If the pattern is an exclusion, remove the !
        if (exclusion) {
            pattern = pattern.slice(1);
        }
        // Find all matching files for this pattern.
        var files = glob(pattern, options);
        // console.log(pattern, files)
        if (exclusion) {
            // If an exclusion, remove matching files.
            matches = _.difference(matches, files);
        } else {
            // Otherwise add matching files.
            matches = _.union(matches, files);
        }
    });

    // Filter result set?
    if (options.filter) {
        matches = matches.filter(function (filepath) {
            filepath = path.join(options.cwd || '', filepath);
            try {
                if (_.isFunction(options.filter)) {
                    return options.filter(filepath);
                } else if (_.isRegExp(options.filter)) {
                    return options.filter.test(filepath);
                } else {
                    // If the file is of the right type and exists, this should work.
                    return fs.statSync(filepath)[options.filter]();
                }
            } catch (e) {
                // Otherwise, it's probably not the right type.
                return false;
            }
        });
    }
    return matches;
}


/**
 * get the pattern matched files, default root dir is cwd
 * @method glob(pattern [, rootdir])
 * @param pattern
 * @param rootdir
 * @returns {Array} filenames found matching the pattern
 * @see https://github.com/isaacs/node-glob
 */
function glob(pattern, options) {
    if (Array.isArray(pattern)) {
        var files = [];
        pattern.forEach(function (p) {

            var res = glob.call(null, p, options);
            if (!res || res.length === 0) {
                res = [p];
            }
            [].splice.apply(files, [files.length, 0].concat(res));
        });
        return files;
    } else {
        return globSync(pattern, options);
    }
}
