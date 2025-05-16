let equipmentContainer;
let equipmentOpen = false;
let eqTitleBar, eqCloseBtn;
window.equipmentSlots = [];
let previewContainer, layerSprites = {};

const EQ_X = 350;
const EQ_Y = 120;
const EQ_W = 260;
const EQ_H = 320;

function initEquipmentUI(scene) {
  // main container
  equipmentContainer = scene.add.container(EQ_X, EQ_Y)
    .setScrollFactor(0).setDepth(10).setVisible(false)
    .setSize(EQ_W, EQ_H);

  // background
  const bg = scene.add.rectangle(0, 0, EQ_W, EQ_H, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // live preview
  previewContainer = scene.add.container(EQ_W/2, 160);
  layerSprites.body = scene.add.sprite(0, 0, 'body_base').setOrigin(0.5);
  ['hat','face','top','bottom','shoes','gloves','weapon'].forEach(slot => {
    layerSprites[slot] = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
    previewContainer.add(layerSprites[slot]);
  });
  previewContainer.add(layerSprites.body);
  equipmentContainer.add(previewContainer);

  // seed default skin from window.playerSkin if available
  const skin = window.playerSkin || {};
  if (skin.top) {
    layerSprites.top.setTexture(skin.top).setVisible(true);
    // optionally also place icon in slot
  }
  if (skin.bottom) {
    layerSprites.bottom.setTexture(skin.bottom).setVisible(true);
  }

  // define slots
  const defs = [
    { slotName:'hat',    x: EQ_W/2, y:  50, accepts:'hat'    },
    { slotName:'face',   x: EQ_W/2, y:  80, accepts:'face'   },
    { slotName:'top',    x:   60,   y: 130, accepts:'top'    },
    { slotName:'bottom', x:   60,   y: 170, accepts:'bottom' },
    { slotName:'shoes',  x:   60,   y: 210, accepts:'shoes'  },
    { slotName:'gloves', x: EQ_W-60, y: 130, accepts:'gloves' },
    { slotName:'weapon', x: EQ_W-60, y: 170, accepts:'weapon' }
  ];
  defs.forEach(def => {
    const zone = scene.add.rectangle(def.x, def.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5).setInteractive({ useHandCursor:true });
    zone.slotName = def.slotName;
    zone.accepts  = def.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(def.x, def.y + 20, def.slotName.toUpperCase(), {
      fontSize:"10px", fill:"#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // title bar
  eqTitleBar = scene.add.rectangle(
    EQ_X, EQ_Y - 20, EQ_W, 20, 0x111111
  ).setOrigin(0).setDepth(11).setScrollFactor(0)
   .setInteractive({ useHandCursor:true })
   .setVisible(false);
  scene.input.setDraggable(eqTitleBar);

  // close button
  eqCloseBtn = scene.add.text(
    EQ_X + EQ_W - 20, EQ_Y - 20, "✖", {
      fontSize:"14px", fill:"#fff",
      backgroundColor:"#900", padding:{left:4,right:4,top:1,bottom:1}
    }
  ).setOrigin(0).setDepth(11).setScrollFactor(0)
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
      eqCloseBtn.setPosition(dx + EQ_W - 20, dy);
      equipmentContainer.setPosition(dx, dy + 20);
    }
  });

  // drop & preview update
  scene.input.on("drop", (p, item, dz) => {
    if (!dz.accepts || !item.itemType) return;
    if (dz.accepts === item.itemType) {
      // slot icon
      const icon = scene.make.image({
        x: dz.x, y: dz.y, key: item.itemKey, add:false
      }).setOrigin(0.5).setScale(1.2);
      equipmentContainer.add(icon);
      // preview
      const layer = layerSprites[dz.slotName];
      if (layer) {
        layer.setTexture(item.itemKey);
        layer.setVisible(true);
      }
    }
  });

  // expose for double-click
  window.applyEquip = (key, type) => {
    if (type === 'potion') return;
    for (const slot of window.equipmentSlots) {
      if (slot.accepts === type) {
        // slot icon
        const ic = scene.make.image({
          x: slot.x, y: slot.y, key, add:false
        }).setOrigin(0.5).setScale(1.2);
        equipmentContainer.add(ic);
        // preview
        const lyr = layerSprites[slot.slotName];
        if (lyr) {
          lyr.setTexture(key);
          lyr.setVisible(true);
        }
        break;
      }
    }
  };

  // toggle E
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    eqTitleBar.setVisible(equipmentOpen);
    eqCloseBtn.setVisible(equipmentOpen);
  });
}
