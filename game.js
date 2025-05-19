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
  scene: { preload, create, update }
};

let player, cursors, spaceBar, fireballs;
let nameText, playerName;

const game = new Phaser.Game(config);

function preload() {
  // World
  this.load.image('background', 'assets/background.png');
  this.load.image('ground',     'assets/ground.png');
  this.load.spritesheet('character','assets/placeholder_character_sheet.png',{
    frameWidth: 32, frameHeight: 48
  });
  this.load.image('fireball', 'assets/fireball.png');

  // Inventory items
  this.load.image('item_hat_red',   'assets/item_hat_red.png');
  this.load.image('item_potion',    'assets/item_potion.png');
  this.load.image('item_top_blue',  'assets/item_top_blue.png');
  this.load.image('item_sword',     'assets/item_sword.png');
}

function create() {
  // ── WORLD ──────────────────────────────────────────────────────
  this.physics.world.setBounds(0,0,2400,1800);
  this.cameras.main.setBounds(0,0,2400,1800);
  this.add.tileSprite(0,0,2400,1800,'background').setOrigin(0);

  const ground = this.physics.add.staticGroup();
  for (let x=0; x<2400; x+=400) {
    ground.create(x+200,1784,'ground').setScale(2).refreshBody();
  }

  // ── PLAYER ─────────────────────────────────────────────────────
  player = this.physics.add.sprite(100,450,'character',4);
  player.setBounce(0.1).setCollideWorldBounds(true);
  this.physics.add.collider(player, ground);

  this.anims.create({
    key:'left',
    frames:this.anims.generateFrameNumbers('character',{start:0,end:3}),
    frameRate:10, repeat:-1
  });
  this.anims.create({
    key:'turn',
    frames:[{ key:'character', frame:4 }],
    frameRate:20
  });
  this.anims.create({
    key:'right',
    frames:this.anims.generateFrameNumbers('character',{start:5,end:8}),
    frameRate:10, repeat:-1
  });

  cursors  = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  fireballs= this.physics.add.group();

  // ── NAME & CAMERA ──────────────────────────────────────────────
  playerName = localStorage.getItem('playerName') 
               || prompt('Enter your name:') 
               || 'Player';
  localStorage.setItem('playerName', playerName);

  nameText = this.add.text(player.x, player.y-40, playerName, {
    fontSize:'16px', fill:'#fff',
    stroke:'#000', strokeThickness:3
  }).setOrigin(0.5);

  this.cameras.main.startFollow(player, true, 0.08, 0.08);

  // ── SEED SKIN ───────────────────────────────────────────────────
  let shirtColor = localStorage.getItem('shirtColor') || 'red';
  let pantsColor = localStorage.getItem('pantsColor') || 'blue';
  localStorage.setItem('shirtColor', shirtColor);
  localStorage.setItem('pantsColor', pantsColor);

  window.playerSkin = {
    top:    `item_top_${shirtColor}`,
    bottom: `item_top_${pantsColor}`  // reuse top for pants placeholder
  };

  // ── UI PANELS ───────────────────────────────────────────────────
  initInventoryUI(this);
  initEquipmentUI(this);
}

function update() {
  // Movement
  if (cursors.left.isDown) {
    player.setVelocityX(-160).anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160).anims.play('right', true);
  } else {
    player.setVelocityX(0).anims.play('turn');
  }
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  // Fireballs
  if (Phaser.Input.Keyboard.JustDown(spaceBar)) {
    const fb = fireballs.create(player.x, player.y, 'fireball');
    fb.setVelocityX(player.flipX ? -300 : 300);
    fb.body.allowGravity = false;
    setTimeout(() => fb.destroy(), 2000);
  }

  // Name tag follows
  nameText.setPosition(player.x, player.y-40);
}

// ────────────────────────────────────────────────────────────────────
// INVENTORY PANEL
function initInventoryUI(scene) {
  const X=100, Y=120, W=200, H=200;
  let open = false;

  // Content container
  const content = scene.add.container(X, Y+20).setScrollFactor(0).setDepth(10).setVisible(false);
  content.add(scene.add.rectangle(0,0,W,H,0x222222,0.95).setOrigin(0));

  // Items
  const items = [
    { key:'item_hat_red',  type:'hat'    },
    { key:'item_potion',   type:'potion' },
    { key:'item_top_blue', type:'top'    },
    { key:'item_sword',    type:'weapon' }
  ];
  items.forEach((it,i)=>{
    const ix = 10+(i%4)*45, iy=30+Math.floor(i/4)*45;
    const spr = scene.add.image(ix,iy,it.key).setOrigin(0).setScale(1.2)
      .setInteractive({draggable:true, useHandCursor:true})
      .setScrollFactor(0);
    spr.itemKey=it.key; spr.itemType=it.type;

    scene.input.setDraggable(spr);
    spr.on('drag', (p, dx, dy) => {
      spr.x = dx - content.x;
      spr.y = dy - content.y;
    });
    spr.on('dragstart',()=>spr.setScale(1.3));
    spr.on('dragend',()=>spr.setScale(1.2));

    // Double-click
    let last=0;
    spr.on('pointerdown',()=>{
      const now=Date.now();
      if(now-last<300){
        if(it.type==='potion') console.log('Used',it.key);
        else window.applyEquip(it.key,it.type);
      }
      last=now;
    });

    content.add(spr);
  });

  // Title bar
  const bar = scene.add.rectangle(X,Y,W,20,0x111111)
    .setOrigin(0).setDepth(11).setScrollFactor(0)
    .setInteractive({useHandCursor:true}).setVisible(false);
  scene.input.setDraggable(bar);

  // Close
  const closeBtn = scene.add.text(X+W-20,Y,'✖',{fontSize:'14px',fill:'#fff',backgroundColor:'#900',padding:{l:4,r:4,t:1,b:1}})
    .setOrigin(0).setDepth(11).setScrollFactor(0).setInteractive({useHandCursor:true}).setVisible(false);
  closeBtn.on('pointerdown',()=>{
    open=false; content.setVisible(false); bar.setVisible(false); closeBtn.setVisible(false);
  });

  // Drag logic
  let dx=0,dy=0;
  bar.on('dragstart',(p, dX, dY)=>{ dx=dX-content.x; dy=dY-content.y; });
  scene.input.on('drag',(p, o, dX, dY)=>{
    if(o===bar){
      const nx=dX-dx, ny=dY-dy;
      content.setPosition(nx,ny+20);
      bar.setPosition(nx,ny);
      closeBtn.setPosition(nx+W-20,ny);
    }
  });

  // Toggle I
  scene.input.keyboard.on('keydown-I',()=>{
    open=!open;
    content.setVisible(open);
    bar.setVisible(open);
    closeBtn.setVisible(open);
  });
}

// ────────────────────────────────────────────────────────────────────
// EQUIPMENT PANEL
function initEquipmentUI(scene) {
  const X=350, Y=120, W=260, H=320;
  let open=false;

  const content = scene.add.container(X,Y+20).setScrollFactor(0).setDepth(10).setVisible(false);
  content.add(scene.add.rectangle(0,0,W,H,0x1c1c1c,0.95).setOrigin(0));

  // Preview
  const base=scene.add.sprite(W/2,80,'character',4).setOrigin(0.5).setScrollFactor(0);
  content.add(base);
  const layers={};
  ['hat','face','top','bottom','shoes','gloves','weapon'].forEach(k=>{
    layers[k]=scene.add.sprite(W/2,80,'character',4).setOrigin(0.5).setVisible(false).setScrollFactor(0);
    content.add(layers[k]);
  });

  // Slots
  const defs=[
    ['hat',   W/2,  50],
    ['face',  W/2,  80],
    ['top',     60, 130],
    ['bottom',  60, 170],
    ['shoes',   60, 210],
    ['gloves',W-60, 130],
    ['weapon',W-60, 170]
  ];
  window.equipmentSlots=[];
  defs.forEach(d=>{
    const [slot,x,y]=d;
    const z=scene.add.rectangle(x,y,32,32,0x444444,0.8).setOrigin(0.5).setInteractive({useHandCursor:true}).setScrollFactor(0);
    scene.input.setDropZone(z);
    z.accepts=slot; z.slotName=slot;
    content.add(z); window.equipmentSlots.push(z);

    const lbl=scene.add.text(x,y+20,slot.toUpperCase(),{fontSize:'10px',fill:'#ccc'}).setOrigin(0.5).setScrollFactor(0);
    content.add(lbl);
  });

  // Title bar
  const bar=scene.add.rectangle(X,Y,W,20,0x111111)
    .setOrigin(0).setDepth(11).setScrollFactor(0)
    .setInteractive({useHandCursor:true}).setVisible(false);
  scene.input.setDraggable(bar);

  const closeBtn=scene.add.text(X+W-20,Y,'✖',{fontSize:'14px',fill:'#fff',backgroundColor:'#900',padding:{l:4,r:4,t:1,b:1}})
    .setOrigin(0).setDepth(11).setScrollFactor(0).setInteractive({useHandCursor:true}).setVisible(false);
  closeBtn.on('pointerdown',()=>{
    open=false; content.setVisible(false); bar.setVisible(false); closeBtn.setVisible(false);
  });

  let dx=0,dy=0;
  bar.on('dragstart',(p,dX,dY)=>{ dx=dX-content.x; dy=dY-content.y; });
  scene.input.on('drag',(p,o,dX,dY)=>{
    if(o===bar){
      const nx=dX-dx, ny=dY-dy;
      content.setPosition(nx,ny+20);
      bar.setPosition(nx,ny);
      closeBtn.setPosition(nx+W-20,ny);
    }
  });

  // Drops
  scene.input.on('drop',(p,drag,dropZone)=>{
    if(dropZone.accepts===drag.itemType){
      layers[dropZone.slotName].setTexture(drag.itemKey).setVisible(true);
    }
  });

  // Double-click
  window.applyEquip=(key,type)=>{
    for(const z of window.equipmentSlots){
      if(z.accepts===type){
        layers[z.slotName].setTexture(key).setVisible(true);
        break;
      }
    }
  };

  // Toggle E
  scene.input.keyboard.on('keydown-E',()=>{
    open=!open;
    content.setVisible(open);
    bar.setVisible(open);
    closeBtn.setVisible(open);
  });
}
