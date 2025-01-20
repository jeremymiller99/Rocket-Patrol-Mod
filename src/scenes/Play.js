class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0)
        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0)
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)

        // add rocket (p1)
        
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0)
        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0)
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0)
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0)

          // define keys
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

        this.p1Score = 0
        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig)
        
        // add timer display
        this.timeLeft = this.add.text(borderUISize + borderPadding + 200, borderUISize + borderPadding*2, '60', scoreConfig)
        
        // GAME OVER flag
        this.gameOver = false

        // 60-second play clock
        scoreConfig.fixedWidth = 0
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5)
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← for Menu', scoreConfig).setOrigin(0.5)
            this.add.text(game.config.width/2, game.config.height/2 + 128, 'Press (S) to Save Score', scoreConfig).setOrigin(0.5)
            this.gameOver = true
        }, null, this)

        // Add S key for score saving
        keySAVE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        
        // Initialize name input state
        this.enteringName = false
        this.playerName = ''
        this.scoreConfig = scoreConfig
    }

    update() {
        // check key input for restart / menu
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene")
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
            this.scene.restart()
        }
        
        // check for score saving
        if (this.gameOver && !this.enteringName && Phaser.Input.Keyboard.JustDown(keySAVE)) {
            this.enteringName = true
            this.nameText = this.add.text(game.config.width/2, game.config.height/2 + 160, 'Enter 5 letters: ', this.scoreConfig).setOrigin(0.5)
            this.input.keyboard.on('keydown', this.handleNameInput, this)
        }

        this.starfield.tilePositionX -= 4

        if(!this.gameOver) {
            this.p1Rocket.update()
            this.ship01.update()               
            this.ship02.update()
            this.ship03.update()
            
            // update timer display
            this.timeLeft.text = Math.ceil(this.clock.getOverallRemainingSeconds())


             // check collisions
            if(this.checkCollision(this.p1Rocket, this.ship03)) {
                this.p1Rocket.reset()
                this.shipExplode(this.ship03)
            }
            if (this.checkCollision(this.p1Rocket, this.ship02)) {
                this.p1Rocket.reset()
                this.shipExplode(this.ship02)
            }
            if (this.checkCollision(this.p1Rocket, this.ship01)) {
                this.p1Rocket.reset()
                this.shipExplode(this.ship01)
            }
        }  
    }

    handleNameInput(event) {
        if (this.enteringName) {
            if (/^[a-zA-Z0-9]$/.test(event.key) && this.playerName.length < 5) {
                this.playerName += event.key.toUpperCase()
                this.nameText.setText('Enter 5 letters: ' + this.playerName)
            }
            
            if (this.playerName.length >= 5) {
                this.enteringName = false
                this.saveScore(this.playerName, this.p1Score)
                this.input.keyboard.off('keydown', this.handleNameInput, this)
                this.nameText.setText('Score Saved!')
            }
        }
    }

    saveScore(name, score) {
        // Get existing scores from localStorage
        let scores = JSON.parse(localStorage.getItem('highScores')) || []
        
        // Add new score
        scores.push({ 
            name, 
            score,
            difficulty: game.settings.spaceshipSpeed === 3 ? 'Easy' : 'Hard'
        })
        
        // Sort scores (highest first)
        scores.sort((a, b) => b.score - a.score)
        
        // Keep only top 10 scores
        scores = scores.slice(0, 10)
        
        // Save back to localStorage
        localStorage.setItem('highScores', JSON.stringify(scores))
        
        // Update the display
        const scoresDiv = document.getElementById('scores')
        scoresDiv.innerHTML = scores
            .map((entry, index) => `
                <div class="score-entry">
                    ${index + 1}. ${entry.name} - ${entry.score}
                    <br><small>${entry.difficulty} mode</small>
                </div>
            `)
            .join('')
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
        // temporarily hide ship
        ship.alpha = 0
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x + ship.width/2, ship.y + ship.height/2, 'explosion').setOrigin(0.5, 0.5);
        boom.anims.play('explode')             // play explode animation
        boom.on('animationcomplete', () => {   // callback after anim completes
            ship.reset()                       // reset ship position
            ship.alpha = 1                     // make ship visible again
            boom.destroy()                     // remove explosion sprite
        })

        // update score
        this.p1Score += ship.points
        this.scoreLeft.text = this.p1Score         
        // play sfx
        this.sound.play('sfx-explosion')
        
    }
}