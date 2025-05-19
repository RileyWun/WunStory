// equipment.js

let equipmentContainer, eqTitleBar, eqCloseBtn;
let equipmentOpen = false;
window.equipmentSlots = [];
let previewContainer, layerSprites = {};

const EQ_X = 350, EQ_Y = 120, EQ_W = 260, EQ_H = 320;

function initEquipmentUI(scene) {
  // 1) Panel container + background
  equipmentContainer = scene.add.container(EQ_X, EQ_Y)
    .setScrollFactor(0)
    .setVisible(false)
    .setDepth(10);

  const bg = scene.add.rectangle(0, 0, EQ_W, EQ_H, 0x1c1c1c, 0.95)
    .setOrigin(0);
  equipmentContainer.add(bg);

  // 2) Live preview (centered)
  previewContainer = scene.add.container(EQ_W/2 + EQ_X, 160 + EQ_Y - 120)
    .setDepth(11)
    .setScrollFactor(0);
  layerSprites.body = scene.add.sprite(EQ_X + EQ_W/2, EQ_Y + 160, 'character', 4)
    .setOrigin(0.5)
    .setScrollFactor(0);
  previewContainer.add(layerSprites.body);

  // slots & layer placeholders
  const defs = [
    {name:'hat',    x:EQ_W/2,  y:50},
    {name:'face',   x:EQ_W/2,  y:80},
    {name:'top',    x:60,      y:130},
    {name:'bottom', x:60,      y:170},
    {name:'shoes',  x:60,      y:210},
    {name:'gloves', x:EQ_W-60, y:130},
    {name:'weapon', x:EQ_W-60, y:170}
  ];
  defs.forEach(def => {
    // drop zone
    const zone = scene.add.rectangle(
      EQ_X + def.x,
      EQ_Y + def.y,
      32, 32, 0x444444, 0.8
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setScrollFactor(0);
    zone.slotName = def.name;
    zone.accepts  = def.name;
    scene.input.setDropZone(zone);
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    // layer sprite sits on top
    layerSprites[def.name] = scene.add.sprite(
      EQ_X + def.x,
      EQ_Y + def.y,
      'character', 4
    )
    .setOrigin(0.5)
    .setVisible(false)
    .setScrollFactor(0);
    equipmentContainer.add(layerSprites[def.name]);

    // label
    const lbl = scene.add.text(
      EQ_X + def.x,
      EQ_Y + def.y + 20,
      def.name.toUpperCase(),
      { fontSize:"10px", fill:"#ccc" }
    )
    .setOrigin(0.5)
    .setScrollFactor(0);
    equipmentContainer.add(lbl);
  });

  // 3) Title bar & close (outside)
  eqTitleBar = scene.add.rectangle(
    EQ_X, EQ_Y - 20, EQ_W, 20, 0x111111
  )
  .setOrigin(0)
  .setDepth(12)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);
  scene.input.setDraggable(eqTitleBar);

  eqCloseBtn = scene.add.text(
    EQ_X + EQ_W - 20, EQ_Y - 20, '✖', {
      fontSize:"14px", fill:"#fff",
      backgroundColor:"#900",
      padding:{left:4,right:4,top:1,bottom:1}
    }
  )
  .setOrigin(0)
  .setDepth(12)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);

  eqCloseBtn.on('pointerdown', () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
    eqTitleBar.setVisible(false);
    eqCloseBtn.setVisible(false);
  });

  // 4) Drag bar moves panel
  scene.input.on('drag', (pointer, go, dragX, dragY) => {
    if (go === eqTitleBar) {
      eqTitleBar.setPosition(dragX, dragY);
      eqCloseBtn.setPosition(dragX + EQ_W - 20, dragY);
      equipmentContainer.setPosition(dragX, dragY + 20);
    }
  });

  // 5) Handle drop events
  scene.input.on('drop', (pointer, draggedSprite, dropZone) => {
    if (!dropZone.accepts || draggedSprite.itemType !== dropZone.accepts) return;
    // update live preview layer
    const layer = layerSprites[dropZone.slotName];
    if (layer) {
      // if it's an image-based item, load that texture
      if (typeof draggedSprite.itemKey === 'string') {
        layer.setTexture(draggedSprite.itemKey);
      }
      layer.setVisible(true);
    }
  });

  // 6) Double-click equip from inventory
  window.applyEquip = (key, type) => {
    for (const zone of window.equipmentSlots) {
      if (zone.accepts === type) {
        const layer = layerSprites[zone.slotName];
        if (layer) {
          layer.setTexture(key);
          layer.setVisible(true);
        }
        break;
      }
    }
  };

  // 7) Toggle with E
  const keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  keyE.on('down', () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    eqTitleBar.setVisible(equipmentOpen);
    eqCloseBtn.setVisible(equipmentOpen);
  });
}
