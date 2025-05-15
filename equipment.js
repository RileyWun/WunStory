
let equipmentContainer;
let equipmentOpen = false;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  const width = 260;
  const height = 320;

  // Create container as a draggable window
  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);

  // Make container interactive and draggable
  equipmentContainer.setSize(width, height);
  equipmentContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
  scene.input.setDraggable(equipmentContainer);
  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    if (gameObject === equipmentContainer) {
      equipmentContainer.setPosition(dragX, dragY);
    }
  });

  // Background
  const bg = scene.add.rectangle(0, 0, width, height, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar
  const titleBar = scene.add.rectangle(0, 0, width, 20, 0x111111).setOrigin(0);
  equipmentContainer.add(titleBar);

  // Close button
  const closeBtn = scene.add.text(width - 20, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  closeBtn.on('pointerdown', () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
  });
  equipmentContainer.add(closeBtn);

  // Player preview
  const previewY = height / 2 + 20;
  const preview = scene.add.rectangle(width / 2, previewY, 40, 60, 0xaaaaaa).setOrigin(0.5);
  equipmentContainer.add(preview);

  // Define slots
  const slots = [
    { name: 'hat', x: width/2, y: 60, accepts: 'hat' },
    { name: 'face', x: width/2, y: 100, accepts: 'face' },
    { name: 'top', x: 60, y: 160, accepts: 'top' },
    { name: 'bottom', x: 60, y: 200, accepts: 'bottom' },
    { name: 'shoes', x: 60, y: 240, accepts: 'shoes' },
    { name: 'gloves', x: width-60, y: 160, accepts: 'gloves' },
    { name: 'weapon', x: width-60, y: 200, accepts: 'weapon' }
  ];

  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    zone.slotName = slot.name;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y + 18, slot.name.toUpperCase(), {
      fontSize: '10px',
      fill: '#ccc'
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle drop
  scene.input.on('drop', (pointer, gameObject, dropZone) => {
    if (!dropZone.accepts || !gameObject.itemType) return;
    if (dropZone.accepts === gameObject.itemType) {
      const icon = scene.make.image({
        x: dropZone.x,
        y: dropZone.y,
        key: gameObject.itemKey,
        add: false
      }).setOrigin(0.5).setScale(1.2);
      equipmentContainer.add(icon);
    }
  });

  // Toggle with E
  scene.input.keyboard.on('keydown-E', () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
  });
}
