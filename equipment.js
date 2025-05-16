let equipmentContainer;
let equipmentOpen = false;
const EQUIP_KEY = 'E';
const eqStartX = 350, eqStartY = 120;
const EQ_W = 260, EQ_H = 320;
let previewContainer, layerSprites = {};
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  equipmentContainer = scene.add.container(eqStartX, eqStartY)
    .setScrollFactor(0).setDepth(10).setVisible(false);
  equipmentContainer.setSize(EQ_W, EQ_H);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, EQ_W, EQ_H - 20, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar (drag handle)
  const titleBar = scene.add.rectangle(0, 0, EQ_W, 20, 0x111111)
    .setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(titleBar);
  scene.input.setDraggable(titleBar);

  // Close button
  const closeBtn = scene.add.text(EQ_W - 20, 2, "✖", {
    fontSize:"14px",
    fill:"#fff",
    backgroundColor:"#900",
    padding:{ left:4, right:4, top:1, bottom:1 }
  }).setOrigin(0).setInteractive({ useHandCursor:true });
  equipmentContainer.add(closeBtn);
  closeBtn.on("pointerdown", () => {
    equipmentContainer.setVisible(false);
    equipmentOpen = false;
  });

  // Dragging logic
  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === titleBar) {
      equipmentContainer.setPosition(dragX, dragY);
    }
  });

  // Preview container (layered sprites)
  previewContainer = scene.add.container(EQ_W / 2, 160).setSize(40, 60);
  layerSprites.body = scene.add.sprite(0, 0, 'body_base').setOrigin(0.5);
  ['hat','face','top','bottom','shoes','gloves','weapon'].forEach(slot => {
    layerSprites[slot] = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
    previewContainer.add(layerSprites[slot]);
  });
  previewContainer.add(layerSprites.body);
  equipmentContainer.add(previewContainer);

  // Define and create slots
  const slots = [
    { slotName:"hat",    x: EQ_W/2,  y: 50,  accepts:"hat"    },
    { slotName:"face",   x: EQ_W/2,  y: 80,  accepts:"face"   },
    { slotName:"top",    x: 60,      y: 130, accepts:"top"    },
    { slotName:"bottom", x: 60,      y: 170, accepts:"bottom" },
    { slotName:"shoes",  x: 60,      y: 210, accepts:"shoes"  },
    { slotName:"gloves", x: EQ_W-60, y: 130, accepts:"gloves" },
    { slotName:"weapon", x: EQ_W-60, y: 170, accepts:"weapon" }
  ];

  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor:true });
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

  // Handle drop events
  scene.input.on("drop", (pointer, item, dropZone) => {
    if (!dropZone.accepts || !item.itemType) return;
    if (dropZone.accepts === item.itemType) {
      // Show icon in slot
      const icon = scene.make.image({
        x: dropZone.x, y: dropZone.y,
        key: item.itemKey, add:false
      }).setOrigin(0.5).setScale(1.2);
      equipmentContainer.add(icon);
      // Update preview layer
      const layer = layerSprites[dropZone.slotName];
      if (layer) {
        layer.setTexture(item.itemKey);
        layer.setVisible(true);
      }
    }
  });

  // Toggle with E
  scene.input.keyboard.on(`keydown-${EQUIP_KEY}`, () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
  });
}
