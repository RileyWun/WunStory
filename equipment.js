// equipment.js

let equipmentContainer;
let equipmentOpen = false;
let eqTitleBar, eqCloseBtn;
window.equipmentSlots = [];
let previewContainer, layerSprites = {};

function initEquipmentUI(scene) {
  const W = 260, H = 320;

  // Main container
  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  equipmentContainer.setSize(W, H);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, W, H - 20, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Preview container
  previewContainer = scene.add.container(W/2, 160)
    .setDepth(11);
  layerSprites.body = scene.add.sprite(0, 0, 'body_base').setOrigin(0.5);
  ["hat","face","top","bottom","shoes","gloves","weapon"].forEach(slot => {
    layerSprites[slot] = scene.add.sprite(0, 0, null)
      .setOrigin(0.5).setVisible(false);
    previewContainer.add(layerSprites[slot]);
  });
  previewContainer.add(layerSprites.body);
  equipmentContainer.add(previewContainer);

  // Slots
  const slots = [
    { slotName:"hat",    x: W/2,  y:  50, accepts:"hat"    },
    { slotName:"face",   x: W/2,  y:  80, accepts:"face"   },
    { slotName:"top",    x:   60, y: 130, accepts:"top"    },
    { slotName:"bottom", x:   60, y: 170, accepts:"bottom" },
    { slotName:"shoes",  x:   60, y: 210, accepts:"shoes"  },
    { slotName:"gloves", x: W-60, y: 130, accepts:"gloves" },
    { slotName:"weapon", x: W-60, y: 170, accepts:"weapon" }
  ];

  slots.forEach(def => {
    const zone = scene.add.rectangle(def.x, def.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
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

  // Title bar
  eqTitleBar = scene.add.rectangle(350, 100, W, 20, 0x111111)
    .setOrigin(0)
    .setDepth(11)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);
  scene.input.setDraggable(eqTitleBar);

  // Close button
  eqCloseBtn = scene.add.text(350 + W - 20, 100, "✖", {
    fontSize:"14px", fill:"#fff",
    backgroundColor:"#900", padding:{ left:4, right:4, top:1, bottom:1 }
  }).setOrigin(0)
    .setDepth(11)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);
  eqCloseBtn.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
    eqTitleBar.setVisible(false);
    eqCloseBtn.setVisible(false);
  });

  // Dragging logic
  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === eqTitleBar) {
      eqTitleBar.setPosition(dragX, dragY);
      eqCloseBtn.setPosition(dragX + W - 20, dragY);
      equipmentContainer.setPosition(dragX, dragY + 20);
    }
  });

  // Drop handler
  scene.input.on("drop", (pointer, item, dropZone) => {
    if (dropZone.accepts === item.itemType) {
      // show icon
      const icon = scene.make.image({
        x: dropZone.x, y: dropZone.y,
        key: item.itemKey, add: false
      }).setOrigin(0.5).setScale(1.2);
      equipmentContainer.add(icon);
      // update preview layer
      const layer = layerSprites[dropZone.slotName];
      if (layer) {
        layer.setTexture(item.itemKey);
        layer.setVisible(true);
      }
    }
  });

  // Expose for double-click
  window.applyEquip = (key, type) => {
    for (const slot of window.equipmentSlots) {
      if (slot.accepts === type) {
        const layer = layerSprites[slot.slotName];
        if (layer) {
          layer.setTexture(key);
          layer.setVisible(true);
        }
        break;
      }
    }
  };

  // Toggle with E
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    eqTitleBar.setVisible(equipmentOpen);
    eqCloseBtn.setVisible(equipmentOpen);
  });
}
