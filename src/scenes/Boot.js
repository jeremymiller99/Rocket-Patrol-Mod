class Boot extends Phaser.Scene {
    constructor() {
        super("bootScene");
    }

    preload() {
        // Load all images
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');

        // Load spritesheets
        this.load.spritesheet('explosion', './assets/explosion.png', {
            frameWidth: 64,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 9
        });

        // Load audio
        this.load.audio('sfx-select', './assets/sfx-select.wav');
        this.load.audio('sfx-explosion', './assets/sfx-explosion.wav');
        this.load.audio('sfx-shot', './assets/sfx-shot.wav');
        this.load.audio('sfx-lap-complete', './assets/lap-complete.wav');
        this.load.audio('sfx-race-complete', './assets/race-complete.wav');
    }

    create() {
        // Create animations
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { 
                start: 0, 
                end: 9, 
                first: 0
            }),
            frameRate: 30
        });

        // Define default game settings
        game.settings = {
            spaceshipSpeed: 3,
            gameTimer: 60000
        };

        // Start the menu scene
        this.scene.start('menuScene');
    }
} 