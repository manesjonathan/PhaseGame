const width = window.innerWidth;
const height = window.innerHeight;

let platforms;
let bombs;
let stars;
let cursors;

let score = 0;
let scoreText;

let score2 = 0;
let scoreText2;

let gameOver = false;

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: height / 3 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/image/day.webp');
    this.load.image('ground', 'assets/image/platform.png');
    this.load.image('star', 'assets/image/star.png');
    this.load.image('bomb', 'assets/image/bomb.png');
    this.load.spritesheet('dude', 'assets/image/dude.png', { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {
    //create the environnement
    this.add.image(width / 2, height / 2, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(width / 2, height + 60, 'ground').setScale(4).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');


    //create player
    player1 = this.physics.add.sprite(100, 450, 'dude');
    player2 = this.physics.add.sprite(500, 450, 'dude');

    player1.setBounce(0.2);
    player2.setBounce(0.2);
    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    
    keys = this.input.keyboard.addKeys({
        q: Phaser.Input.Keyboard.KeyCodes.Q,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        z: Phaser.Input.Keyboard.KeyCodes.Z
    });

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player1, bombs, hitBomb, null, this);
    this.physics.add.collider(player2, bombs, hitBomb, null, this);

    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(player1, platforms);
    this.physics.add.collider(player2, platforms);
    this.physics.add.collider(player1, player2);
    this.physics.add.overlap(player1, stars, collectStar, null, this);
    this.physics.add.overlap(player2, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    scoreText2 = this.add.text(width - 200, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function update() {

    if (cursors.left.isDown) {
        player2.setVelocityX(-160);

        player2.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player2.setVelocityX(160);

        player2.anims.play('right', true);
    }
    else {
        player2.setVelocityX(0);

        player2.anims.play('turn');
    }

    if (cursors.up.isDown && player2.body.touching.down) {
        player2.setVelocityY(-400);
    }


    // player 2
    if (keys.q.isDown) {
        player1.setVelocityX(-160);

        player1.anims.play('left', true);
    }
    else if (keys.d.isDown) {
        player1.setVelocityX(160);

        player1.anims.play('right', true);
    }
    else {
        player1.setVelocityX(0);

        player1.anims.play('turn');
    }

    if (keys.z.isDown && player1.body.touching.down) {
        player1.setVelocityY(-400);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    if (player === player1) {
        score += 10;
        scoreText.setText('Score: ' + score);
        collectBomb(stars, player1);
    } else if (player === player2) {
        score2 += 10;
        scoreText2.setText('Score: ' + score2);
        collectBomb(stars, player2);
    }
}

function collectBomb(stars, player) {
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }

}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}