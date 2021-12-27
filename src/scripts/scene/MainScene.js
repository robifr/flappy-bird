"use strict";

import TextureConfig from "../../config/texture.json" assert { type: "json" };
import Cache from "../utils/Cache.js";

import Background from "../component/Background.js";
import Bird from "../component/Bird.js";
import GetReady from "../component/GetReady.js";
import Ground from "../component/Ground.js";
import Logo from "../component/Logo.js";
import PipeGroup from "../component/Pipe.js";
import Text from "../component/Text.js";

class MainScene extends Phaser.Scene {
	constructor() {
		super("MAIN");
		/** canvas elements */
		this.background = null;
		this.ground = null;
		this.bird = null;
		this.logo = null;
		this.getReadyText = null;
		this.instructionText = null;
		this.scoreText = null;

		this.score = 0;
		this.bestScore = 0;

		/** game state */
		this.state = "WAITING_TO_START";
		this.stateBeginTime = 0; //always update this property when changing game state.
		this.development = false;

		this.keyboardInput = null;
	}

	create() {
		const screenWidth = this.cameras.main.width;
		const screenHeight = this.cameras.main.height;
		
		/** retrieving cached data */
		try {
			//TODO: cache didn't get fetched when the application is shipped with final running executable file.
			//		probably because "fs" module need to look up for a directory name.
			Cache.fetch();
		} catch (err) {
			console.error(err);
		}

		const background = Cache.data && Cache.data.background !== null ? Cache.data.background : TextureConfig.background.day.key;
		const birdSkin = Cache.data && Cache.data.birdSkin !== null ? Cache.data.birdSkin : TextureConfig.background.day.key;
		const bestScore = Cache.data && Cache.data.bestScore !== null ? Cache.data.bestScore : 0;

		Cache.data.background = background;
		Cache.data.birdSkin = birdSkin;
		Cache.data.bestScore = bestScore;

		this.bestScore = Cache.data.bestScore;

		/** creating sprites */
		this.background = new Background({ 
			scene: this, x: screenWidth / 2, y: (screenHeight / 2) - TextureConfig.ground.height - 10,
			width: this.sys.canvas.width, height: TextureConfig.background.height, key: Cache.data.background
		});
		this.pipeGroup = new PipeGroup({ scene: this, visible: true });
		this.ground = new Ground({ scene: this, x: screenWidth / 2, y: screenHeight - TextureConfig.ground.height + 60 });
		this.bird = new Bird({ scene: this, x: screenWidth / 2, y: screenHeight / 2.5, key: Cache.data.birdSkin });
		this.logo = new Logo({ scene: this, x: screenWidth / 2, y: screenHeight / 6 });
		this.getReadyText = new GetReady({ scene: this, x: screenWidth / 2, y: screenHeight / 2 });
		this.instructionText = new Text({ 
			scene: this, x: screenWidth / 2, y: screenHeight - 75, originX: 0.5, 
			text: "Press Spacebar to start, \nRight/Left to change character, \nUp/Down to change background.",
			style: { font: "18px monospace", fill: "#000000", align: "center" }
		});
		this.scoreText = new Text({ 
			scene: this, x: 20, y: 20, 
			text: `Best score: ${this.bestScore} \nScore: ${this.score}`,
			style: { font: "16px arial", fontStyle: "bold", fill: "#111111" }
		});

		/** preparing collision */
		this.physics.add.collider(this.bird, this.ground, this.gameOver, null, this);
		this.physics.add.collider(this.bird, this.pipeGroup, this.gameOver, null, this);

		/** preparing input */
		this.keyboardInput = this.input.keyboard.addKeys({
			space: Phaser.Input.Keyboard.KeyCodes.SPACE,
			up: Phaser.Input.Keyboard.KeyCodes.UP,
			down: Phaser.Input.Keyboard.KeyCodes.DOWN,
			left: Phaser.Input.Keyboard.KeyCodes.LEFT,
			right: Phaser.Input.Keyboard.KeyCodes.RIGHT
		});

		/** setting up initial state for sprites */
		this.bird.setCollideWorldBounds(true);
		this.bird.startFlapping();
		this.logo.startUpAndDown();
		this.getReadyText.setAlpha(0);
		this.getReadyText.isHidden = true;

		this.stateBeginTime = Date.now();
	}

	update() {
		switch (this.state) {
			case "WAITING_TO_START":
				this.homeScreen();
				break;

			case "GET_READY":
				this.getReady();
				break;

			case "PLAYING":
				this.play();
				break;

			case "GAME_OVER":
				this.gameOver();
				break;
		}

		this.updateScoreText();
	}

	homeScreen() {
		const birdTargetX = this.cameras.main.width / 2;
		const birdTargetY = this.cameras.main.height / 2.5;
		const birdTargetAngle = 0;

		this.instructionText.text = "Press Spacebar to start, \nRight/Left to change character, \nUp/Down to change background.";
		this.bird.body.allowGravity = false;
		this.bird.moveRight(birdTargetX, birdTargetY, birdTargetAngle);
		this.background.move();
		this.ground.move();
		this.pipeGroup.move();
		this.pipeGroup.outOfBoundsRecycle();

		//selecting skin.
		if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.right)) {
			Cache.data.birdSkin = this.bird.changeSkin(1);
		} else if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.left)) {
			Cache.data.birdSkin = this.bird.changeSkin(-1);
		}

		//selecting background.
		if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.up)) {
			Cache.data.background = this.background.change(1);
		} else if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.down)) {
			Cache.data.background = this.background.change(-1);
		}

		//user is ready to play.
		if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.space)) {
			this.logo.hide();
			this.instructionText.hide();

			this.state = "GET_READY";
			this.stateBeginTime = Date.now();
		}
	}

	getReady() {
		const birdTargetX = 200;
		const birdTargetY = this.cameras.main.height / 2.5;
		const birdTargetAngle = 0;

		this.bird.body.allowGravity = false;
		this.bird.moveLeft(birdTargetX, birdTargetY, birdTargetAngle);
		this.background.move();
		this.ground.move();
		this.pipeGroup.move(2.5);
		this.pipeGroup.outOfBoundsRecycle();

		//animating "get ready" text in specified time frame.
		if (this.getReadyText.elapsedClickingTime === 0
			&& this.getReadyText.isHidden
			//sometimes animation play too early.
			//ensuring all the pipes from last game have been moved out of screen.
			&& (!this.pipeGroup.lastGeneratedPipe || this.pipeGroup.lastGeneratedPipe.x < 0)) {
			this.getReadyText.show();
			this.getReadyText.startClicking();
		} else if (Date.now() - this.getReadyText.elapsedClickingTime > 3000
			&& !this.getReadyText.isHidden) {
			this.getReadyText.stopClicking();
			this.getReadyText.hide();
		}

		//its time for the game to start.
		if (Date.now() - this.getReadyText.elapsedClickingTime > 6000
			//ensuring all the pipes from last game have been moved out of screen.
			&& (!this.pipeGroup.lastGeneratedPipe || this.pipeGroup.lastGeneratedPipe.x < 0)
			//ensuring bird is already on their position.
			&& this.bird.x <= birdTargetX 
			&& this.bird.y <= birdTargetY 
			&& this.bird.angle <= birdTargetAngle) {
			this.pipeGroup.activateCollision();
			
			this.state = "PLAYING";
			this.stateBeginTime = Date.now();
		}
	}

	play() {
		this.bird.body.allowGravity = true;
		this.bird.fall();
		this.background.move();
		this.ground.move();
		this.pipeGroup.move();
		this.pipeGroup.outOfBoundsRecycle();

		this.updateScore();

		//re-generate new pipes with 130 pixel delay.
		if (!this.pipeGroup.lastGeneratedPipe 
			|| this.pipeGroup.lastGeneratedPipe.x < this.cameras.main.width - 130) {
			const { topPipe } = this.pipeGroup.generate();

			//since top and bottom pipes have exact same X-coordinate, it's just unnecessary to add both.
			this.pipeGroup.lastGeneratedPipe = topPipe;
			this.pipeGroup.nextPipe.push(topPipe);
		}

		if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.space)) {
			this.bird.fly();
		}
	}

	gameOver() {
		this.state = "GAME_OVER";
		//clearing next pipes. ensuring if the user want to play again and passes these pipe 
		//during get-ready state they won't get any score until new pipes generated.
		this.pipeGroup.nextPipe = [];

		this.score = 0;
		this.updateScore();

		this.instructionText.text = "Press Spacebar to restart, \nLeft key to go home screen.";
		this.bird.fall();

		if (!Cache.saved) {
			try {
				Cache.data.bestScore = this.bestScore;
				Cache.save();
				Cache.saved = true;
				
			} catch (err) {
				console.error(err);
			}
		}

		//these methods below could be expensive tho.
		if (this.instructionText.isHidden) this.instructionText.show();
		if (this.bird.flapAnimation.manager.isPlaying) this.bird.stopFlapping();
		if (this.pipeGroup.isCollisionActive) this.pipeGroup.disableCollision();

		//only allow user to restart once the bird hit ground and pipe collision have been disabled.
		if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.space) 
			&& this.bird.body.touching.down
			&& !this.pipeGroup.isCollisionActive) {
			this.bird.startFlapping();
			this.instructionText.hide();
			Cache.saved = false;

			this.state = "GET_READY";
			this.stateBeginTime = Date.now();
		
		//only allow user to go homescreen once the bird hit ground and pipe collision have been disabled.
		} else if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.left) 
			&& this.bird.body.touching.down
			&& !this.pipeGroup.isCollisionActive) {
			this.bird.startFlapping();
			this.logo.show();
			Cache.saved = false;

			this.state = "WAITING_TO_START";
			this.stateBeginTime = Date.now();	
		}
	}

	updateScore() {
		const nextPipe = this.pipeGroup.nextPipe;

		//increment score if bird has passed the next pipe.
		for (let i = 0; i < nextPipe.length; i++) {
			if (this.bird.x > nextPipe[i].x + nextPipe[i].displayWidth) {
				this.score++;

				nextPipe.splice(i, 1);
				i--;
			}
		}

		this.bestScore = this.score > this.bestScore ? this.score : this.bestScore;
	}

	updateScoreText() {
		//development option to show fps and active pipes.
		if (Phaser.Input.Keyboard.JustDown(this.keyboardInput.up)
			&& Phaser.Input.Keyboard.JustDown(this.keyboardInput.right)
			&& this.state === "GAME_OVER") {
			this.development = this.development ? false : true;
		}

		if (this.development) {
			this.scoreText.text = `Fps: ${Math.floor(this.game.loop.actualFps)}\
				\nActive pipes: ${this.pipeGroup.countActive()}\
				\nBest score: ${this.bestScore}\
				\nScore: ${this.score}`;
		
		} else {
			this.scoreText.text = `Best score: ${this.bestScore}\
				\nScore: ${this.score}`;
		}
	}
}

export default MainScene;
