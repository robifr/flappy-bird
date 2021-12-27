"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };

class PipeGroup extends Phaser.Physics.Arcade.Group {
	#activePipes = [];

	constructor({ scene, visible, key = TextureConfig.pipe.key } = {}) {
		super(scene.physics.world, scene, { maxSize: 20 });
		this.createMultiple({
			classType: Pipe,
			key: key,
			visible: visible,
			active: false,
			repeat: 20,
			setXY: { x: -100, y: -100 }, //hiding those image to the very left corner of screen.
			setScale: { x: 0.5, y: 0.6 }
		});

		this.isCollisionActive = false;
		this.lastGeneratedPipe = null;
		this.nextPipe = []; //lists of next pipes for the bird to goes through.
	}

	generate() {
		const screenWidth = this.scene.cameras.main.width;
		const screenHeight = this.scene.cameras.main.height;
		//pipe width and height after being scaled down.
		const displayPipeWidth = 52;
		const displayPipeHeight = 284;

		const pipeGapHeight = 165;
		const topPipeMinY = -80;
		const bottomPipeMaxY = 145;
		//i don't know how these two variables below work, but it does. so leave it alone.
		const topPipeMaxY = displayPipeHeight / 2;
		const bottomPipeMinY = (screenHeight - (displayPipeHeight / 2)) - TextureConfig.ground.height;

		const topPipeY = Math.floor(Math.random() * (bottomPipeMaxY - topPipeMinY + 1) + topPipeMinY);
		const bottomPipeY = topPipeY + displayPipeHeight + pipeGapHeight;

		const topPipe = this.get(screenWidth + displayPipeWidth, topPipeY);
		//it won't happen anyway, unless you enlarge the canvas width. trust me.
		if (topPipe === null) return console.error("failed to generate top pipe, cancelled to draw the other pipes");

		//instantly set object to active, otherwise it will be overriden by bottom pipe.
		topPipe.spawn(true, false);
		this.#activePipes.push(topPipe);

		const bottomPipe = this.get(screenWidth + displayPipeWidth, bottomPipeY);
		//instantly set object to active, otherwise it will be overriden by additional pipe.
		bottomPipe.spawn(false, false);
		this.#activePipes.push(bottomPipe);
		
		//only create additional pipe if top or bottom pipe are lacking pipe body. 
		if (topPipeY > topPipeMaxY || bottomPipeY < bottomPipeMinY) {
			const additionalPipeY = topPipeY > topPipeMaxY 
				? topPipeY - displayPipeHeight
				: bottomPipeY + displayPipeHeight - 50; //50 is the cropped pipe head.
			
			const additionalPipe = this.get(screenWidth + displayPipeWidth, additionalPipeY);

			additionalPipe.spawn(false, true);
			this.#activePipes.push(additionalPipe);
		}

		return { topPipe, bottomPipe };
	}

	move(speed = 1.8) {
		this.incX(-speed);
	}

	//recycle pipe when they are out of screen.
	outOfBoundsRecycle() {
		for (let i = 0; i < this.#activePipes.length; i++) {
			//anyway, there will be only 3 pipes at max who will get out of bounds at the same time.
			if (i >= 5) break;

			if (this.#activePipes[i].x < 0 - this.#activePipes[i].displayWidth) {
				this.#activePipes[i].despawn();

				this.#activePipes.splice(i, 1);
				i--;
			}
		}
	}

	//activate each pipe members collision.
	activateCollision() {
		const pipeMember = this.getChildren();

		for (let i = 0; i < pipeMember.length; i++) {
			pipeMember[i].body.enable = true;

			if (i === pipeMember.length -1) return this.isCollisionActive = true;
		}
	}

	//disabling each pipe members collision.
	disableCollision() {
		const pipeMember = this.getChildren();

		for (let i = 0; i < pipeMember.length; i++) {
			pipeMember[i].body.enable = false;
			pipeMember[i].body.stop(); //stopping pipe velocity.

			if (i === pipeMember.length -1) this.isCollisionActive = false;
		}
	}
}

class Pipe extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, key) {
		super(scene, x, y, key);
		this.scene.physics.add.existing(this);
		this.scene.add.existing(this);

		this.body.immovable = true;
	}

	spawn(flipY, crop) {
		this.setVisible(true);
		this.setActive(true);

		if (flipY === true) this.flipY = true;
		if (crop === true) this.setCrop(0, 50, TextureConfig.pipe.width, TextureConfig.pipe.height);
	}

	despawn() {
		this.setActive(false);
		this.setVisible(false);
		this.resetFlip();
		this.setCrop(0, 0, TextureConfig.pipe.width, TextureConfig.pipe.height);
	}
}

export default PipeGroup;
