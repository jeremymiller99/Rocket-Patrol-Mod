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

        // UI Configuration object
        this.UI_CONFIG = {
            colors: {
                border: 0xFFFFFF,
                uiBackground: 0x00FF00,
                betDisplay: 0xF3B141,
                leaderboardBg: 0x000000,
                shipColors: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF]
            },
            fonts: {
                header: {
                    fontFamily: 'Courier',
                    fontSize: '28px',
                    color: '#843605',
                    align: 'center',
                    padding: { top: 5, bottom: 5 }
                },
                leaderboard: {
                    fontFamily: 'Courier',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    align: 'center'
                },
                position: {
                    fontFamily: 'Courier',
                    fontSize: '14px',
                    color: '#FFFFFF'
                },
                bet: {
                    fontFamily: 'Courier',
                    fontSize: '28px',
                    color: '#843605',
                    align: 'center'
                }
            },
            leaderboard: {
                width: game.config.width * 0.2,
                height: game.config.width * 0.2,
                x: borderUISize * 2,
                y: game.config.height - (borderUISize * 6) - (this.ships.length * (borderUISize * 2.5)),  // Reduced from 8 to 7
                opacity: 0.5,
                spacing: borderUISize * 0.4,
                shipScale: 0.3,
                shipNames: ['Red', 'Green', 'Blue', 'Yellow', 'Pink']
            },
            betDisplay: {
                width: game.config.width * 0.6,
                height: borderUISize * 1.5,
                y: borderUISize + borderPadding + (borderUISize * 0.25)
            },
            lapCounter: {
                y: -20,
                fontSize: '20px',
                color: '#FFFFFF'
            }
        };
    }

    create() {
        // Initialize sounds
        this.lapCompleteSound = this.sound.add('sfx-lap-complete', { volume: 0.5 });
        this.raceCompleteSound = this.sound.add('sfx-race-complete', { volume: 0.7 });

        // Add starfield
        this.starfield = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'starfield').setOrigin(0, 0);

        // Create UI elements using config
        this.createBorders();
        this.createBetDisplay();
        this.createLeaderboard();

        // Define ship lanes with proper spacing
        let shipLanes = [
            borderUISize*4,
            borderUISize*5 + borderPadding*2,
            borderUISize*6 + borderPadding*4,
            borderUISize*7 + borderPadding*6,
            borderUISize*8 + borderPadding*8,
        ];

        // Create array of colors in the same order as the betting screen
        let shipColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];

        // Create array of indices and shuffle it
        let indices = Array.from({length: this.shipCount}, (_, i) => i);
        indices = shuffleArray(indices);

        // Add ships
        for(let i = 0; i < this.shipCount; i++) {
            // Generate random speed between 2 and 4
            let randomSpeed = Math.random() * 2 + 2;
            let colorIndex = indices[i];  // Use shuffled index
            
            this.ships.push(new Spaceship(
                this,
                game.config.width + borderUISize*6,
                shipLanes[i],
                'spaceship',
                0,
                30,
                randomSpeed
            ).setOrigin(0, 0));
            
            // Set the ship's color using the shuffled index
            this.ships[i].setTint(shipColors[colorIndex]);
            // Store the color index for reference
            this.ships[i].colorIndex = colorIndex;
        }

        // Add rockets
        for(let i = 0; i < this.maxShots; i++) {
            this.rockets.push(new Rocket(
                this,
                game.config.width/2,  // Center X position
                game.config.height - borderUISize - borderPadding,  // Bottom Y position
                'rocket',
                0,  // Fixed: Set frame to 0 instead of rocketSpeed
                this.rocketSpeed
            ).setOrigin(0.5, 0));
            this.rockets[i].setActive(false);
        }

        // Activate first rocket
        this.rockets[0].setActive(true);

        // Define only the keys we actually use
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createBorders() {
        // White borders using UI_CONFIG
        this.add.rectangle(0, 0, game.config.width, borderUISize, 
            this.UI_CONFIG.colors.border).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, 
            borderUISize, this.UI_CONFIG.colors.border).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 
            this.UI_CONFIG.colors.border).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, 
            game.config.height, this.UI_CONFIG.colors.border).setOrigin(0, 0);
    }

    createBetDisplay() {
        const config = this.UI_CONFIG.betDisplay;
        const x = (game.config.width - config.width) / 2;
        
        // Background
        this.add.rectangle(x, config.y, config.width, config.height, 
            this.UI_CONFIG.colors.betDisplay).setOrigin(0, 0);

        // Calculate potential winnings
        let winnings = this.wager * this.shipCount;

        // Bet text
        this.add.text(
            x + (config.width/2), 
            config.y + (config.height/2),
            `$${this.wager} to win $${winnings} (${this.shipCount}x)`,
            this.UI_CONFIG.fonts.bet
        ).setOrigin(0.5);
    }

    createLeaderboard() {
        const config = this.UI_CONFIG.leaderboard;
        
        // Background
        this.add.rectangle(
            config.x, 
            config.y, 
            config.width, 
            config.height, 
            this.UI_CONFIG.colors.leaderboardBg, 
            config.opacity
        ).setOrigin(0);

        // Title
        this.add.text(
            config.x + config.width/2 - 15, 
            config.y + borderUISize/2 + 50,
            "STANDINGS",   
            this.UI_CONFIG.fonts.leaderboard
        ).setOrigin(0.5);

        // Create position displays
        this.positionDisplays = [];
        
        for(let i = 0; i < this.shipCount; i++) {
            let yPos = config.y + borderUISize * 2 + (i * config.spacing);
            let centerX = config.x + (config.width / 2);
            
            // Background highlight for selected ship
            let highlight = this.add.rectangle(
                config.x,
                yPos,
                config.width,
                config.spacing,
                0x00FF00,
                i === this.selectedShip ? 0.6 : 0
            ).setOrigin(0, 0.5);
            
            // Lap counter text
            let lapText = this.add.text(
                centerX - 20,  // Adjusted position
                yPos,
                "0 LAPS",
                {
                    ...this.UI_CONFIG.fonts.position,
                    fontSize: '18px'
                }
            ).setOrigin(1, 0.5);  // Right align

            // Ship icon - positioned relative to lap text
            let shipIcon = this.add.sprite(
                centerX + 20,  // Adjusted position
                yPos,
                'spaceship'
            ).setScale(config.shipScale)
             .setTint(this.UI_CONFIG.colors.shipColors[i])
             .setOrigin(0, 0.5);  // Left align

            this.positionDisplays.push({
                highlight: highlight,
                lapDisplay: lapText,
                ship: shipIcon,
                rank: i
            });
        }
    }

    update() {
        if (!this.gameOver) {
            this.starfield.tilePositionX -= 4;
            
            // Update rockets
            this.rockets.forEach(rocket => {
                rocket.update();
                
                // Check collisions with each ship
                this.ships.forEach((ship, index) => {
                    if (this.checkCollision(rocket, ship) && !ship.isExploding) {
                        rocket.reset();
                        ship.isExploding = true;
                        ship.setVisible(false);
                        
                        // Main ship explosion
                        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
                        boom.anims.play('explode');
                        boom.on('animationcomplete', () => {
                            ship.reset();
                            ship.setVisible(true);
                            boom.destroy();
                        });

                        // Leaderboard icon explosion
                        let display = this.positionDisplays[index];
                        display.ship.setVisible(false);
                        let iconBoom = this.add.sprite(
                            display.ship.x, 
                            display.ship.y, 
                            'explosion'
                        ).setOrigin(0.5, 0.5)
                         .setScale(0.5);  // Smaller explosion for the icon
                        
                        iconBoom.anims.play('explode');
                        iconBoom.on('animationcomplete', () => {
                            display.ship.setVisible(true);
                            iconBoom.destroy();
                        });

                        this.sound.play('sfx-explosion');
                    }
                });
            });
            
            // Update ships
            this.ships.forEach((ship, index) => {
                ship.update();
                
                // Check if ship has crossed the left boundary
                if(ship.x <= 0 - ship.width) {
                    ship.reset();
                    ship.addLap();
                    
                    if (this.lapCompleteSound) {
                        this.lapCompleteSound.play();
                    }

                    if(ship.laps >= 3) {
                        this.endRound();
                    }
                }
            });

            // Update leaderboard positions
            this.updateLeaderboard();
        }
    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        return (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y);
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
        this.points -= this.wager;  // Deduct wager first

        if (winningIndex === (this.selectedShip + 1)) { // If selected ship wins
            winnings = this.wager * this.shipCount;  // Calculate total winnings
            this.points += winnings;  // Add winnings to points
        } else {
            winnings = -this.wager;  // Just show the loss amount
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
                'Press SPACE to play again or C to continue',
                victoryConfig
            ).setOrigin(0.5);

            // Play race complete sound
            if (this.raceCompleteSound) {
                this.raceCompleteSound.play();
            }

            // Handle input for choices
            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.start('menuScene');
            });

            this.input.keyboard.once('keydown-C', () => {
                this.scene.start('bettingScene', { 
                    points: this.points,
                    rocketSpeed: this.rocketSpeed,
                    maxShots: this.maxShots 
                });
            });

            return;
        } 
        else if (this.points <= 0) {
            this.add.text(
                game.config.width/2,
                game.config.height/2 - 64,
                'GAME OVER!\nYou\'ve run out of $!',
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
            `Ship ${winningIndex} Wins!\nYou ${winnings >= 0 ? 'won' : 'lost'} $${Math.abs(winnings)}!`,
            victoryConfig
        ).setOrigin(0.5);

        victoryConfig.fontSize = '24px';
        this.add.text(
            game.config.width/2,
            game.config.height/2 + 64,
            'Press SPACE to continue',
            victoryConfig
        ).setOrigin(0.5);

        // Play race complete sound
        if (this.raceCompleteSound) {
            this.raceCompleteSound.play();
        }

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('bettingScene', { 
                points: this.points,
                rocketSpeed: this.rocketSpeed,
                maxShots: this.maxShots 
            });
        });
    }

    resetRound() {
        // Reset gameOver flag
        this.gameOver = false;

        // Reset ships positions and laps
        this.ships.forEach(ship => {
            ship.reset();
            ship.laps = 0;
        });

        // Reset lap counters
        this.lapCounters.forEach(lapText => {
            lapText.setText('0');
        });

        // Reset rockets
        this.rockets.forEach(rocket => rocket.reset());

        // Reactivate the first rocket
        this.currentRocketIndex = 0;
        this.rockets[this.currentRocketIndex].setActive(true);

        // Remove victory texts
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text && 
                (child.text.includes('CONGRATULATIONS') || child.text.includes('GAME OVER'))) {
                child.destroy();
            }
        });
    }

    updateLeaderboard() {
        let sortedShips = this.ships.map((ship, index) => ({
            ship: ship,
            index: ship.colorIndex,  // Use colorIndex instead of array index
            progress: (ship.laps * game.config.width) + (game.config.width - ship.x)
        })).sort((a, b) => b.progress - a.progress);

        sortedShips.forEach((shipData, newRank) => {
            let display = this.positionDisplays[shipData.index];
            let yPos = this.UI_CONFIG.leaderboard.y + borderUISize * 3 + (newRank * this.UI_CONFIG.leaderboard.spacing);
            
            display.highlight.y = yPos;
            display.highlight.alpha = shipData.index === this.selectedShip ? 0.6 : 0;
            display.lapDisplay.setText(`${shipData.ship.laps} LAP${shipData.ship.laps !== 1 ? 'S' : ''}`);
            display.lapDisplay.y = yPos;
            display.ship.y = yPos;
            display.rank = newRank;
        });
    }
}

// Add this function after the class declaration but before any other methods
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}