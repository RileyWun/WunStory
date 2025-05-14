const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 500 }, debug: false }
  },
  scene: { preload, create, update }
};

let player, cursors, spaceBar;
let playerName = prompt("Enter your character name:") || "Player";
let lastDirection = 'right';
let fireballs;
let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
let chatTexts = [];
let currentBubble = null;
let isTyping = false;
let typingIndicator = null;
let typingTimeout = null;
let replyTo = null;

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('ground', 'assets/ground.png');
  this.load.image('fireball', 'assets/fireball.png');
  this.load.spritesheet('character', 'assets/character.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  const scene = this;
  this.physics.world.setBounds(0, 0, 2400, 1800);
  this.cameras.main.setBounds(0, 0, 2400, 1800);
  this.add.tileSprite(0, 0, 2400, 1800, 'background').setOrigin(0);

  const ground = this.physics.add.staticGroup();
  for (let x = 0; x < 2400; x += 400) {
    ground.create(x + 200, 1784, 'ground').setScale(2).refreshBody();
  }

  player = this.physics.add.sprite(100, 450, 'character');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  this.cameras.main.startFollow(player, true, 0.08, 0.08);
  player.nameText = this.add.text(player.x, player.y - 40, playerName, {
    fontSize: '16px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
  }).setOrigin(0.5);

  this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
  this.anims.create({ key: 'turn', frames: [ { key: 'character', frame: 4 } ], frameRate: 20 });
  this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('character', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

  this.physics.add.collider(player, ground);
  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  fireballs = this.physics.add.group();

  for (let i = 0; i < 5; i++) {
    const text = this.add.text(10, 10 + i * 20, '', {
      fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 2
    }).setScrollFactor(0).setInteractive();
    text.on('pointerdown', () => {
      replyTo = text.text;
      document.getElementById('replyLabel').innerText = 'Replying to: ' + replyTo;
    });
    chatTexts.push(text);
  }

  scene.showBubble = function (text) {
    if (currentBubble) currentBubble.destroy();
    currentBubble = scene.add.text(player.x, player.y - 80, text, {
      fontSize: '14px',
      fill: '#000000',
      backgroundColor: 'rgba(255,255,255,0.8)',
      padding: { x: 5, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0);
    scene.time.delayedCall(7000, () => {
      if (currentBubble) {
        currentBubble.destroy();
        currentBubble = null;
      }
    });
  };

  function showTypingIndicator() {
    if (!typingIndicator) {
      typingIndicator = scene.add.text(player.x, player.y - 100, `${playerName} is typing...`, {
        fontSize: '12px',
        fill: '#000000',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: { x: 5, y: 3 }
      }).setOrigin(0.5).setScrollFactor(0);
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      if (typingIndicator) {
        typingIndicator.destroy();
        typingIndicator = null;
      }
    }, 3000);
  }

  const chatInput = document.getElementById('chatInput');
  chatInput.addEventListener('focus', () => { isTyping = true; });
  chatInput.addEventListener('blur', () => { isTyping = false; });
  chatInput.addEventListener('input', () => { showTypingIndicator(); });
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const msg = chatInput.value.trim();
      if (msg) {
        const full = replyTo ? `↳ ${replyTo}\n${playerName}: ${msg}` : `${playerName}: ${msg}`;
        chatMessages.push({ text: full, time: Date.now() });
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
        chatInput.value = '';
        replyTo = null;
        document.getElementById('replyLabel').innerText = '';
        updateChat();
        scene.showBubble(full);
      }
    }
  });

  const emojiPicker = document.getElementById('emojiPicker');
  emojiPicker.querySelectorAll('.emoji').forEach(el => {
    el.addEventListener('click', () => {
      const cursorPos = chatInput.selectionStart;
      const textBefore = chatInput.value.substring(0, cursorPos);
      const textAfter = chatInput.value.substring(cursorPos);
      chatInput.value = textBefore + el.textContent + textAfter;
      chatInput.focus();
      chatInput.selectionEnd = cursorPos + el.textContent.length;
      showTypingIndicator();
    });
  });

  updateChat();
}

function update() {
  if (!isTyping) {
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

    if (Phaser.Input.Keyboard.JustDown(spaceBar)) {
      const fireball = fireballs.create(player.x, player.y, 'fireball');
      fireball.setVelocityX(lastDirection === 'left' ? -300 : 300);
      fireball.body.allowGravity = false;
      setTimeout(() => fireball.destroy(), 2000);
    }
  }

  const now = Date.now();
  chatMessages = chatMessages.filter(m => now - m.time < 30000);
  localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  updateChat();

  if (currentBubble) currentBubble.setPosition(player.x, player.y - 80);
  if (typingIndicator) typingIndicator.setPosition(player.x, player.y - 100);
  player.nameText.setPosition(player.x, player.y - 40);
}

function updateChat() {
  const recent = chatMessages.slice(-5);
  for (let i = 0; i < chatTexts.length; i++) {
    chatTexts[i].setText(recent[i] ? recent[i].text : '');
  }
}
