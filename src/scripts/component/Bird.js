"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };

class Bird extends Phaser.Physics.Arcade.Sprite {
	#skin = [
		TextureConfig.bird.yellow.key, 
		TextureConfig.bird.blue.key, 
		TextureConfig.bird.red.key,
		TextureConfig.bird.rainbow.key
	];

	constructor({ scene, x, y, key = TextureConfig.bird.red.key } = {}) {
		super(scene, x, y, key);
		this.scene.physics.add.existing(this);
		this.scene.add.existing(this);

		this.setScale(0.4, 0.4);
		this.setDepth(1);
		this.setGravityY(800);
		this.flapAnimation = this.#createFlapAnimation();
	}

	#createFlapAnimation() {
		return this.anims.create({
			key: TextureConfig.bird.animation.flap,
			frames: this.anims.generateFrameNumbers(this.texture.key, { start: 0, end: 2 }),
			frameRate: 10,
			repeat: -1
		});
	}

	startFlapping() {
		this.anims.play(TextureConfig.bird.animation.flap, true);
	}

	stopFlapping() {
		this.anims.stop(TextureConfig.bird.animation.flap, true);
	}

	changeSkin(cursor = 1) {
		const oldSkin = this.texture.key;
		const currentSkinIndex = this.#skin.findIndex(skin => skin === oldSkin);
		let skinIndex = currentSkinIndex + cursor;

		if (currentSkinIndex < 0) return console.error(`couldn't find texture key named ${oldSkin} inside 'skin' array`);
		//prevents array out of bounds error.
		if (skinIndex < 0) skinIndex = 3;
		if (skinIndex > 3) skinIndex = 0;

		const newSkin = this.#skin[skinIndex];

		//stop the animation firstly before removing old skin texture, then replay again later
		//once the texture have been changed. otherwise weird bugs will occur.
		this.stopFlapping();

		this.#removeFlapAnimationFrameByKey(oldSkin);
		this.flapAnimation.addFrame(newSkin);
		this.setTexture(newSkin);

		this.startFlapping();
		return newSkin;
	}

	//remove flap animation frame by its texture key.
	#removeFlapAnimationFrameByKey(key) {
		for (let i = 0; i < this.flapAnimation.frames.length; i++) {
			if (this.flapAnimation.frames[i].textureKey === key) {
				this.flapAnimation.removeFrameAt(i);
				i--;
			}
		}
	}

	fly() {
		this.body.velocity.y = -400;
		this.angle = -60;
	}

	fall() {
		const fallAngle = 60;
		const angleDelta = 2;

		if (this.angle < fallAngle) {
			this.angle += angleDelta;
		}
	}

	moveLeft(x, y, angle) {
		if (this.x > x) this.x -= 1.5;
		if (this.y > y) this.y -= 1.5;
		if (this.angle > angle) this.angle -= 1;
	}

	moveRight(x, y, angle) {
		if (this.x < x) this.x += 1.5;
		if (this.y > y) this.y -= 1.5;
		if (this.angle > angle) this.angle -= 1;
	}
}

export default Bird;
