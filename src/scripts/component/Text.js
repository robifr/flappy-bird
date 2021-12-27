"use strict";

class Text extends Phaser.GameObjects.Text {
	#tweenHide;
	#tweenShow;

	constructor({ scene, x, y, originX = 0, originY = 0, text, style } = {}) {
		super(scene, x, y, text, style);
		this.scene.add.existing(this);

		this.setDepth(1);
		this.setOrigin(originX, originY);
		this.isHidden = false;
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
			alpha: 0, 
			duration: 1200,
			paused: true
		});
	}

	#createTweenShow() {
		return this.scene.tweens.add({ 
			targets: this, 
			alpha: 1, 
			duration: 1200,
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
}

export default Text;