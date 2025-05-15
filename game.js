const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 600,
  parent: 'gameContainer',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 500 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: { preload, create, update }
};

let player, otherPlayer;
let cursors, spaceBar, fireballs;
let playerNameText, otherNameText;
let playerName = '';
let playerSkin = '';
let selectedSpriteKey = '';
let characterOptions = ['blue', 'green', 'red'];
let selectorMode = false;
let selectorSprites = [];

const game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("fireball", "assets/fireball.png");

  characterOptions.forEach(color => {
    this.load.spritesheet(`character_${color}`, `assets/character_${color}.png`, {
      frameWidth: 32,
      frameHeight: 48
    });
  });
}

function create() {
  playerName = localStorage.getItem("playerName") || prompt("Enter your name:") || "Player";
  playerSkin = localStorage.getItem("playerSkin");

  if (!playerSkin) {
    selectorMode = true;
    this.add.text(100, 50, "Choose Your Character", { fontSize: '20px', fill: '#fff' });

    characterOptions.forEach((color, i) => {
      const sprite = this.add.sprite(150 + i * 150, 200, `character_${color}`, 4).setInteractive();
      this.add.text(150 + i * 150, 250, color.toUpperCase(), { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
      sprite.on('pointerdown', () => {
        localStorage.setItem("playerSkin", color);
        playerSkin = color;
        this.scene.restart();  // reload scene with new skin
      });
      selectorSprites.push(sprite);
    });
    return;
  }

  // World setup
  this.add.tileSprite(0, 0, 2400, 1800, "background").setOrigin(0);
  this.physics.world.setBounds(0, 0, 2400, 1800);
  this.cameras.main.setBounds(0, 0, 2400, 1800);

  const ground = this.physics.add.staticGroup();
  for (let x = 0; x < 2400; x += 400) {
    ground.create(x + 200, 1784, "ground").setScale(2).refreshBody();
  }

  selectedSpriteKey = `character_${playerSkin}`;

  // Player setup
  player = this.physics.add.sprite(100, 450, selectedSpriteKey);
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.checkCollision.left = false;
  player.body.checkCollision.right = false;

  playerNameText = this.add.text(player.x, player.y - 40, playerName, {
    fontSize: "14px", fill: "#fff", stroke: "#000", strokeThickness: 2
  }).setOrigin(0.5);

  // Other player
  otherPlayer = this.physics.add.sprite(300, 450, "character_red");
  otherPlayer.setBounce(0.1);
  otherPlayer.setCollideWorldBounds(true);
  otherPlayer.body.checkCollision.left = false;
  otherPlayer.body.checkCollision.right = false;

  otherNameText = this.add.text(otherPlayer.x, otherPlayer.y - 40, "OtherPlayer", {
    fontSize: "14px", fill: "#fff", stroke: "#000", strokeThickness: 2
  }).setOrigin(0.5);

  this.physics.add.collider(player, ground);
  this.physics.add.collider(otherPlayer, ground);
  this.physics.add.collider(player, otherPlayer);

  this.anims.create({
    key: "left", frames: this.anims.generateFrameNumbers(selectedSpriteKey, { start: 0, end: 3 }),
    frameRate: 10, repeat: -1
  });
  this.anims.create({
    key: "turn", frames: [ { key: selectedSpriteKey, frame: 4 } ],
    frameRate: 20
  });
  this.anims.create({
    key: "right", frames: this.anims.generateFrameNumbers(selectedSpriteKey, { start: 5, end: 8 }),
    frameRate: 10, repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  fireballs = this.physics.add.group();

  this.cameras.main.startFollow(player, true, 0.08, 0.08);
}

function update() {
  if (selectorMode) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
    player.flipX = false;
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  if (Phaser.Input.Keyboard.JustDown(spaceBar)) {
    const fb = fireballs.create(player.x, player.y, "fireball");
    fb.setVelocityX(player.flipX ? -300 : 300);
    fb.body.allowGravity = false;
    setTimeout(() => fb.destroy(), 2000);
  }

  playerNameText.setPosition(player.x, player.y - 40);
  otherNameText.setPosition(otherPlayer.x, otherPlayer.y - 40);
}
