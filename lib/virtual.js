// Adapted from https://github.com/sysgears/webpack-virtual-modules

var VirtualStats = require('./virtual-stats');
var path = require("path");

var inode = 45000000;

function createWebpackData(result) {
	return (function(backendOrStorage) {
		// In Webpack v5, this variable is a "Backend", and has the data stored in a field
		// _data. In V4, the `_` prefix isn't present.
		if (backendOrStorage._data) {
			const curLevelIdx = backendOrStorage._currentLevel;
			const curLevel = backendOrStorage._levels[curLevelIdx];
			return {
				result: this.result,
				level: curLevel
			};
		}
		// Webpack 4
		return [null, result];
	}).bind({ result: result });
}

/**
 * @param {Compiler} compiler - the webpack compiler
 */
function VirtualModulesPlugin(compiler) {
	this.compiler = compiler;

	if (!compiler.inputFileSystem._writeVirtualFile) {
		var originalPurge = compiler.inputFileSystem.purge;

		compiler.inputFileSystem.purge = function() {
			if (originalPurge) {
				originalPurge.apply(this, arguments);
			}
			if (this._virtualFiles) {
				Object.keys(this._virtualFiles).forEach(function(file) {
					var data = this._virtualFiles[file];
					this._writeVirtualFile(file, data.stats, data.contents);
				}.bind(this));
			}
		};

		compiler.inputFileSystem._writeVirtualFile = function(file, stats, contents) {
			const statStorage = getStatStorage(this);
			const fileStorage = getFileStorage(this);
			const readDirStorage = getReadDirBackend(this);
			this._virtualFiles = this._virtualFiles || {};
			this._virtualFiles[file] = { stats: stats, contents: contents };
			setData(statStorage, file, createWebpackData(stats));
			setData(fileStorage, file, createWebpackData(contents));
			compiler.fileTimestamps instanceof Map &&
				compiler.fileTimestamps.set(file, +stats.mtime);
			var segments = file.split(/[\\/]/);
			var count = segments.length - 1;
			var minCount = segments[0] ? 1 : 0;
			while (count > minCount) {
				var dir = segments.slice(0, count).join(path.sep) || path.sep;
				try {
					compiler.inputFileSystem.readdirSync(dir);
				} catch (e) {
					var time = new Date();
					var timeMs = time.getTime();
					var dirStats = new VirtualStats({
						dev: 8675309,
						nlink: 0,
						uid: 1000,
						gid: 1000,
						rdev: 0,
						blksize: 4096,
						ino: inode++,
						mode: 16877,
						size: stats.size,
						blocks: Math.floor(stats.size / 4096),
						atimeMs: timeMs,
						mtimeMs: timeMs,
						ctimeMs: timeMs,
						birthtimeMs: timeMs,
						atime: time,
						mtime: time,
						ctime: time,
						birthtime: time
					});
					setData(readDirStorage, dir, createWebpackData([]));
					setData(statStorage, dir, createWebpackData(dirStats));
				}
				var dirData = getData(getReadDirBackend(this), dir);
				// Webpack v4 returns an array, webpack v5 returns an object
				dirData = dirData[1] || dirData.result;
				var filename = segments[count];
				if (dirData.indexOf(filename) < 0) {
					var files = dirData.concat([filename]).sort();
					setData(getReadDirBackend(this), dir, createWebpackData(files));
				} else {
					break;
				}
				count--;
			}
		};
	}

	const watchRunHook = (watcher, callback) => {
		this._watcher = watcher.compiler || watcher;
		const virtualFiles = compiler.inputFileSystem._virtualFiles;
		if (virtualFiles) {
			Object.keys(virtualFiles).forEach(function(file) {
				compiler.fileTimestamps instanceof Map &&
				compiler.fileTimestamps.set(file, +virtualFiles[file].stats.mtime);
			});
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

	// When using the WatchIgnorePlugin (https://github.com/webpack/webpack/blob/52184b897f40c75560b3630e43ca642fcac7e2cf/lib/WatchIgnorePlugin.js),
	// the original watchFileSystem is stored in `wfs`. The following "unwraps" the ignoring
	// wrappers, giving us access to the "real" watchFileSystem.
	let finalWatchFileSystem = this._watcher && this._watcher.watchFileSystem;

	while (finalWatchFileSystem && finalWatchFileSystem.wfs) {
		finalWatchFileSystem = finalWatchFileSystem.wfs;
	}
	this.compiler.inputFileSystem._writeVirtualFile(filePath, stats, contents);
};

function getData(storage, key) {
	// Webpack 5
	if (storage._data instanceof Map) {
		return storage._data.get(key);
	} else if (storage._data) {
		return storage.data[key];
	} else if (storage.data instanceof Map) {
		// Webpack v4
		return storage.data.get(key);
	} else {
		return storage.data[key];
	}
}

function setData(backendOrStorage, key, valueFactory) {
	const value = valueFactory(backendOrStorage);

	// Webpack v5
	if (backendOrStorage._data instanceof Map) {
		backendOrStorage._data.set(key, value);
	} else if (backendOrStorage._data) {
		backendOrStorage.data[key] = value;
	} else if (backendOrStorage.data instanceof Map) {
		// Webpack 4
		backendOrStorage.data.set(key, value);
		backendOrStorage.data.set(key, value);
	} else {
		backendOrStorage.data[key] = value;
		backendOrStorage.data[key] = value;
	}
}

function getStatStorage(fileSystem) {
	if (fileSystem._statStorage) {
		// Webpack v4
		return fileSystem._statStorage;
	} else if (fileSystem._statBackend) {
		// webpack v5
		return fileSystem._statBackend;
	} else {
		// Unknown version?
		throw new Error("Couldn't find a stat storage");
	}
}

function getFileStorage(fileSystem) {
	if (fileSystem._readFileStorage) {
		// Webpack v4
		return fileSystem._readFileStorage;
	} else if (fileSystem._readFileBackend) {
		// Webpack v5
		return fileSystem._readFileBackend;
	} else {
		throw new Error("Couldn't find a readFileStorage");
	}
}

function getReadDirBackend(fileSystem) {
	if (fileSystem._readdirBackend) {
		return fileSystem._readdirBackend;
	} else if (fileSystem._readdirStorage) {
		return fileSystem._readdirStorage;
	} else {
		throw new Error("Couldn't find a readDirStorage from Webpack Internals");
	}
}

module.exports = VirtualModulesPlugin;
