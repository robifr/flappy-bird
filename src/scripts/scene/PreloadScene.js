"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };
import Text from "../component/Text.js";

class PreloadScene extends Phaser.Scene {
	constructor() {
		super("PRELOAD");
		this.progressBox = null;
		this.progressBar = null;
		this.loadingText = null;
	}

	preload() {
		this.start();

		/** background */
		this.load.image(TextureConfig.background.day.key, "./assets/background/day.png");
		this.load.image(TextureConfig.background.night.key, "./assets/background/night.png");
		this.load.image(TextureConfig.background.apocalypse.key, "./assets/background/apocalypse.png");

		/** bird */
		this.load.spritesheet(TextureConfig.bird.yellow.key, "./assets/bird/yellow.png", { frameWidth: TextureConfig.bird.width, frameHeight: TextureConfig.bird.height });
		this.load.spritesheet(TextureConfig.bird.blue.key, "./assets/bird/blue.png", { frameWidth: TextureConfig.bird.width, frameHeight: TextureConfig.bird.height });
		this.load.spritesheet(TextureConfig.bird.red.key, "./assets/bird/red.png", { frameWidth: TextureConfig.bird.width, frameHeight: TextureConfig.bird.height });
		this.load.spritesheet(TextureConfig.bird.rainbow.key, "./assets/bird/rainbow.png", { frameWidth: TextureConfig.bird.width, frameHeight: TextureConfig.bird.height });

		/** property */
		this.load.image(TextureConfig.ground.key, "./assets/ground.png");
		this.load.image(TextureConfig.pipe.key, "./assets/pipe.png");

		/** text */
		this.load.image(TextureConfig.text.logo.key, "./assets/logo/text.png");
		this.load.image(TextureConfig.text.getready.unclicked.key, "./assets/getready/unclicked.png");
		this.load.image(TextureConfig.text.getready.clicked.key, "./assets/getready/clicked.png");
		this.load.image(TextureConfig.text.gameover.key, "./assets/gameover.png");

		/** button */
		//this.load.image(TextureConfig.button.start.key, "./assets/start-button.png");
	}

	start() {
		const cameraWidth = this.cameras.main.width;
		const cameraHeight = this.cameras.main.height;

		const progressBoxWidth = 320;
		const progressBoxHeight = 20;
		const progressBoxX = (cameraWidth / 2) - (progressBoxWidth / 2);
		const progressBoxY = cameraHeight / 1.5;

		const progressBarHeight = 15;
		const gapBetweenBoxAndBar = (progressBoxHeight - progressBarHeight) / 2;
		const progressBarX = progressBoxX + gapBetweenBoxAndBar;
		const progressBarY = progressBoxY + gapBetweenBoxAndBar;
		const progressBarMinWidth = (progressBoxWidth - 100) - gapBetweenBoxAndBar; //minus 100 because of percent.

		//drawing canvas element.
		this.progressBox = this.add.graphics();
		this.progressBar = this.add.graphics();
		this.loadingText = new Text({
			scene: this, x: progressBarX, y: progressBarY - progressBoxHeight,
			text: "Loading", style: { font: "18px monospace", fill: "#ffffff" }
		});;

		this.progressBox.fillStyle(0x222222, 0.8);
		this.progressBox.fillRect(progressBoxX, progressBoxY, progressBoxWidth, progressBoxHeight);

		this.load.on("progress", (value) => {
			const progressBarWidth = (progressBarMinWidth + (value * 100)) - gapBetweenBoxAndBar;
			//update progress bar.
			this.progressBar.clear();
			this.progressBar.fillStyle(0x29465B, 1);
			this.progressBar.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

			//animating loading text with three dots at the end of text.
			this.loadingText.text += ".";
			if (this.loadingText.text.length >= 10) this.loadingText.text = "Loading";
		});

		this.load.on("fileprogress", (file) => console.log());
		this.load.on("complete", () => this.finish());
	}

	finish() {
		//delete canvas element once assets have been loaded.
		this.progressBox.destroy();
		this.progressBar.destroy();
		this.loadingText.destroy();

		this.scene.start("MAIN");
	}
}

export default PreloadScene;
