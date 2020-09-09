var VirtualStats = require('./virtual-stats');

var inode = 45000000;

// Adapted from https://github.com/sysgears/webpack-virtual-modules
// MIT Licensed https://github.com/sysgears/webpack-virtual-modules/blob/master/LICENSE

/**
 * @param {Compiler} compiler - the webpack compiler
 */
function VirtualModulesPlugin(compiler) {
	this.compiler = compiler;

	if (!compiler.inputFileSystem._writeVirtualFile) {
		var originalPurge = compiler.inputFileSystem.purge;

		compiler.inputFileSystem.purge = function() {
			if (originalPurge) {
				originalPurge.call(this, arguments);
			}
			if (this._virtualFiles) {
				Object.keys(this._virtualFiles).forEach(
					function(file) {
						var data = this._virtualFiles[file];
						setData(this._statStorage, file, [null, data.stats]);
						setData(this._readFileStorage, file, [null, data.contents]);
					}.bind(this)
				);
			}
		};

		compiler.inputFileSystem._writeVirtualFile = function(file, stats, contents) {
			this._virtualFiles = this._virtualFiles || {};
			this._virtualFiles[file] = { stats: stats, contents: contents };
			setData(this._statStorage, file, [null, stats]);
			setData(this._readFileStorage, file, [null, contents]);
			compiler.fileTimestamps.set(file, +stats.mtime);
		};
	}

	const watchRunHook = (watcher, callback) => {
		this._watcher = watcher.compiler || watcher;

		var virtualFiles = this.compiler.inputFileSystem._virtualFiles;

		if (virtualFiles) {
			Object.keys(virtualFiles).forEach(
				function(file) {
					var mtime = +virtualFiles[file].stats.mtime;
					compiler.fileTimestamps.set(file, mtime);
				}
			);
		}

		callback();
	};

	if (compiler.hooks) {
		compiler.hooks.watchRun.tapAsync('VirtualModulesPlugin', watchRunHook);
	} else {
		compiler.plugin('watch-run', watchRunHook);
	}
}

VirtualModulesPlugin.prototype.writeModule = function(filePath, contents) {
	var len = contents ? contents.length : 0;
	var time = new Date();
	var timeMs = time.getTime();

	var stats = new VirtualStats({
		dev: 8675309,
		ino: inode++,
		mode: 33188,
		nlink: 0,
		uid: 1000,
		gid: 1000,
		rdev: 0,
		size: len,
		blksize: 4096,
		blocks: Math.floor(len / 4096),
		atimeMs: timeMs,
		mtimeMs: timeMs,
		ctimeMs: timeMs,
		birthtimeMs: timeMs,
		atime: time,
		mtime: time,
		ctime: time,
		birthtime: time
	});

	this.compiler.inputFileSystem._writeVirtualFile(filePath, stats, contents);
};

function setData(storage, key, value) {
	if (storage.data instanceof Map) {
		storage.data.set(key, value);
	} else {
		storage.data[key] = value;
	}
}

module.exports = VirtualModulesPlugin;
