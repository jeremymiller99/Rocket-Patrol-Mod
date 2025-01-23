class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    init(data) {
        this.shipCount = data.shipCount;
        this.wager = data.wager;
        this.points = data.points;
        this.rocketSpeed = data.rocketSpeed;
        this.maxShots = data.maxShots;
        this.ships = [];  // Array to hold all ships
        this.rockets = [];  // Array to hold all rockets
        this.gameOver = false;
        this.currentRocketIndex = 0;
        this.selectedShip = data.selectedShip;
        this.lapCounters = []; // Array to hold lap counter text objects
    }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);
        
        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);

        // add rockets based on maxShots
        const rocketSpacing = 50;
        const startX = game.config.width/2 - ((this.maxShots-1) * rocketSpacing/2);
        
        for(let i = 0; i < this.maxShots; i++) {
            let rocket = new Rocket(
                this, 
                startX + (i * rocketSpacing), 
                game.config.height - borderUISize - borderPadding, 
                'rocket'
            ).setOrigin(0.5, 0);
            this.rockets.push(rocket);
        }

        // Initialize the first rocket as active
        this.rockets[this.currentRocketIndex].setActive(true);

        // Create array of possible y positions for ships
        let shipLanes = [
            borderUISize*4,
            borderUISize*5 + borderPadding*2,
            borderUISize*6 + borderPadding*4,
            borderUISize*7 + borderPadding*6,
            borderUISize*8 + borderPadding*8
        ];

        // Shuffle the lanes array
        shipLanes = Phaser.Utils.Array.Shuffle(shipLanes);

        // Create ships based on selected count
        const baseSpeed = game.settings?.spaceshipSpeed || 3;
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF]; // Different colors for each ship

        for(let i = 0; i < this.shipCount; i++) {
            let ship = new Spaceship(
                this,
                game.config.width + (borderUISize * (3 * i)),
                shipLanes[i],
                'spaceship',
                0,
                30,
                baseSpeed + Phaser.Math.Between(-1, 1)  // Random speed variation
            ).setOrigin(0, 0);
            
            ship.setTint(colors[i]);  // Set unique color
            ship.laps = 0;  // Initialize lap counter
            this.ships.push(ship);
        }

        // Add lap counters above each ship
        let lapConfig = {
            fontFamily: 'Courier',
            fontSize: '20px',
            color: '#FFFFFF',
            align: 'center',
            padding: { top: 5, bottom: 5 },
        };

        this.ships.forEach((ship, index) => {
            let lapText = this.add.text(ship.x, ship.y - 20, '0', lapConfig).setOrigin(0.5);
            this.lapCounters.push(lapText);
        });

        // Define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // Display multiplier
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 100
        };
        
        this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, 
            `${this.shipCount}x`, scoreConfig);
    }

    update() {
        if (!this.gameOver) {
            this.starfield.tilePositionX -= 4;
            
            // Update rockets
            this.rockets.forEach(rocket => rocket.update());
            
            // Update ships and their lap counters
            this.ships.forEach((ship, index) => {
                ship.update();
                
                // Update lap counter position and text
                if (!this.lapCounters) this.lapCounters = [];
                if (!this.lapCounters[index]) {
                    this.lapCounters[index] = this.add.text(ship.x, ship.y - 20, '0', {
                        fontFamily: 'Courier',
                        fontSize: '20px',
                        color: '#FFFFFF',
                        align: 'center'
                    }).setOrigin(0.5);
                }
                
                // Update counter position and text
                this.lapCounters[index].x = ship.x + ship.width/2;
                this.lapCounters[index].y = ship.y - 20;
                this.lapCounters[index].setText(`${ship.laps}`);
                
                // Check if ship has crossed the left boundary
                if(ship.x <= 0 - ship.width) {
                    ship.reset();
                    ship.addLap();
                    // Check if any ship has completed 3 laps
                    if(ship.laps >= 3) {
                        this.endRound();
                    }
                }
            });

            // Check collisions
            this.rockets.forEach(rocket => {
                if(rocket.isFiring) {
                    this.ships.forEach(ship => {
                        if(!ship.isExploding && this.checkCollision(rocket, ship)) {
                            rocket.reset();
                            this.shipExplode(ship);
                        }
                    });
                }
            });
        }
    }

    activateNextRocket() {
        // Deactivate current rocket
        this.rockets[this.currentRocketIndex].setActive(false);
        
        // Move to next rocket
        this.currentRocketIndex = (this.currentRocketIndex + 1) % this.rockets.length;
        
        // Activate next rocket
        this.rockets[this.currentRocketIndex].setActive(true);
    }

    endRound() {
        this.gameOver = true;
        
        // Find winning ship (first to complete 3 laps)
        let winner = this.ships.find(ship => ship.laps >= 3);
        let winningIndex = this.ships.indexOf(winner) + 1;

        let victoryConfig = {
            fontFamily: 'Courier',
            fontSize: '32px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        };

        // Calculate winnings with multiplier
        let winnings = 0;
        this.points -= this.wager;

        if (winningIndex === (this.selectedShip + 1)) { // If selected ship wins
            winnings = this.wager * this.shipCount;
            this.points += winnings;
            winnings = winnings - this.wager;
        } else {
            winnings = -this.wager;
        }

        // Check for game over conditions
        if (this.points >= 1000) {
            this.add.text(
                game.config.width/2,
                game.config.height/2 - 64,
                'CONGRATULATIONS!\nYou\'ve reached 1000 points!',
                victoryConfig
            ).setOrigin(0.5);
            
            victoryConfig.fontSize = '24px';
            this.add.text(
                game.config.width/2,
                game.config.height/2 + 32,
                'Press SPACE to play again',
                victoryConfig
            ).setOrigin(0.5);

            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.start('menuScene');
            });
            return;
        } 
        else if (this.points <= 0) {
            this.add.text(
                game.config.width/2,
                game.config.height/2 - 64,
                'GAME OVER!\nYou\'ve run out of points!',
                victoryConfig
            ).setOrigin(0.5);
            
            victoryConfig.fontSize = '24px';
            this.add.text(
                game.config.width/2,
                game.config.height/2 + 32,
                'Press SPACE to try again',
                victoryConfig
            ).setOrigin(0.5);

            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.start('menuScene');
            });
            return;
        }

        // Normal round end
        this.add.text(
            game.config.width/2,
            game.config.height/2,
            `Ship ${winningIndex} Wins!\nYou ${winnings >= 0 ? 'won' : 'lost'} ${Math.abs(winnings)} points!`,
            victoryConfig
        ).setOrigin(0.5);

        victoryConfig.fontSize = '24px';
        this.add.text(
            game.config.width/2,
            game.config.height/2 + 64,
            'Press SPACE to continue',
            victoryConfig
        ).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('bettingScene', { 
                points: this.points,
                rocketSpeed: this.rocketSpeed,
                maxShots: this.maxShots 
            });
        });
    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
          rocket.x + rocket.width > ship.x && 
          rocket.y < ship.y + ship.height &&
          rocket.height + rocket.y > ship. y) {
          return true
        } else {
          return false
        }
    }

    shipExplode(ship) {
        ship.alpha = 0;
        ship.isExploding = true;
        
        let boom = this.add.sprite(ship.x + ship.width/2, ship.y + ship.height/2, 'explosion').setOrigin(0.5, 0.5);
        boom.anims.play('explode');             
        boom.on('animationcomplete', () => {    
            ship.reset();                       
            ship.alpha = 1;
            ship.isExploding = false;
            boom.destroy();                     
        });

        this.sound.play('sfx-explosion');
    }
}