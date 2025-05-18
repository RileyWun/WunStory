// equipment.js

let equipmentContainer;
let equipmentOpen = false;
let eqTitleBar, eqCloseBtn;
window.equipmentSlots = [];
let previewContainer, layerSprites = {};

const EQ_X = 350, EQ_Y = 120, EQ_W = 260, EQ_H = 320;

function initEquipmentUI(scene) {
  equipmentContainer = scene.add.container(EQ_X, EQ_Y)
    .setScrollFactor(0).setDepth(10).setVisible(false)
    .setSize(EQ_W, EQ_H);

  // background
  const bg = scene.add.rectangle(0, 0, EQ_W, EQ_H, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // preview layers: use 'character' sheet frames
  previewContainer = scene.add.container(EQ_W/2, 160).setDepth(11);
  layerSprites.body   = scene.add.sprite(0, 0, 'character', 4).setOrigin(0.5);
  ['hat','face','top','bottom','shoes','gloves','weapon'].forEach((slot, idx) => {
    layerSprites[slot] = scene.add.sprite(0, 0, 'character', 4)
      .setOrigin(0.5).setVisible(false);
    previewContainer.add(layerSprites[slot]);
  });
  previewContainer.add(layerSprites.body);
  equipmentContainer.add(previewContainer);

  // slots around preview
  const defs = [
    { slotName:'hat',    x:EQ_W/2,  y:50  },
    { slotName:'face',   x:EQ_W/2,  y:80  },
    { slotName:'top',    x:60,      y:130 },
    { slotName:'bottom', x:60,      y:170 },
    { slotName:'shoes',  x:60,      y:210 },
    { slotName:'gloves', x:EQ_W-60, y:130 },
    { slotName:'weapon', x:EQ_W-60, y:170 }
  ];
  const types = ['hat','face','top','bottom','shoes','gloves','weapon'];
  defs.forEach((d, i) => {
    const zone = scene.add.rectangle(d.x, d.y, 32,32,0x444444,0.8)
      .setOrigin(0.5).setInteractive({ useHandCursor:true });
    zone.slotName = types[i];
    zone.accepts  = types[i];
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const lbl = scene.add.text(d.x, d.y+20, types[i].toUpperCase(), {
      fontSize:"10px", fill:"#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(lbl);
  });

  // title bar
  eqTitleBar = scene.add.rectangle(EQ_X, EQ_Y-20, EQ_W, 20, 0x111111)
    .setOrigin(0).setDepth(11).setScrollFactor(0)
    .setInteractive({ useHandCursor:true })
    .setVisible(false);
  scene.input.setDraggable(eqTitleBar);

  // close button
  eqCloseBtn = scene.add.text(EQ_X+EQ_W-20, EQ_Y-20, "✖", {
    fontSize:"14px", fill:"#fff",
    backgroundColor:"#900", padding:{left:4,right:4,top:1,bottom:1}
  }).setOrigin(0).setDepth(11).setScrollFactor(0)
    .setInteractive({ useHandCursor:true })
    .setVisible(false);
  eqCloseBtn.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
    eqTitleBar.setVisible(false);
    eqCloseBtn.setVisible(false);
  });

  // drag logic
  scene.input.on("drag", (p, go, dx, dy) => {
    if (go === eqTitleBar) {
      eqTitleBar.setPosition(dx, dy);
      eqCloseBtn.setPosition(dx+EQ_W-20, dy);
      equipmentContainer.setPosition(dx, dy+20);
    }
  });

  // handle drop: show frame on layer
  scene.input.on("drop", (p, item, dz) => {
    if (!dz.accepts || item.itemType !== dz.accepts) return;
    const layer = layerSprites[dz.slotName];
    if (layer) {
      layer.setFrame(item.itemFrame).setVisible(true);
    }
  });

  // expose applyEquip for double-click
  window.applyEquip = (frame, type) => {
    for (const slot of window.equipmentSlots) {
      if (slot.accepts === type) {
        const layer = layerSprites[slot.slotName];
        if (layer) {
          layer.setFrame(frame).setVisible(true);
        }
        break;
      }
    }
  };

  // toggle with E
  const keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  keyE.on("down", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    eqTitleBar.setVisible(equipmentOpen);
    eqCloseBtn.setVisible(equipmentOpen);
  });
}
