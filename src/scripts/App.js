"use strict";

import Cache from "./utils/Cache.js";

const nw = require("nw.gui");
const fs = require("fs");

const win = nw.Window.get();
// win.showDevTools(); //only activate during development build with sdk version.

win.on("close", () => {
	try {
		Cache.save();

	} catch (err) {
		console.error(err);

	} finally {
		nw.App.quit();
	}
});
