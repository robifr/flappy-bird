"use strict";

const fs = require("fs");
const path = require("path");

class Cache {
	/**
	 * TODO: current approach to keep data as a plain object is probably a bad idea.
	 *      use hashmap instead by extending this Cache class to built-in Map class.
	 */
	static data = null;
	static saved = false;

	static fetch() {
		const __dirname = path.dirname(process.execPath);
		const cache = fs.readFileSync(path.resolve(__dirname, "./cache/cache.json"), "utf8");

		return Cache.data = JSON.parse(cache);
	}

	static save() {
		if (Cache.data === null) return;

		const __dirname = path.dirname(process.execPath);
		const stringify = JSON.stringify(Cache.data, null, 4);

		return fs.writeFile(path.resolve(__dirname, "./cache/cache.json"), stringify, (err) => {
			if (err) return err;
			return stringify;
		});
	}
}

export default Cache;
