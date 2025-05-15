const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 800,
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
let playerNameText, otherNameText;
let cursors, spaceBar, fireballs;
let playerName, playerSkin;
let selectorMode = false;
let selectorSprites = [];
const characterOptions = ['blue', 'green', 'red'];

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
  // Load name and skin if already chosen
  playerName = localStorage.getItem("playerName");
  playerSkin = localStorage.getItem("playerSkin");

  if (!playerName) {
    playerName = prompt("Enter your name:") || "Player";
    localStorage.setItem("playerName", playerName);
  }

  if (!playerSkin) {
    selectorMode = true;
    this.add.text(100, 50, "Choose Your Character", { fontSize: '20px', fill: '#fff' });

    characterOptions.forEach((color, i) => {
      const sprite = this.add.sprite(150 + i * 150, 200, `character_${color}`, 4).setInteractive();
      this.add.text(150 + i * 150, 250, color.toUpperCase(), { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
      sprite.on('pointerdown', () => {
        localStorage.setItem("playerSkin", color);
        selectorMode = false;
        this.scene.restart();
      });
      selectorSprites.push(sprite);
    });
    return;
  }

  const spriteKey = `character_${playerSkin}`;

  this.add.tileSprite(0, 0, 2400, 1800, "background").setOrigin(0);
  this.physics.world.setBounds(0, 0, 2400, 1800);
  this.cameras.main.setBounds(0, 0, 2400, 1800);

  const ground = this.physics.add.staticGroup();
  for (let x = 0; x < 2400; x += 400) {
    ground.create(x + 200, 1784, "ground").setScale(2).refreshBody();
  }

  // Player setup
  player = this.physics.add.sprite(100, 450, spriteKey);
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.checkCollision.left = false;
  player.body.checkCollision.right = false;

  playerNameText = this.add.text(0, 0, playerName, {
    fontSize: "14px",
    fill: "#fff",
    stroke: "#000",
    strokeThickness: 2
  }).setOrigin(0.5).setScrollFactor(1);

  // Simulated other player
  otherPlayer = this.physics.add.sprite(300, 450, "character_red");
  otherPlayer.setBounce(0.1);
  otherPlayer.setCollideWorldBounds(true);
  otherPlayer.body.checkCollision.left = false;
  otherPlayer.body.checkCollision.right = false;

  otherNameText = this.add.text(0, 0, "OtherPlayer", {
    fontSize: "14px",
    fill: "#fff",
    stroke: "#000",
    strokeThickness: 2
  }).setOrigin(0.5).setScrollFactor(1);

  this.physics.add.collider(player, ground);
  this.physics.add.collider(otherPlayer, ground);
  this.physics.add.collider(player, otherPlayer);

  // Animations
  this.anims.create({
    key: "left", frames: this.anims.generateFrameNumbers(spriteKey, { start: 0, end: 3 }),
    frameRate: 10, repeat: -1
  });
  this.anims.create({
    key: "turn", frames: [ { key: spriteKey, frame: 4 } ],
    frameRate: 20
  });
  this.anims.create({
    key: "right", frames: this.anims.generateFrameNumbers(spriteKey, { start: 5, end: 8 }),
    frameRate: 10, repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  fireballs = this.physics.add.group();

  this.cameras.main.startFollow(player, true, 0.08, 0.08);
}

function update() {
  if (selectorMode) return;

  // Movement and animation
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

  // Name tag tracking
  playerNameText.setPosition(player.x, player.y - 40);
  otherNameText.setPosition(otherPlayer.x, otherPlayer.y - 40);
}
