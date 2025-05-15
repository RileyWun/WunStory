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

let player, bodyLayer, shirtLayer, pantsLayer;
let otherPlayer;
let playerNameText, otherNameText;
let cursors, spaceBar, fireballs;
let selectorMode = false;
const characterOptions = ['blue', 'green', 'red'];
let frameIndex = 4;

const game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("fireball", "assets/fireball.png");

  this.load.spritesheet("body_base", "assets/body_base.png", { frameWidth: 32, frameHeight: 48 });

  ["red", "blue", "green"].forEach(c =>
    this.load.spritesheet(`shirt_${c}`, `assets/shirt_${c}.png`, { frameWidth: 32, frameHeight: 48 })
  );

  ["blue", "black", "grey"].forEach(c =>
    this.load.spritesheet(`pants_${c}`, `assets/pants_${c}.png`, { frameWidth: 32, frameHeight: 48 })
  );
}

function create() {
  const scene = this;

  let playerName = localStorage.getItem("playerName");
  if (!playerName) {
    playerName = prompt("Enter your name:") || "Player";
    localStorage.setItem("playerName", playerName);
  }

  let shirtColor = localStorage.getItem("shirtColor") || "red";
  let pantsColor = localStorage.getItem("pantsColor") || "blue";
  localStorage.setItem("shirtColor", shirtColor);
  localStorage.setItem("pantsColor", pantsColor);

  this.add.tileSprite(0, 0, 2400, 1800, "background").setOrigin(0);
  this.physics.world.setBounds(0, 0, 2400, 1800);
  this.cameras.main.setBounds(0, 0, 2400, 1800);

  const ground = this.physics.add.staticGroup();
  for (let x = 0; x < 2400; x += 400) {
    ground.create(x + 200, 1784, "ground").setScale(2).refreshBody();
  }

  // Base physics sprite
  player = this.physics.add.sprite(100, 450, "body_base");
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.checkCollision.left = false;
  player.body.checkCollision.right = false;

  // Name tag
  playerNameText = this.add.text(player.x, player.y - 40, playerName, {
    fontSize: "14px", fill: "#fff", stroke: "#000", strokeThickness: 2
  }).setOrigin(0.5).setScrollFactor(1);

  // Outfit layers follow the base
  bodyLayer = this.add.sprite(player.x, player.y, "body_base").setOrigin(0.5);
  shirtLayer = this.add.sprite(player.x, player.y, `shirt_${shirtColor}`).setOrigin(0.5);
  pantsLayer = this.add.sprite(player.x, player.y, `pants_${pantsColor}`).setOrigin(0.5);

  // Sync animation frames
  scene.anims.create({
    key: "walk",
    frames: scene.anims.generateFrameNumbers("body_base", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: "turn",
    frames: [ { key: "body_base", frame: 4 } ],
    frameRate: 20
  });

  ["shirt", "pants"].forEach(type => {
    ["red", "blue", "green", "black", "grey"].forEach(c => {
      if (scene.textures.exists(`${type}_${c}`)) {
        scene.anims.create({
          key: `${type}_${c}_walk`,
          frames: scene.anims.generateFrameNumbers(`${type}_${c}`, { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
        });
        scene.anims.create({
          key: `${type}_${c}_turn`,
          frames: [ { key: `${type}_${c}`, frame: 4 } ],
          frameRate: 20
        });
      }
    });
  });

  // Simulated other player
  otherPlayer = this.physics.add.sprite(300, 450, "body_base");
  otherPlayer.setBounce(0.1);
  otherPlayer.setCollideWorldBounds(true);
  this.physics.add.collider(otherPlayer, ground);
  otherNameText = this.add.text(300, 410, "OtherPlayer", {
    fontSize: "14px", fill: "#fff", stroke: "#000", strokeThickness: 2
  }).setOrigin(0.5).setScrollFactor(1);

  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, otherPlayer);

  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  fireballs = this.physics.add.group();

  this.cameras.main.startFollow(player, true, 0.08, 0.08);
}

function update() {
  if (selectorMode) return;

  let moving = false;
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    moving = true;
    player.flipX = true;
    bodyLayer.flipX = shirtLayer.flipX = pantsLayer.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    moving = true;
    player.flipX = false;
    bodyLayer.flipX = shirtLayer.flipX = pantsLayer.flipX = false;
  } else {
    player.setVelocityX(0);
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

  // Sync layer positions
const { x, y } = player.body.position;
[bodyLayer, shirtLayer, pantsLayer].forEach(layer => {
  layer.setPosition(x + player.width / 2, y + player.height / 2);
});

  // Animate layers
  const shirtKey = localStorage.getItem("shirtColor");
  const pantsKey = localStorage.getItem("pantsColor");

  if (moving) {
    bodyLayer.anims.play("walk", true);
    shirtLayer.anims.play(`shirt_${shirtKey}_walk`, true);
    pantsLayer.anims.play(`pants_${pantsKey}_walk`, true);
  } else {
    bodyLayer.anims.play("turn");
    shirtLayer.anims.play(`shirt_${shirtKey}_turn`);
    pantsLayer.anims.play(`pants_${pantsKey}_turn`);
  }

  // Update name tags
  playerNameText.setPosition(player.x, player.y - 40);
  otherNameText.setPosition(otherPlayer.x, otherPlayer.y - 40);
}
