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
    }

    create() {
        let betConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605', 
            align: 'center',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        };

        this.add.text(game.config.width/2, game.config.height/2 - 150, `Current Points: ${this.points}`, betConfig).setOrigin(0.5);
        this.add.text(game.config.width/2, game.config.height/2 - 100, 'Choose Number of Ships', betConfig).setOrigin(0.5);
        this.add.text(game.config.width/2, game.config.height/2, 'Press 1-5 for number of ships\nMore ships = Higher multiplier!', betConfig).setOrigin(0.5);

        // Define keys
        this.keyONE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.keyTWO = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.keyTHREE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.keyFOUR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        this.keyFIVE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.wagerText = this.add.text(game.config.width/2, game.config.height/2 + 50, '', betConfig).setOrigin(0.5);

        this.add.text(game.config.width/2, game.config.height/2 + borderUISize*3, 
            'Press S to visit Shop', betConfig).setOrigin(0.5);

        // Add pointer input for ship selection
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject.shipIndex !== undefined && !this.selectedShip) {
                this.selectedShip = gameObject.shipIndex;
                this.highlightSelectedShip(gameObject);
                this.promptWager();
            }
        });
    }

    showShipSelection(count) {
        // Clear any existing ships
        this.shipSprites.forEach(sprite => sprite.destroy());
        this.shipSprites = [];

        const spacing = 80;
        const startX = game.config.width/2 - ((count-1) * spacing/2);
        const shipY = game.config.height/2;

        // Create clickable ships
        for(let i = 0; i < count; i++) {
            let ship = this.add.sprite(
                startX + (i * spacing),
                shipY,
                'spaceship'
            ).setOrigin(0.5, 0.5);
            
            ship.setTint(this.colors[i]);
            ship.setInteractive();
            ship.shipIndex = i;
            this.shipSprites.push(ship);
        }

        let instructionConfig = {
            fontFamily: 'Courier',
            fontSize: '24px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        };

        this.add.text(game.config.width/2, shipY - 50, 
            'Click on a ship to place your bet!', instructionConfig).setOrigin(0.5);
    }

    highlightSelectedShip(selectedShip) {
        this.shipSprites.forEach(ship => {
            ship.setAlpha(ship === selectedShip ? 1 : 0.5);
        });
    }

    update() {
        if (this.selectedShipCount === null) {
            if (Phaser.Input.Keyboard.JustDown(this.keyONE)) {
                this.selectedShipCount = 1;
                this.showShipSelection(1);
            } else if (Phaser.Input.Keyboard.JustDown(this.keyTWO)) {
                this.selectedShipCount = 2;
                this.showShipSelection(2);
            } else if (Phaser.Input.Keyboard.JustDown(this.keyTHREE)) {
                this.selectedShipCount = 3;
                this.showShipSelection(3);
            } else if (Phaser.Input.Keyboard.JustDown(this.keyFOUR)) {
                this.selectedShipCount = 4;
                this.showShipSelection(4);
            } else if (Phaser.Input.Keyboard.JustDown(this.keyFIVE)) {
                this.selectedShipCount = 5;
                this.showShipSelection(5);
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.keyESC) && !this.selectedShip) {
            // Reset selection only if ship hasn't been selected yet
            this.selectedShipCount = null;
            this.shipSprites.forEach(sprite => sprite.destroy());
            this.shipSprites = [];
            // Clear any existing instruction text
            this.children.list
                .filter(child => child.type === 'Text')
                .forEach(text => {
                    if (text.text.includes('Click on a ship')) {
                        text.destroy();
                    }
                });
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.scene.start('shopScene', { 
                points: this.points,
                rocketSpeed: this.rocketSpeed,
                maxShots: this.maxShots 
            });
        }
    }

    promptWager() {
        this.wagerText.setText('Enter wager amount: ');
        this.input.keyboard.on('keydown', this.handleWagerInput, this);
    }

    handleWagerInput(event) {
        if (/^[0-9]$/.test(event.key) && this.wagerAmount.length < 3) {
            this.wagerAmount += event.key;
            this.wagerText.setText(`Enter wager amount: ${this.wagerAmount}`);
        } else if (event.key === 'Backspace' && this.wagerAmount.length > 0) {
            this.wagerAmount = this.wagerAmount.slice(0, -1);
            this.wagerText.setText(`Enter wager amount: ${this.wagerAmount}`);
        } else if (event.key === 'Enter' && this.wagerAmount.length > 0) {
            const wager = parseInt(this.wagerAmount);
            if (wager > 0 && wager <= this.points) {
                // Check if this wager could potentially make them win
                if (this.points + (wager * this.selectedShipCount) >= 1000) {
                    this.wagerText.setText(`You need ${1000 - this.points} more points to win!\nTry a smaller bet.`);
                    this.wagerAmount = '';
                    return;
                }
                
                this.input.keyboard.off('keydown', this.handleWagerInput, this);
                this.scene.start('playScene', { 
                    shipCount: this.selectedShipCount,
                    selectedShip: this.selectedShip,
                    wager: wager, 
                    points: this.points,
                    rocketSpeed: this.rocketSpeed,
                    maxShots: this.maxShots 
                });
            } else {
                this.wagerText.setText('Invalid wager. Try again.');
                this.wagerAmount = '';
            }
        }
    }
} 