
let equipmentContainer;
let equipmentOpen = false;
let previewContainer;
let layerSprites = {};
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  const width = 260;
  const height = 320;

  // Create main equipment container
  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  equipmentContainer.setSize(width, height);
  equipmentContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

  // Add background
  const bg = scene.add.rectangle(0, 0, width, height, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar and drag
  const titleBar = scene.add.rectangle(0, 0, width, 20, 0x111111).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(titleBar);
  scene.input.setDraggable(titleBar);
  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      equipmentContainer.setPosition(dragX, dragY);
    }
  });

  // Close button
  const closeBtn = scene.add.text(width - 20, 2, "✖", {
    fontSize: "14px", fill: "#fff", backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  closeBtn.on('pointerdown', () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
  });
  equipmentContainer.add(closeBtn);

  // Preview container for layered sprites
  previewContainer = scene.add.container(width / 2, 160).setSize(40, 60).setDepth(1);
  // Base body layer
  layerSprites.body = scene.add.sprite(0, 0, 'body_base').setOrigin(0.5);
  // Optional layers initialized invisible
  layerSprites.hat    = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
  layerSprites.face   = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
  layerSprites.top    = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
  layerSprites.bottom = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
  layerSprites.shoes  = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
  layerSprites.gloves = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
  layerSprites.weapon = scene.add.sprite(0, 0, null).setOrigin(0.5).setVisible(false);
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

  // Define slot positions
  const slots = [
    { slotName: 'hat',    x: width/2, y: 40,  accepts: 'hat'    },
    { slotName: 'face',   x: width/2, y: 70,  accepts: 'face'   },
    { slotName: 'top',    x: 60,      y: 130, accepts: 'top'    },
    { slotName: 'bottom', x: 60,      y: 170, accepts: 'bottom' },
    { slotName: 'shoes',  x: 60,      y: 210, accepts: 'shoes'  },
    { slotName: 'gloves', x: width-60, y: 130, accepts: 'gloves' },
    { slotName: 'weapon', x: width-60, y: 170, accepts: 'weapon' }
  ];

  // Create slots and labels
  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    zone.slotName = slot.slotName;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y + 20, slot.slotName.toUpperCase(), {
      fontSize: '10px', fill: '#ccc'
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle drop: update slot icon and preview layers
  scene.input.on('drop', (pointer, gameObject, dropZone) => {
    if (!dropZone.accepts || !gameObject.itemType) return;
    if (dropZone.accepts === gameObject.itemType) {
      // Add icon to slot
      const icon = scene.make.image({
        x: dropZone.x,
        y: dropZone.y,
        key: gameObject.itemKey,
        add: false
      }).setOrigin(0.5).setScale(1.2);
      equipmentContainer.add(icon);
      console.log(`Equipped ${gameObject.itemKey} to ${dropZone.slotName}`);

      // Update preview
      const layer = layerSprites[dropZone.slotName];
      if (layer) {
        layer.setTexture(gameObject.itemKey);
        layer.setVisible(true);
      }
    }
  });

  // Toggle panel with E key
  scene.input.keyboard.on('keydown-E', () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
  });
}
