// game.js

const config = {
  parent: 'gameContainer',
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let cursors;
let lastDirection = 'right';
let fireballs;
let spaceBar;
let nameText;
let playerName;

const game = new Phaser.Game(config);

function preload() {
  // Core world assets
  this.load.image('background',   'assets/background.png');
  this.load.image('ground',       'assets/ground.png');
  this.load.spritesheet('character', 'assets/placeholder_character_sheet.png', {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image('fireball',     'assets/fireball.png');

  // UI & preview assets
  this.load.image('body_base',     'assets/body_base.png');
  this.load.image('shirt_red',     'assets/shirt_red.png');
  this.load.image('pants_blue',    'assets/pants_blue.png');
  this.load.image('item_hat_red',  'assets/item_hat_red.png');
  this.load.image('item_potion',   'assets/item_potion.png');
  this.load.image('item_top_blue', 'assets/item_top_blue.png');
  this.load.image('item_sword',    'assets/item_sword.png');
  this.load.image('hat_overlay', 'assets/placeholder_hat.png');
  this.load.image('shirt_overlay', 'assets/placeholder_shirt.png');
  this.load.image('pants_overlay', 'assets/placeholder_pants.png');
}

function create() {
  // ── World setup ───────────────────────────────────────────────
  this.physics.world.setBounds(0, 0, 2400, 1800);
  this.cameras.main.setBounds(0, 0, 2400, 1800);
  this.add.tileSprite(0, 0, 2400, 1800, 'background').setOrigin(0);

  const ground = this.physics.add.staticGroup();
  for (let x = 0; x < 2400; x += 400) {
    ground.create(x + 200, 1784, 'ground').setScale(2).refreshBody();
  }

  // ── Player setup ───────────────────────────────────────────────
  player = this.physics.add.sprite(100, 450, 'character');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, ground);

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [ { key: 'character', frame: 4 } ],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('character', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  cursors  = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  fireballs = this.physics.add.group();

  // ── Name & camera ───────────────────────────────────────────────
  playerName = localStorage.getItem("playerName") || prompt("Enter your name:") || "Player";
  localStorage.setItem("playerName", playerName);
  nameText = this.add.text(player.x, player.y - 40, playerName, {
    fontSize: '16px',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
  this.cameras.main.startFollow(player, true, 0.08, 0.08);

  // ── Persisted skin bootstrap ─────────────────────────────────────
  let shirtColor = localStorage.getItem("shirtColor") || "red";
  let pantsColor = localStorage.getItem("pantsColor") || "blue";
  localStorage.setItem("shirtColor", shirtColor);
  localStorage.setItem("pantsColor", pantsColor);
  window.playerSkin = {
    top:    `shirt_${shirtColor}`,
    bottom: `pants_${pantsColor}`
  };

  // ── Initialize UI panels ───────────────────────────────────────
  initInventoryUI(this);
  initEquipmentUI(this);
}

function update() {
  // ── Movement & animations ──────────────────────────────────────
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
    lastDirection = 'left';
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
    lastDirection = 'right';
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  // ── Fireball attack ────────────────────────────────────────────
  if (Phaser.Input.Keyboard.JustDown(spaceBar)) {
    const fb = fireballs.create(player.x, player.y, 'fireball');
    fb.setVelocityX(lastDirection === 'left' ? -300 : 300);
    fb.body.allowGravity = false;
    setTimeout(() => fb.destroy(), 2000);
  }

  // ── Name tag follows player ─────────────────────────────────────
  nameText.setPosition(player.x, player.y - 40);
}
