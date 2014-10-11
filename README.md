# task-glob
> Read files with glob.

## The "glob" task

### Usage Examples

```js
var glob = new (require('glob'))
glob.run(inputs, options, logger)
```

### Options

#### options.patterns
Type: `array`

Patterns to search for.

#### options.cwd
Type: `directory`
Default: `'process.cwd()'`

The current working directory in which to search.

## Release History
* 2014-10-11    0.1.2    Fix settings argument not pass.
* 2014-09-29    0.1.1    Accept array of patterns.
* 2014-03-28    0.1.0    Initial release.

## License
Copyright (c) 2014 Yuanyan Cao. Licensed under the MIT license.
