let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: 'gameContainer',
    scene: [Boot, Menu, Shop, Betting, Play],
    audio: {
        disableWebAudio: false
    }
};

let game = new Phaser.Game(config);

// reserve keyboard bindings
let keyLEFT, keyRIGHT, keySPACE;

// set UI sizes
let borderUISize = game.config.height / 15
let borderPadding = borderUISize / 3


