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

let player, bodyLayer, shirtLayer, pantsLayer;
let otherPlayer;
let playerNameText, otherNameText;
let cursors, spaceBar, fireballs, inventoryKey;
let inventoryContainer, inventoryOpen = false;
let items = ["item_sword", "item_potion", "item_shirt"];

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

  ["sword", "potion", "shirt"].forEach(item =>
    this.load.image(`item_${item}`, `assets/item_${item}.png`)
  );
}

function create() {
  const scene = this;

  let playerName = localStorage.getItem("playerName") || prompt("Enter your name:") || "Player";
  localStorage.setItem("playerName", playerName);

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

  player = this.physics.add.sprite(100, 450, "body_base");
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.checkCollision.left = false;
  player.body.checkCollision.right = false;

  playerNameText = this.add.text(0, 0, playerName, {
    fontSize: "14px", fill: "#fff", stroke: "#000", strokeThickness: 2
  }).setOrigin(0.5).setScrollFactor(1);

  // Outfit layers
  bodyLayer = this.add.sprite(0, 0, "body_base").setOrigin(0.5);
  shirtLayer = this.add.sprite(0, 0, `shirt_${shirtColor}`).setOrigin(0.5);
  pantsLayer = this.add.sprite(0, 0, `pants_${pantsColor}`).setOrigin(0.5);

  this.anims.create({ key: "walk", frames: this.anims.generateFrameNumbers("body_base", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
  this.anims.create({ key: "turn", frames: [ { key: "body_base", frame: 4 } ], frameRate: 20 });

  ["shirt", "pants"].forEach(type => {
    ["red", "blue", "green", "black", "grey"].forEach(c => {
      const key = `${type}_${c}`;
      if (this.textures.exists(key)) {
        this.anims.create({ key: `${key}_walk`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: `${key}_turn`, frames: [ { key: key, frame: 4 } ], frameRate: 20 });
      }
    });
  });

  otherPlayer = this.physics.add.sprite(300, 450, "body_base");
  otherPlayer.setBounce(0.1);
  otherPlayer.setCollideWorldBounds(true);
  this.physics.add.collider(otherPlayer, ground);
  otherNameText = this.add.text(0, 0, "OtherPlayer", {
    fontSize: "14px", fill: "#fff", stroke: "#000", strokeThickness: 2
  }).setOrigin(0.5).setScrollFactor(1);

  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, otherPlayer);

  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  fireballs = this.physics.add.group();

  this.cameras.main.startFollow(player, true, 0.08, 0.08);

  // Inventory panel
  inventoryContainer = this.add.container(100, 100).setScrollFactor(0).setDepth(10).setVisible(false);

  const bg = this.add.rectangle(0, 0, 200, 200, 0x222222, 0.9).setOrigin(0);
  inventoryContainer.add(bg);

  const closeText = this.add.text(180, 0, "✖", {
    fontSize: "16px", fill: "#fff", backgroundColor: "#900", padding: { left: 4, right: 4 }
  }).setOrigin(0).setInteractive();

  closeText.on("pointerdown", () => {
    inventoryContainer.setVisible(false);
    inventoryOpen = false;
  });

  inventoryContainer.add(closeText);

  items.forEach((key, i) => {
    const icon = this.add.image(20 + (i % 4) * 45, 40 + Math.floor(i / 4) * 45, key).setOrigin(0).setScale(1.2);
    inventoryContainer.add(icon);
  });

  this.input.setDraggable(inventoryContainer);
  this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === inventoryContainer) {
      inventoryContainer.setPosition(dragX, dragY);
    }
  });
}

function update() {
  if (Phaser.Input.Keyboard.JustDown(inventoryKey)) {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
  }

  let moving = false;
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    moving = true;
    [player, bodyLayer, shirtLayer, pantsLayer].forEach(s => s.flipX = true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    moving = true;
    [player, bodyLayer, shirtLayer, pantsLayer].forEach(s => s.flipX = false);
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

  // Sync clothing and name tag positions
  const { x, y } = player.body.position;
  const centerX = x + player.width / 2;
  const centerY = y + player.height / 2;

  [bodyLayer, shirtLayer, pantsLayer].forEach(layer => {
    layer.setPosition(centerX, centerY);
  });

  playerNameText.setPosition(centerX, y - 10);
  otherNameText.setPosition(otherPlayer.x, otherPlayer.y - 40);
}
