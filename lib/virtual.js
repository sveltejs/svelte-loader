var VirtualStats = require('./virtual-stats');
var path = require('path');
// var debug = require('debug')('webpack-virtual-modules');

var inode = 45000000;

function VirtualModulesPlugin() {}

VirtualModulesPlugin.prototype.writeModule = function(filePath, contents) {
  var len = contents ? contents.length : 0;
  var time = Date.now();

  var stats = new VirtualStats({
    dev: 8675309,
    nlink: 0,
    uid: 1000,
    gid: 1000,
    rdev: 0,
    blksize: 4096,
    ino: inode++,
    mode: 33188,
    size: len,
    blocks: Math.floor(len / 4096),
    atime: time,
    mtime: time,
    ctime: time,
    birthtime: time
  });

  // debug(this._compiler.name, "Write module:", modulePath, contents);

  this._compiler.inputFileSystem._writeVirtualFile(filePath, stats, contents);
  if (this._watcher && this._watcher.watchFileSystem.watcher.fileWatchers.length) {
    this._watcher.watchFileSystem.watcher.fileWatchers.forEach((fileWatcher) => {
      if (fileWatcher.path === filePath) {
        // debug(this._compiler.name, "Emit file change:", filePath, time);
        fileWatcher.emit("change", time, null);
      }
    });
  }
};

function setData(storage, key, value) {
  if (storage.data instanceof Map) {
    storage.data.set(key, value);
  } else {
    storage.data[key] = value;
  }
}

VirtualModulesPlugin.prototype.apply = function(compiler) {
  this._compiler = compiler;

  // var afterEnvironmentHook = function() {
    if (!compiler.inputFileSystem._writeVirtualFile) {
      var originalPurge = compiler.inputFileSystem.purge;

      compiler.inputFileSystem.purge = function() {
        originalPurge.call(this, arguments);
        if (this._virtualFiles) {
          Object.keys(this._virtualFiles).forEach(function(file) {
            var data = this._virtualFiles[file];
            setData(this._statStorage, file, [null, data.stats]);
            setData(this._readFileStorage, file, [null, data.contents]);
          }.bind(this));
        }
      };

      compiler.inputFileSystem._writeVirtualFile = function(file, stats, contents) {
        this._virtualFiles = this._virtualFiles || {};
        this._virtualFiles[file] = {stats: stats, contents: contents};
        setData(this._statStorage, file, [null, stats]);
        setData(this._readFileStorage, file, [null, contents]);
      };
    }
  // }

  const watchRunHook = (watcher, callback) => {
    this._watcher = watcher.compiler || watcher;
    callback();
  }

  if(compiler.hooks) {
    console.log('>>>1')
    // compiler.hooks.afterEnvironment.tap('VirtualModulesPlugin', afterEnvironmentHook);
    // compiler.hooks.afterResolvers.tap('VirtualModulesPlugin', afterResolversHook);
    compiler.hooks.watchRun.tapAsync('VirtualModulesPlugin', watchRunHook);
  } else {
    // compiler.plugin("after-environment", afterEnvironmentHook);
    // compiler.plugin("after-resolvers", afterResolversHook);
    // compiler.plugin("watch-run", watchRunHook);
  }
};

module.exports = VirtualModulesPlugin;
