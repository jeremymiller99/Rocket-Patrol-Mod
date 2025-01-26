class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }
    
    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png')
        this.load.image('spaceship', './assets/spaceship.png')
        this.load.image('starfield', './assets/starfield.png')

        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {
            frameWidth: 64,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 9
        })

        // load audio
        this.load.audio('sfx-select', './assets/sfx-select.wav')
        this.load.audio('sfx-explosion', './assets/sfx-explosion.wav')
        this.load.audio('sfx-shot', './assets/sfx-shot.wav')
    }
    
    create() {
        // Add sound effect
        this.selectSound = this.sound.add('sfx-select');
        this.highlightSound = this.sound.add('sfx-select', { 
            detune: -300  // Lower pitch for hover/highlight sound
        });

        // Add starfield background
        this.starfield = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'starfield').setOrigin(0, 0);

        // Create flashing border lights
        this.createBorderLights();

        // Title configuration
        let titleConfig = {
            fontFamily: 'Courier',
            fontSize: '40px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: { top: 10, bottom: 10, left: 20, right: 20 },
            fixedWidth: 0
        }

        // Subtitle configuration
        let subtitleConfig = {
            fontFamily: 'Courier',
            fontSize: '32px',
            backgroundColor: null,
            color: '#FFD700', // Gold color
            align: 'center',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        }

        // Play button configuration
        let playConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#00FF00',
            color: '#000',
            align: 'center',
            padding: { top: 15, bottom: 15, left: 20, right: 20 },
            fixedWidth: 0
        }

        // Add decorative elements
        this.add.rectangle(game.config.width/2, game.config.height/2, game.config.width * 0.8, game.config.height * 0.7, 0x000000, 0.7)
            .setStrokeStyle(4, 0xFFD700);

        // Add title with shadow effect
        let title = this.add.text(game.config.width/2, game.config.height/3 - 25,'ROCKET PATROL', titleConfig).setOrigin(0.5);
        let casinoText = this.add.text(game.config.width/2, game.config.height/3 + 30, 'CASINO', titleConfig).setOrigin(0.5);
        
        // Add flashing subtitle
        let subtitle = this.add.text(game.config.width/2, game.config.height/2 + 15, '$100 ➜ $1000 EASY!', subtitleConfig).setOrigin(0.5);
        
        // Add play button with glow effect
        let playButton = this.add.text(game.config.width/2, game.config.height * 0.7, 'INSERT COIN\n(PRESS SPACE)', playConfig)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => {
                this.highlightSound.play();
            });

        // Add animations
        this.tweens.add({
            targets: subtitle,
            alpha: 0.2,
            duration: 1000,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        // define keys
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Modify SPACE key handler
        this.input.keyboard.once('keydown-SPACE', () => {
            this.selectSound.play();
            
            this.time.delayedCall(200, () => {
                this.scene.start('bettingScene', {
                    points: 100,
                    rocketSpeed: 2,
                    maxShots: 1
                });
            });
        });
    }

    createBorderLights() {
        const lightCount = 20;
        const colors = [0xFF0000, 0x00FF00, 0xFFFF00, 0x0000FF];
        
        for(let i = 0; i < lightCount; i++) {
            let light = this.add.circle(
                borderUISize + (i * ((game.config.width - borderUISize*2) / lightCount)),
                borderUISize,
                5,
                colors[i % colors.length]
            );

            this.tweens.add({
                targets: light,
                alpha: 0.2,
                duration: 500 + (i * 100),
                ease: 'Power2',
                yoyo: true,
                repeat: -1
            });
        }
    }

    update() {
        // Scroll starfield
        this.starfield.tilePositionX -= 2;
    }
}