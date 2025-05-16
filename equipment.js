let equipmentContainer;
let equipmentOpen = false;
let titleBar, closeBtn;
window.equipmentSlots = [];
let previewContainer, layerSprites = {};

function initEquipmentUI(scene) {
  const W = 260, H = 320;

  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  equipmentContainer.setSize(W, H);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, W, H-20, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar
  titleBar = scene.add.rectangle(0, 0, W, 20, 0x111111)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  equipmentContainer.add(titleBar);
  scene.input.setDraggable(titleBar);

  // Close button
  closeBtn = scene.add.text(W-20, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left:4, right:4, top:1, bottom:1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(closeBtn);
  closeBtn.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
    titleBar.setVisible(false);
    closeBtn.setVisible(false);
  });

  // Drag logic
  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === titleBar) {
      equipmentContainer.setPosition(dragX, dragY + 20);
      titleBar.setPosition(dragX, dragY);
      closeBtn.setPosition(dragX + W-20, dragY);
    }
  });

  // Preview container (layered sprites)
  previewContainer = scene.add.container(W/2, 160).setSize(40,60);
  layerSprites.body    = scene.add.sprite(0,0,"body_base").setOrigin(0.5);
  layerSprites.hat     = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
  layerSprites.face    = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
  layerSprites.top     = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
  layerSprites.bottom  = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
  layerSprites.shoes   = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
  layerSprites.gloves  = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
  layerSprites.weapon  = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
  previewContainer.add([
    layerSprites.body,
    layerSprites.bottom,
    layerSprites.top,
    layerSprites.hat,
    layerSprites.face,
    layerSprites.gloves,
    layerSprites.shoes,
    layerSprites.weapon
  ]);
  equipmentContainer.add(previewContainer);

  // Define slots
  const slots = [
    { slotName:"hat",    x: W/2,    y: 50,  accepts:"hat"    },
    { slotName:"face",   x: W/2,    y: 80,  accepts:"face"   },
    { slotName:"top",    x: 60,     y: 130, accepts:"top"    },
    { slotName:"bottom", x: 60,     y: 170, accepts:"bottom" },
    { slotName:"shoes",  x: 60,     y: 210, accepts:"shoes"  },
    { slotName:"gloves", x: W-60,   y: 130, accepts:"gloves" },
    { slotName:"weapon", x: W-60,   y: 170, accepts:"weapon" }
  ];

  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    zone.slotName = slot.slotName;
    zone.accepts  = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y+20, slot.slotName.toUpperCase(), {
      fontSize:"10px", fill:"#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle drops: show icon and update preview layer
  scene.input.on("drop", (pointer, item, dropZone) => {
    if (!dropZone.accepts || !item.itemType) return;
    if (dropZone.accepts === item.itemType) {
      // slot icon
      const icon = scene.make.image({
        x: dropZone.x, y: dropZone.y,
        key: item.itemKey, add: false
      }).setOrigin(0.5).setScale(1.2);
      equipmentContainer.add(icon);

      // preview update
      const layer = layerSprites[dropZone.slotName];
      layer.setTexture(item.itemKey);
      layer.setVisible(true);
      console.log(`Equipped ${item.itemKey} to ${dropZone.slotName}`);
    }
  });

  // Toggle with E
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    titleBar.setVisible(equipmentOpen);
    closeBtn.setVisible(equipmentOpen);
    if (equipmentOpen) {
      const b = equipmentContainer.getBounds();
      titleBar.setPosition(b.x, b.y - 20);
      closeBtn.setPosition(b.x + W-20, b.y - 20);
    }
  });
}
