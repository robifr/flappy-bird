"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };

class Logo extends Phaser.GameObjects.Sprite {
	#tweenUpAndDown;
	#tweenHide;
	#tweenShow;
	
	constructor({ scene, x, y, key = TextureConfig.text.logo.key } = {}) {
		super(scene, x, y, key);
		this.scene.add.existing(this);

		this.#tweenUpAndDown = this.#createTweenUpAndDown();
		/**
		 * somehow i can't use single tween and update the value whenever we need to change the end value.
		 * i suppose there's a bug with Phaser tween. just use two tweens for temporary solution.
		 */
		this.#tweenHide = this.#createTweenHide();
		this.#tweenShow = this.#createTweenShow();
	}

	#createTweenHide() {
		return this.scene.tweens.add({
			targets: this,
			x: -this.displayWidth,
			ease: "Linear",
			duration: 1500,
			paused: true
		});
	}

	#createTweenShow() {
		return this.scene.tweens.add({
			targets: this,
			x: this.scene.cameras.main.width / 2,
			ease: "Linear",
			duration: 1500,
			paused: true
		})
	}

	#createTweenUpAndDown() {
		return this.scene.tweens.add({
			targets: this,
			y: this.y + 50,
			ease: "Linear",
			duration: 1400,
			yoyo: true,
			repeat: -1,
			paused: true
		});
	}

	startUpAndDown() {
		this.#tweenUpAndDown.resume();
	}

	stopUpAndDown() {
		this.#tweenUpAndDown.pause();
	}

	hide() {
		this.stopUpAndDown();
		this.setActive(false);

		this.#tweenHide.paused = false;
		this.#tweenHide.makeActive();
		this.#tweenHide.restart();

		this.#tweenHide.once("complete", () => {
			this.setVisible(false);
		});
	}

	show() {
		this.setActive(true);
		this.setVisible(true);

		this.#tweenShow.paused = false;
		this.#tweenShow.makeActive();
		this.#tweenShow.restart();

		this.#tweenShow.once("complete", () => {
			this.startUpAndDown();
		});
	}
}

export default Logo;