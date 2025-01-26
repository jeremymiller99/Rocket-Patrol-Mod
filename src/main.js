// Jeremy Miller
// Rocket Patrol Casino
// 25 hours
// 1pt: Randomize each player speed at start of each play
// 3pt: New title screen
// S-tier (16 pts): Changed the gameplay by implementing a new scoring system. The game now revolves around wagering on a certain ship to win the race, instead of shooting the most ships.
// You start with $100, the goal is to get to $1000, but you can continue after getting to $1000. Before each race, you choose how many ships you want (2-5), and the multiplier on you wager
// is the amount of ships you choose. So you can wager $20 with 5 ships to win $100. But more ships is harder to win, so you might want to do smaller wagers to save up for upgrades first. 
// There is an in game shop where you can use $ to increase the speed of the rockets, as well as introduce more rockets so you can increase your fire rate.
// I also made the html page look like an arcade machine.
// Also added a live scoreboard during the race that shows the current standings of all the ships as well the one you bet on to help you keep track of whats going on.
// Added multiple new scenes, like Boot.js for loading assets, Shop.js for the shop, and Betting.js for the betting screen.

// I had a lot of fun making this game, and with all of the new features I think it is worth the full 20 points. Along with Nathan's code, I utilized Cursor, an IDE that has AI integrated to help me with some of the coding. 
// I found it most useful in diagnosing problems in the code. Cursor allows you to ask questions about the entire codebase without having to copy past code, 
// so you can ask general questions and it will scan all files. 
// The solutions generated were not always correct, but for many issues I encountered, I was able to use this tool to understand what was wrong and fix it myself.
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
let keyLEFT, keyRIGHT, keyUP, keyDOWN, keySPACE;

// set UI sizes
let borderUISize = game.config.height / 15
let borderPadding = borderUISize / 3


