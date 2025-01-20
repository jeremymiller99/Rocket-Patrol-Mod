let config = {
    width: 640,
    height: 480,
    type: Phaser.AUTO,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config);

// reserve keyboard bindings
let keyFIRE, keyRESET, keyLEFT, keyRIGHT, keySAVE

// set UI sizes
let borderUISize = game.config.height / 15
let borderPadding = borderUISize / 3

