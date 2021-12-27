"use strict";

import PreloadScene from "./scene/PreloadScene.js";
import MainScene from "./scene/MainScene.js";

const game = new Phaser.Game({ 
	type: Phaser.AUTO,
	width: 850,
	height: 600,
	scale: {
		mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	physics: {
		default: "arcade",
		arcade: { debug: false }
	},
	backgroundColor: "#000000",
	scene: [PreloadScene, MainScene]
});