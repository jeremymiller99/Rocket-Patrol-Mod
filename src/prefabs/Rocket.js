// Rocket prefab
class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
      super(scene, x, y, texture, frame)
  
      // add object to existing scene
      scene.add.existing(this)
      this.isFiring = false
      this.moveSpeed = 2
      this.sfxShot = scene.sound.add('sfx-shot')
    }

    update() {
        if(!this.isFiring) {
            if(keyLEFT.isDown && this.x >= borderUISize + this.width) {
                this.x -= this.moveSpeed
            } else if (keyRIGHT.isDown && this.x <= game.config.width - borderUISize - this.width) {
                this.x += this.moveSpeed
            }
        }
        // Only allow firing if the rocket is at the bottom of the screen
        if(Phaser.Input.Keyboard.JustDown(keyFIRE) && this.y == game.config.height - borderUISize - borderPadding) {
            this.isFiring = true
            this.sfxShot.play()
        }
        if(this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
            this.y -= this.moveSpeed
        }
        if(this.y <= borderUISize * 3 + borderPadding) {
            this.reset()
        }
    }

    reset() {
        this.isFiring = false
        this.y = game.config.height - borderUISize - borderPadding
    }
  }