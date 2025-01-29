class Shop extends Phaser.Scene {
    constructor() {
        super("shopScene");
    }

    init(data) {
        this.points = data.points || 0;
        this.rocketSpeed = data.rocketSpeed || 2;
        this.maxShots = data.maxShots || 1;
        
        // Base costs
        this.speedCost = 50;
        this.shotCost = 100;

        // Double the cost for each upgrade already purchased
        for(let i = 2; i < this.rocketSpeed; i += 0.5) {
            this.speedCost *= 2;
        }
        
        for(let i = 1; i < this.maxShots; i++) {
            this.shotCost *= 2;
        }

        // Add selection tracking
        this.currentSelection = 0;  // 0: Speed, 1: Shots, 2: Back
        this.maxSelection = this.maxShots < 4 ? 2 : 1;  // Adjust based on if shots upgrade is available
    }

    create() {
        // Add sound effects
        this.selectSound = this.sound.add('sfx-select');
        this.highlightSound = this.sound.add('sfx-select', { 
            detune: -300
        });

        // Configuration for menu text
        let menuConfig = {
            fontFamily: 'Courier',
            fontSize: '26px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        };

        // Display current points
        this.add.text(game.config.width/2, borderUISize*2, `$: ${this.points}`, menuConfig).setOrigin(0.5);

        // Speed upgrade option
        menuConfig.backgroundColor = '#00FF00';
        this.speedText = this.add.text(game.config.width/2, game.config.height/2 - borderUISize*2, 
            `Speed Upgrade ($${this.speedCost})\nCurrent: ${this.rocketSpeed}`, menuConfig)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.currentSelection = 0;
                this.highlightSound.play();
                this.updateSelection();
            })
            .on('pointerdown', () => {
                if(this.points >= this.speedCost && (this.points - this.speedCost) > 0) {
                    this.selectSound.play();
                    this.points -= this.speedCost;
                    this.rocketSpeed += 0.5;
                    this.scene.restart({ 
                        points: this.points, 
                        rocketSpeed: this.rocketSpeed, 
                        maxShots: this.maxShots 
                    });
                }
            });

        // Shot count upgrade option
        if (this.maxShots < 4) {
            this.shotText = this.add.text(game.config.width/2, game.config.height/2, 
                `Shot Count Upgrade ($${this.shotCost})\nCurrent: ${this.maxShots}`, menuConfig)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    this.currentSelection = 1;
                    this.highlightSound.play();
                    this.updateSelection();
                })
                .on('pointerdown', () => {
                    if(this.maxShots < 4 && this.points >= this.shotCost && (this.points - this.shotCost) > 0) {
                        this.selectSound.play();
                        this.points -= this.shotCost;
                        this.maxShots += 1;
                        this.scene.restart({ 
                            points: this.points, 
                            rocketSpeed: this.rocketSpeed, 
                            maxShots: this.maxShots 
                        });
                    }
                });
        } else {
            this.shotText = this.add.text(game.config.width/2, game.config.height/2, 
                'Maximum Rocket Count Reached! (4)', menuConfig).setOrigin(0.5);
        }

        // Back to betting option
        menuConfig.backgroundColor = '#F3B141';
        this.backText = this.add.text(game.config.width/2, game.config.height/2 + borderUISize*2, 
            'Return to Betting', menuConfig)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.currentSelection = 2;
                this.highlightSound.play();
                this.updateSelection();
            })
            .on('pointerdown', () => {
                this.selectSound.play();
                this.scene.start('bettingScene', { 
                    points: this.points,
                    rocketSpeed: this.rocketSpeed,
                    maxShots: this.maxShots 
                });
            });

        // Define keys for keyboard controls
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // Update initial selection
        this.updateSelection();
    }

    update() {
        // Handle navigation
        if(Phaser.Input.Keyboard.JustDown(keyLEFT) || 
           Phaser.Input.Keyboard.JustDown(keyDOWN) ||
           Phaser.Input.Keyboard.JustDown(keyRIGHT) ||
           Phaser.Input.Keyboard.JustDown(keyUP)) {
            this.highlightSound.play();
            if(Phaser.Input.Keyboard.JustDown(keyLEFT) || Phaser.Input.Keyboard.JustDown(keyDOWN)) {
                this.currentSelection = (this.currentSelection - 1 + this.maxSelection + 1) % (this.maxSelection + 1);
            } else {
                this.currentSelection = (this.currentSelection + 1) % (this.maxSelection + 1);
            }
            this.updateSelection();
        }

        // Handle selection
        if(Phaser.Input.Keyboard.JustDown(keySPACE)) {
            switch(this.currentSelection) {
                case 0: // Speed upgrade
                    if(this.points >= this.speedCost && (this.points - this.speedCost) > 0) {
                        this.selectSound.play();
                        this.points -= this.speedCost;
                        this.rocketSpeed += 0.5;
                        this.scene.restart({ 
                            points: this.points, 
                            rocketSpeed: this.rocketSpeed, 
                            maxShots: this.maxShots 
                        });
                    }
                    break;
                case 1: // Shot upgrade
                    if(this.maxShots < 4 && this.points >= this.shotCost && (this.points - this.shotCost) > 0) {
                        this.selectSound.play();
                        this.points -= this.shotCost;
                        this.maxShots += 1;
                        this.scene.restart({ 
                            points: this.points, 
                            rocketSpeed: this.rocketSpeed, 
                            maxShots: this.maxShots 
                        });
                    }
                    break;
                case 2: // Back to betting
                    this.selectSound.play();
                    this.scene.start('bettingScene', { 
                        points: this.points,
                        rocketSpeed: this.rocketSpeed,
                        maxShots: this.maxShots 
                    });
                    break;
            }
        }
    }

    updateSelection() {
        // Reset all text backgrounds
        this.speedText.setBackgroundColor('#00FF00');
        this.shotText.setBackgroundColor('#00FF00');
        this.backText.setBackgroundColor('#F3B141');

        // Highlight selected option
        switch(this.currentSelection) {
            case 0:
                this.speedText.setBackgroundColor('#FFFF00');
                break;
            case 1:
                this.shotText.setBackgroundColor('#FFFF00');
                break;
            case 2:
                this.backText.setBackgroundColor('#FFFF00');
                break;
        }
    }
} 