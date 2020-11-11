// Adapted from https://github.com/sysgears/webpack-virtual-modules

const VirtualStats = require('./virtual-stats');
const path = require('path');

let inode = 45000000;

function createWebpackData(result) {
	return (function(storage) {
		// In Webpack v5, this variable is a "Backend", and has the data stored in a field
		// _data. In V4, the `_` prefix isn't present.
		if (storage._data) {
			const curLevelIdx = storage._currentLevel;
			const curLevel = storage._levels[curLevelIdx];
			return {
				result: this.result,
				level: curLevel
			};
		}
		// Webpack 4
		return [null, result];
	}).bind({ result: result });
}

function getModulePath(filePath, compiler) {
	return path.isAbsolute(filePath) ? filePath : path.join(compiler.context, filePath);
}

function createVirtualStats(len) {
	const time = new Date();
	const timeMs = time.getTime();

	return new VirtualStats({
		dev: 8675309,
		ino: inode++,
		mode: 16877,
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
}

/**
 * @param {Compiler} compiler - the webpack compiler
 */
function VirtualModulesPlugin(compiler) {
	this.compiler = compiler;

	if (!compiler.inputFileSystem._writeVirtualFile) {
		const originalPurge = compiler.inputFileSystem.purge;

		compiler.inputFileSystem.purge = function() {
			if (originalPurge) {
				originalPurge.apply(this, arguments);
			}
			if (this._virtualFiles) {
				Object.keys(this._virtualFiles).forEach(function(file) {
					const data = this._virtualFiles[file];
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
			const segments = file.split(/[\\/]/);
			let count = segments.length - 1;
			const minCount = segments[0] ? 1 : 0;
			// create directories for each segment (to prevent files not being in a directory)
			while (count > minCount) {
				const dir = segments.slice(0, count).join(path.sep) || path.sep;
				try {
					compiler.inputFileSystem.readdirSync(dir);
				} catch (e) {
					const dirStats = createVirtualStats(stats.size);
					setData(readDirStorage, dir, createWebpackData([]));
					setData(statStorage, dir, createWebpackData(dirStats));
				}
				let dirData = getData(getReadDirBackend(this), dir);
				// Webpack v4 returns an array, webpack v5 returns an object
				dirData = dirData[1] || dirData.result;
				const filename = segments[count];
				if (dirData.indexOf(filename) < 0) {
					const files = dirData.concat([filename]).sort();
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
		callback();
	};

	if (compiler.hooks) {
		compiler.hooks.watchRun.tapAsync('VirtualModulesPlugin', watchRunHook);
	} else {
		compiler.plugin('watch-run', watchRunHook);
	}
}

VirtualModulesPlugin.prototype.writeModule = function(filePath, contents) {
	const len = contents ? contents.length : 0;
	const stats = createVirtualStats(len);
	const modulePath = getModulePath(filePath, this.compiler);

	// When using the WatchIgnorePlugin (https://github.com/webpack/webpack/blob/52184b897f40c75560b3630e43ca642fcac7e2cf/lib/WatchIgnorePlugin.js),
	// the original watchFileSystem is stored in `wfs`. The following "unwraps" the ignoring
	// wrappers, giving us access to the "real" watchFileSystem.
	let finalWatchFileSystem = this._watcher && this._watcher.watchFileSystem;

	while (finalWatchFileSystem && finalWatchFileSystem.wfs) {
		finalWatchFileSystem = finalWatchFileSystem.wfs;
	}
	this.compiler.inputFileSystem._writeVirtualFile(filePath, stats, contents);
	if (finalWatchFileSystem &&
		(finalWatchFileSystem.watcher.fileWatchers.size ||
			finalWatchFileSystem.watcher.fileWatchers.length)
	) {
		const fileWatchers = finalWatchFileSystem.watcher.fileWatchers instanceof Map ?
			Array.from(finalWatchFileSystem.watcher.fileWatchers.values()) :
			finalWatchFileSystem.watcher.fileWatchers;
		fileWatchers.forEach(function(fileWatcher) {
			if (fileWatcher.path === modulePath) {
				delete fileWatcher.directoryWatcher._cachedTimeInfoEntries;
				fileWatcher.directoryWatcher.setFileTime(
					filePath,
					stats.birthtime,
					false,
					false,
					null
				);
				fileWatcher.emit("change", stats.birthtime, null);
			}
		});
	}
};

function getStorageData(storage) {
	return storage._data /* webpack 5 */ || storage.data /* webpack 4 */;
}

function getData(storage, key) {
	const storageData = getStorageData(storage);
	if (storageData instanceof Map) {
		return storageData.get(key);
	} else {
		return storageData.data[key];
	}
}

function setData(storage, key, valueFactory) {
	const storageData = getStorageData(storage);
	const value = valueFactory(storage);

	if (storageData instanceof Map) {
		storageData.set(key, value);
	} else {
		storageData.data[key] = value;
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
