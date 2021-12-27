"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };

class Background extends Phaser.GameObjects.TileSprite {
	#background = [
		TextureConfig.background.day.key,
		TextureConfig.background.night.key,
		TextureConfig.background.apocalypse.key
	];

	constructor({ 
		scene, x, y, 
		width = TextureConfig.background.width, 
		height = TextureConfig.background.height, 
		key = TextureConfig.background.day.key 
	} = {}) {
		super(scene, x, y, width, height, key);
		this.scene.add.existing(this);
	}

	move(speed = 0.1) {
		this.tilePositionX += speed;
	}

	change(cursor = 1) {
		const oldBackground = this.displayTexture.key; //weird, this.texture.key is null.
		const currentBackgroundIndex = this.#background.findIndex(bg => bg === oldBackground);
		let backgroundIndex = currentBackgroundIndex + cursor;

		if (currentBackgroundIndex < 0) return console.error(`couldn't find texture key named ${oldBackground} inside 'background' array`);
		//prevents array out of bounds error.
		if (backgroundIndex < 0) backgroundIndex = 2;
		if (backgroundIndex > 2) backgroundIndex = 0;

		const newBackground = this.#background[backgroundIndex];
		
		this.setTexture(newBackground);
		return newBackground;
	}
}

export default Background;