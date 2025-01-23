class Spaceship extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, pointValue, speed) {
        super(scene, x, y, texture, frame, pointValue)
        scene.add.existing(this)
        this.points = pointValue
        this.moveSpeed = speed
        this.isExploding = false
        this.laps = 0
    }

    update() {
        if (!this.isExploding) {
            this.x -= this.moveSpeed
        }
    }

    reset() {
        this.x = game.config.width
        this.isExploding = false
    }

    addLap() {
        if (!this.isExploding) {
            this.laps += 1
        }
    }
}
