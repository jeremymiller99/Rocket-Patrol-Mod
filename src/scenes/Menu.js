class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }
    
    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png')
        this.load.image('spaceship', './assets/spaceship.png')
        this.load.image('starfield', './assets/starfield.png')
        //this.load.image('spaceship1', './assets/spaceship1.png');
        //this.load.image('spaceship2', './assets/spaceship2.png');
        //this.load.image('spaceship3', './assets/spaceship3.png');
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
        // animation configuration
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        })

        // add menu items
        let menuConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        }

        this.add.text(game.config.width/2, game.config.height/2, 'ROCKET PATROL CASINO', menuConfig).setOrigin(0.5)

        menuConfig.backgroundColor = '#00FF00'
        menuConfig.color = '#000'
        this.add.text(game.config.width/2, game.config.height/2 + borderUISize*2, 'Press (SPACE) to Play', menuConfig).setOrigin(0.5)

        // define keys
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Add handler for SPACE key
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('bettingScene', {
                points: 100,  // Starting points
                rocketSpeed: 2,  // Starting rocket speed
                maxShots: 1   // Starting max shots
            });
        });
    }

    
    update() {
        if (Phaser.Input.Keyboard.JustDown(keySPACE)) {
            game.settings = {
                spaceshipSpeed: 3,
                points: 100
            }
            this.sound.play('sfx-select')
            this.scene.start('bettingScene', { points: game.settings.points })    
        }
    }
}