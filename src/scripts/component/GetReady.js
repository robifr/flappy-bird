"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };

class GetReady extends Phaser.GameObjects.Sprite {
	#clickAnimationElapsed = 0;
	#tweenHide;
	#tweenShow;

	constructor({ scene, x, y, key = TextureConfig.text.getready.unclicked.key } = {}) {
		super(scene, x, y, key);
		this.scene.add.existing(this);
		
		this.setScale(0.8, 0.8);
		this.isHidden = false;
		this.clickAnimation = this.#createClickAnimation();
		/**
		 * somehow i can't use single tween and update the value whenever we need to change the end value.
		 * i suppose there's a bug with Phaser tween. just use two tweens for temporary solution.
		 */
		this.#tweenHide = this.#createTweenHide();
		this.#tweenShow = this.#createTweenShow();
	}

	#createClickAnimation() {
		const animationKey = TextureConfig.text.getready.animation.click;
		const unclickedFrameKey = TextureConfig.text.getready.unclicked.key;
		const clickedFrameKey = TextureConfig.text.getready.clicked.key;

		return this.anims.create({
			key: animationKey,
			frames: [{ frame: 0, key: unclickedFrameKey }, { frame: 0, key: clickedFrameKey }],
			frameRate: 2,
			repeat: -1
		});
	}

	#createTweenHide() {
		return this.scene.tweens.add({ 
			targets: this, 
			alpha: 0, 
			duration: 1000,
			paused: true
		});
	}

	#createTweenShow() {
		return this.scene.tweens.add({ 
			targets: this, 
			alpha: 1, 
			duration: 1000,
			paused: true
		});
	}

	hide() {
		this.#tweenHide.play();
		this.isHidden = true;
	}

	show() {
		this.#tweenShow.play();
		this.isHidden = false;
	}

	get elapsedClickingTime() { return this.#clickAnimationElapsed; }

	startClicking() {
		this.anims.play(TextureConfig.text.getready.animation.click, true);
		this.#clickAnimationElapsed = Date.now();
	}

	stopClicking() {
		this.anims.stop(TextureConfig.text.getready.animation.click, true);
		this.#clickAnimationElapsed = 0;
	}
}

export default GetReady;
