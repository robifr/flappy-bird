"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };

class Ground extends Phaser.GameObjects.TileSprite {
	constructor({ 
		scene, x, y, 
		width = TextureConfig.ground.width, 
		height = TextureConfig.ground.height, 
		key = TextureConfig.ground.key 
	} = {}) {
		super(scene, x, y, width, height, key);
		this.scene.physics.add.existing(this);
		this.scene.add.existing(this);

		this.setDepth(1);
		this.setScale(3, 1);
		this.enableBody = true;
		this.body.immovable = true;
	}

	move(speed = 0.3) {
		this.tilePositionX += speed;
	}
}

export default Ground;