class Betting extends Phaser.Scene {
    constructor() {
        super("bettingScene");
    }

    init(data) {
        this.points = data.points;
        this.rocketSpeed = data.rocketSpeed || 2;
        this.maxShots = data.maxShots || 1;
        this.selectedShipCount = null;
        this.selectedShip = null;
        this.shipSprites = [];
        this.colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
        this.wagerAmount = '';
        this.currentSelection = 0;
        this.state = 'shipCount';
        this.currentInstructions = null;
    }

    create() {
        // Add both sound effects near the start of create()
        this.selectSound = this.sound.add('sfx-select');
        this.highlightSound = this.sound.add('sfx-select', { 
            detune: -300  // Lower pitch by 300 cents (3 semitones)
        });
        
        // Define Y positions directly for easy adjustment
        const SPACING = {
            TOP_MARGIN: 120,           // Distance from top of screen
            INSTRUCTIONS_TO_BUTTONS: 80,  // Space between instructions and buttons
            BUTTONS_TO_SHIPS: 100,         // Space between buttons and ships
            SHIPS_TO_WAGER: 80           // Space between ships and wager
        };

        // Calculate positions based on cumulative spacing
        this.INSTRUCTION_Y = SPACING.TOP_MARGIN;
        this.BUTTONS_Y = this.INSTRUCTION_Y + SPACING.INSTRUCTIONS_TO_BUTTONS;
        this.SHIPS_Y = this.BUTTONS_Y + SPACING.BUTTONS_TO_SHIPS;
        this.WAGER_Y = this.SHIPS_Y + SPACING.SHIPS_TO_WAGER;

        // Header section
        let headerConfig = {
            fontFamily: 'Courier',
            fontSize: '32px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        };

        // Points display at top-center
        this.add.text(game.config.width/2, borderUISize, 
            `$: ${this.points}`, headerConfig).setOrigin(0.5, 0);

        // Instructions section
        let instructConfig = {
            fontFamily: 'Courier',
            fontSize: '24px',
            backgroundColor: null,
            color: '#FFFFFF',
            align: 'left',
            padding: { top: 5, bottom: 5 },
        };

        // Add navigation text configuration
        let navConfig = {
            fontFamily: 'Courier',
            fontSize: '20px',
            backgroundColor: null,
            color: '#FFFFFF',
            align: 'center',
            padding: { top: 5, bottom: 5 },
        };

        // Add instruction text
        this.currentInstructions = this.add.text(
            game.config.width/2, 
            this.INSTRUCTION_Y,
            'Select number of ships', 
            instructConfig
        ).setOrigin(0.5);

        // Ship count selection
        this.shipCountOptions = [];
        for(let i = 2; i <= 5; i++) {
            let option = this.add.text(
                game.config.width/2 + ((i-3.5) * 100),
                this.BUTTONS_Y,
                `${i}`, 
                {
                    ...instructConfig,  
                    backgroundColor: '#F3B141', 
                    align: 'center',
                    padding: { top: 25, bottom: 25, left: 25, right: 25 },
                    fixedWidth: 80,
                    fixedHeight: 80
                }
            ).setOrigin(0.5);
            this.shipCountOptions.push(option);
        }

        // Add mouse interactivity to ship count options
        this.shipCountOptions.forEach((option, index) => {
            option.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    this.currentSelection = index;
                    this.highlightSound.play();
                    this.updateSelection();
                })
                .on('pointerdown', () => {
                    if (this.state === 'shipCount') {
                        this.selectSound.play();
                        this.selectedShipCount = index + 2;
                        this.state = 'shipSelect';
                        this.currentSelection = 0;
                        this.currentInstructions.setText('Select your ship');
                        this.updateSelection();
                    }
                });
        });

        // Initialize ships
        this.showAllShips();
        
        // Initial selection highlight
        this.state = 'shipCount';
        this.currentSelection = 0;
        this.updateSelection();

        // Points display at bottom-center
        let shopButton = this.add.text(game.config.width/2, game.config.height - borderUISize, 
            `S for Shop`, {...headerConfig, backgroundColor: '#00FF00', color: '#000000'})
            .setOrigin(0.5, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                shopButton.setBackgroundColor('#FFFF00');
                this.highlightSound.play();
            })
            .on('pointerout', () => {
                shopButton.setBackgroundColor('#00FF00');
            })
            .on('pointerdown', () => {
                this.selectSound.play();
                this.scene.start('shopScene', {
                    points: this.points,
                    rocketSpeed: this.rocketSpeed,
                    maxShots: this.maxShots
                });
            });

        // Define keys
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Add number key listeners for betting
        this.input.keyboard.on('keydown', this.handleWagerInput, this);

        // Add mouse interactivity to ships
        this.shipSprites.forEach((ship, index) => {
            ship.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    if (this.state === 'shipSelect' && index < this.selectedShipCount) {
                        this.currentSelection = index;
                        this.highlightSound.play();
                        this.updateSelection();
                    }
                })
                .on('pointerdown', () => {
                    if (this.state === 'shipSelect' && index < this.selectedShipCount) {
                        this.selectSound.play();
                        this.selectedShip = index;
                        this.state = 'wager';
                        this.showWagerOptions();
                    }
                });
        });
    }

    handleWagerInput(event) {
        if(this.state === 'wager') {
            if(event.key >= '0' && event.key <= '9' && this.wagerAmount.length < 4) {
                this.highlightSound.play();  // Add lower-pitched sound for number presses
                this.wagerAmount += event.key;
                this.updateWagerText();
            } else if(event.key === 'Backspace' && this.wagerAmount.length > 0) {
                this.highlightSound.play();  // Add lower-pitched sound for backspace too
                this.wagerAmount = this.wagerAmount.slice(0, -1);
                this.updateWagerText();
            } else if(Phaser.Input.Keyboard.JustDown(keySPACE) && this.wagerAmount.length > 0) {
                const wager = parseInt(this.wagerAmount);
                if(wager > 0 && wager <= this.points) {
                    this.selectSound.play();  // Keep regular pitch for final confirmation
                    this.scene.start('playScene', {
                        shipCount: this.selectedShipCount,
                        selectedShip: this.selectedShip,
                        wager: wager,
                        points: this.points,
                        rocketSpeed: this.rocketSpeed,
                        maxShots: this.maxShots
                    });
                }
            }
        }
    }

    updateWagerText() {
        if(this.wagerText) {
            this.wagerText.setText(`$${this.wagerAmount}\nPress SPACE to wager`);
        }
    }

    clearCurrentStep() {
        // Clear current instructions and options
        if(this.currentInstructions) {
            this.currentInstructions.destroy();
        }
        this.shipCountOptions.forEach(option => option.destroy());
        this.shipCountOptions = [];
    }

    updateSelection() {
        // Update number button highlights
        this.shipCountOptions.forEach((option, index) => {
            option.setBackgroundColor(index === this.currentSelection && this.state === 'shipCount' ? '#F3B141' : '#666666');
        });

        if (this.state === 'shipCount') {
            this.shipSprites.forEach((ship, index) => {
                if (index < (this.currentSelection + 2)) {
                    ship.setAlpha(0.7);
                    ship.setScale(1);
                } else {
                    ship.setAlpha(0.1);
                    ship.setScale(0.7);
                }
                // Clean up any existing outlines
                if (ship.outline) {
                    ship.outline.destroy();
                    ship.outline = null;
                }
            });
        } else if (this.state === 'shipSelect') {
            this.shipSprites.forEach((ship, index) => {
                if (index < this.selectedShipCount) {
                    ship.setAlpha(1);
                    if (index === this.currentSelection) {
                        // Create outline effect behind the ship
                        if (!ship.outline) {
                            ship.outline = this.add.rectangle(
                                ship.x, 
                                ship.y, 
                                ship.width + 10, 
                                ship.height + 10, 
                                0xFFFFFF
                            ).setOrigin(0.5);
                            // Move outline to back
                            ship.outline.setDepth(ship.depth - 1);
                        }
                        ship.outline.setVisible(true);
                        ship.setScale(1.2);
                    } else {
                        if (ship.outline) {
                            ship.outline.destroy();
                            ship.outline = null;
                        }
                        ship.setScale(1);
                    }
                    ship.setTint(this.colors[index]);
                } else {
                    if (ship.outline) {
                        ship.outline.destroy();
                        ship.outline = null;
                    }
                    ship.setAlpha(0.1);
                    ship.setScale(0.7);
                }
            });
        }
    }

    update() {
        // Handle ESC key with all edge cases
        if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
            this.selectSound.play();  // Main selection sound
            if (this.state === 'shipSelect') {
                // Go back to ship count selection
                this.state = 'shipCount';
                this.currentSelection = this.selectedShipCount - 2;
                this.selectedShipCount = null;
                // Clean up selection outlines
                this.shipSprites.forEach(ship => {
                    if (ship.outline) {
                        ship.outline.destroy();
                        ship.outline = null;
                    }
                });
                this.currentInstructions.setText('Select number of ships');
                this.updateSelection();
            } else if (this.state === 'wager') {
                // Go back to ship selection
                this.state = 'shipSelect';
                this.currentSelection = this.selectedShip;
                this.selectedShip = null;
                this.wagerAmount = '';
                if (this.wagerText) {
                    this.wagerText.destroy();
                    this.wagerText = null;
                }
                this.currentInstructions.setText('Select your ship');
                this.updateSelection();
            } else if (this.state === 'shipCount') {
                // Go back to main menu
                this.selectSound.play();
                this.scene.start('menuScene');
            }
        }

        if(this.state === 'shipCount') {
            if(Phaser.Input.Keyboard.JustDown(keyLEFT) || Phaser.Input.Keyboard.JustDown(keyDOWN)) {
                this.highlightSound.play();  // Highlight sound
                this.currentSelection = Math.max(0, this.currentSelection - 1);
                this.updateSelection();
            }
            else if(Phaser.Input.Keyboard.JustDown(keyRIGHT) || Phaser.Input.Keyboard.JustDown(keyUP)) {
                this.highlightSound.play();  // Highlight sound
                this.currentSelection = Math.min(3, this.currentSelection + 1);
                this.updateSelection();
            }
            else if(Phaser.Input.Keyboard.JustDown(keySPACE)) {
                this.selectSound.play();  // Main selection sound
                this.selectedShipCount = this.currentSelection + 2;
                this.state = 'shipSelect';
                this.currentSelection = 0;
                this.currentInstructions.setText('Select your ship');
                this.updateSelection();
            }
        } else if(this.state === 'shipSelect') {
            if(Phaser.Input.Keyboard.JustDown(keyLEFT) || Phaser.Input.Keyboard.JustDown(keyDOWN)) {
                this.highlightSound.play();  // Highlight sound
                this.currentSelection = Math.max(0, this.currentSelection - 1);
                this.updateSelection();
            }
            else if(Phaser.Input.Keyboard.JustDown(keyRIGHT) || Phaser.Input.Keyboard.JustDown(keyUP)) {
                this.highlightSound.play();  // Highlight sound
                this.currentSelection = Math.min(this.selectedShipCount - 1, this.currentSelection + 1);
                this.updateSelection();
            }
            else if(Phaser.Input.Keyboard.JustDown(keySPACE)) {
                this.selectSound.play();  // Main selection sound
                this.selectedShip = this.currentSelection;
                this.state = 'wager';
                this.showWagerOptions();
            }
        }

        if(Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.selectSound.play();  // Main selection sound
            this.scene.start('shopScene', {
                points: this.points,
                rocketSpeed: this.rocketSpeed,
                maxShots: this.maxShots
            });
        }
    }

    showWagerOptions() {
        this.currentInstructions.setText('Type your wager amount:');
        
        this.wagerText = this.add.text(
            game.config.width/2,
            this.WAGER_Y, // Position under ships
            '$\nPress SPACE to play',
            {
                fontFamily: 'Courier',
                fontSize: '28px',
                backgroundColor: '#F3B141',
                color: '#843605',
                padding: { top: 5, bottom: 5 },
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    showShips(count) {
        // Clear any existing ships
        if (this.shipSprites) {
            this.shipSprites.forEach(sprite => sprite.destroy());
        }
        this.shipSprites = [];

        const spacing = 100;
        const startX = game.config.width/2 - ((count-1) * spacing/2);
        const shipY = this.SHIPS_Y; // Under the number buttons

        for(let i = 0; i < count; i++) {
            let ship = this.add.sprite(startX + (i * spacing), shipY, 'spaceship')
                .setOrigin(0.5, 0.5);
            ship.setTint(this.colors[i]);
            ship.setInteractive();
            ship.shipIndex = i;
            this.shipSprites.push(ship);
        }
    }

    showAllShips() {
        // Clear any existing ships
        if (this.shipSprites) {
            this.shipSprites.forEach(sprite => sprite.destroy());
        }
        this.shipSprites = [];

        const spacing = 100;
        const startX = game.config.width/2 - (4 * spacing/2);
        const shipY = this.SHIPS_Y;

        for(let i = 0; i < 5; i++) {
            let ship = this.add.sprite(startX + (i * spacing), shipY, 'spaceship')
                .setOrigin(0.5, 0.5);
            ship.setTint(this.colors[i]);
            ship.setAlpha(0.2); // Start very faded
            ship.setScale(0.8); // Start slightly smaller
            ship.shipIndex = i;
            this.shipSprites.push(ship);
        }
    }
} 