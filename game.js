const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 600,
  parent: 'gameContainer',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

let player, cursors, spaceBar, fireballs;
let otherPlayer, otherNameText, otherMessageBubble;
let playerName = prompt("Enter your name:") || "Player";
let chatMessages = [];
let isTyping = false;
let chatContainer, chatTextLines = [];
let chatInput = document.getElementById("chatInput");

const game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("fireball", "assets/fireball.png");
  this.load.spritesheet("character", "assets/character.png", {
    frameWidth: 32,
    frameHeight: 48
  });
}

function create() {
  const scene = this;

  this.add.tileSprite(0, 0, 2400, 1800, "background").setOrigin(0);
  this.physics.world.setBounds(0, 0, 2400, 1800);
  this.cameras.main.setBounds(0, 0, 2400, 1800);

  const ground = this.physics.add.staticGroup();
  for (let x = 0; x < 2400; x += 400) {
    ground.create(x + 200, 1784, "ground").setScale(2).refreshBody();
  }

  player = this.physics.add.sprite(100, 450, "character");
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  this.cameras.main.startFollow(player, true, 0.08, 0.08);
  this.physics.add.collider(player, ground);

  this.anims.create({ key: "left", frames: this.anims.generateFrameNumbers("character", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
  this.anims.create({ key: "turn", frames: [ { key: "character", frame: 4 } ], frameRate: 20 });
  this.anims.create({ key: "right", frames: this.anims.generateFrameNumbers("character", { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  fireballs = this.physics.add.group();

  // Simulated other player
  otherPlayer = this.physics.add.sprite(300, 450, "character");
  otherPlayer.setBounce(0.1);
  otherPlayer.setCollideWorldBounds(true);
  this.physics.add.collider(otherPlayer, ground);
  otherNameText = this.add.text(300, 410, "OtherPlayer", {
    fontSize: "14px", fill: "#fff", stroke: "#000", strokeThickness: 2
  }).setOrigin(0.5);
  otherMessageBubble = this.add.text(300, 390, "Hello!", {
    fontSize: "14px",
    fill: "#000",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: { x: 6, y: 4 }
  }).setOrigin(0.5).setAlpha(0);

  scene.tweens.add({
    targets: otherMessageBubble,
    alpha: 1,
    y: 380,
    ease: "Power1",
    duration: 400,
    yoyo: true,
    hold: 2500
  });

  // In-canvas chat panel
  chatContainer = this.add.container(50, 50).setScrollFactor(0);
  const bg = this.add.rectangle(0, 0, 360, 200, 0x000000, 0.7).setOrigin(0);
  bg.setStrokeStyle(2, 0xffffff);
  bg.setInteractive({ draggable: true });
  bg.on("drag", (pointer, dragX, dragY) => {
    chatContainer.setPosition(dragX, dragY);
  });
  chatContainer.add(bg);

  for (let i = 0; i < 8; i++) {
    const line = this.add.text(10, 10 + i * 20, "", {
      fontSize: "14px", fill: "#fff", wordWrap: { width: 340 }
    });
    chatContainer.add(line);
    chatTextLines.push(line);
  }

  chatInput.addEventListener("focus", () => isTyping = true);
  chatInput.addEventListener("blur", () => isTyping = false);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const msg = chatInput.value.trim();
      if (msg) {
        const full = `${playerName}: ${msg}`;
        chatMessages.push(full);
        chatMessages = chatMessages.slice(-8);
        updateChat();
        showOtherPlayerReply(scene, "Nice!");
        chatInput.value = "";
      }
    }
  });

  updateChat();
}

function update() {
  if (!isTyping) {
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("right", true);
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
  }

  otherNameText.setPosition(otherPlayer.x, otherPlayer.y - 40);
  otherMessageBubble.setPosition(otherPlayer.x, otherPlayer.y - 60);
}

function updateChat() {
  for (let i = 0; i < chatTextLines.length; i++) {
    chatTextLines[i].setText(chatMessages[i] || "");
  }
}

function showOtherPlayerReply(scene, text) {
  otherMessageBubble.setText(text);
  otherMessageBubble.setAlpha(0);
  otherMessageBubble.y = otherPlayer.y - 60;
  scene.tweens.add({
    targets: otherMessageBubble,
    alpha: 1,
    y: otherPlayer.y - 70,
    ease: "Power1",
    duration: 300,
    hold: 2500,
    yoyo: true
  });
}
