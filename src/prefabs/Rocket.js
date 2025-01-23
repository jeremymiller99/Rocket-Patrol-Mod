// Rocket prefab
class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
      super(scene, x, y, texture, frame)
  
      // add object to existing scene
      scene.add.existing(this)
      this.isFiring = false
      this.isActive = false  // New property to track if this rocket is the active one
      this.moveSpeed = scene.rocketSpeed || 2
      this.sfxShot = scene.sound.add('sfx-shot')
      this.setAlpha(0.5)  // Start inactive rockets as semi-transparent
    }

    update() {
        // Only allow movement and firing if this is the active rocket
        if(this.isActive) {
            if(!this.isFiring) {
                if(keyLEFT.isDown && this.x >= borderUISize + this.width) {
                    this.x -= this.moveSpeed
                } else if (keyRIGHT.isDown && this.x <= game.config.width - borderUISize - this.width) {
                    this.x += this.moveSpeed
                }
            }
            if(Phaser.Input.Keyboard.JustDown(keyF) && 
               this.y == game.config.height - borderUISize - borderPadding) {
                this.isFiring = true
                this.sfxShot.play()
                // Activate next rocket immediately after firing
                this.scene.activateNextRocket()
            }
        }
        if(this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
            this.y -= this.moveSpeed
        }
        if(this.y <= borderUISize * 3 + borderPadding) {
            this.reset()
        }
    }

    setActive(active) {
        this.isActive = active
        this.setAlpha(active ? 1 : 0.5)
    }

    reset() {
        this.isFiring = false
        this.y = game.config.height - borderUISize - borderPadding
    }
  }