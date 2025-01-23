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
    }

    create() {
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
        this.add.text(game.config.width/2, borderUISize*2, `Points: ${this.points}`, menuConfig).setOrigin(0.5);

        // Speed upgrade option
        menuConfig.backgroundColor = '#00FF00';
        this.add.text(game.config.width/2, game.config.height/2 - borderUISize*2, 
            `1. Speed Upgrade (${this.speedCost}pts)\nCurrent: ${this.rocketSpeed}`, menuConfig).setOrigin(0.5);

        // Shot count upgrade option (only show if not maxed)
        if (this.maxShots < 4) {
            this.add.text(game.config.width/2, game.config.height/2, 
                `2. Shot Count Upgrade (${this.shotCost}pts)\nCurrent: ${this.maxShots}`, menuConfig).setOrigin(0.5);
        } else {
            this.add.text(game.config.width/2, game.config.height/2, 
                'Maximum Rocket Count Reached!', menuConfig).setOrigin(0.5);
        }

        // Back to betting option
        menuConfig.backgroundColor = '#F3B141';
        this.add.text(game.config.width/2, game.config.height/2 + borderUISize*2, 
            'Press SPACE to return to betting', menuConfig).setOrigin(0.5);

        // Define keys
        this.keyONE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.keyTWO = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if(Phaser.Input.Keyboard.JustDown(this.keyONE) && this.points >= this.speedCost && (this.points - this.speedCost) > 0) {
            this.points -= this.speedCost;
            this.rocketSpeed += 0.5;
            this.scene.restart({ 
                points: this.points, 
                rocketSpeed: this.rocketSpeed, 
                maxShots: this.maxShots 
            });
        }
        else if(Phaser.Input.Keyboard.JustDown(this.keyTWO) && 
                this.maxShots < 4 && 
                this.points >= this.shotCost && 
                (this.points - this.shotCost) > 0) {
            this.points -= this.shotCost;
            this.maxShots += 1;
            this.scene.restart({ 
                points: this.points, 
                rocketSpeed: this.rocketSpeed, 
                maxShots: this.maxShots 
            });
        }
        else if(Phaser.Input.Keyboard.JustDown(keySPACE)) {
            this.scene.start('bettingScene', { 
                points: this.points,
                rocketSpeed: this.rocketSpeed,
                maxShots: this.maxShots 
            });
        }
    }
} 