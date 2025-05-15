let equipmentContainer;
let equipmentOpen = false;
let titleBar, closeButton;
window.equipmentSlots = [];
let previewContainer, layerSprites = {};

function initEquipmentUI(scene) {
  // Create container
  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  const width = 260, height = 320;
  equipmentContainer.setSize(width, height);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, width, height - 20, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar
  titleBar = scene.add.rectangle(0, 0, width, 20, 0x111111)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  equipmentContainer.add(titleBar);

  // Close button
  closeButton = scene.add.text(width - 20, 2, "✖", {
    fontSize: "14px", fill: "#fff", backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(closeButton);
  closeButton.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
    titleBar.setVisible(false);
    closeButton.setVisible(false);
  });

  // Dragging logic
  scene.input.setDraggable(titleBar);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      equipmentContainer.setPosition(dragX, dragY + 20);
      titleBar.setPosition(dragX, dragY);
      closeButton.setPosition(dragX + width - 20, dragY);
    }
  });

  // Preview container
  previewContainer = scene.add.container(width / 2, 160).setSize(40, 60);
  layerSprites.body = scene.add.sprite(0, 0, 'body_base').setOrigin(0.5);
  ['hat','face','top','bottom','shoes','gloves','weapon'].forEach(slot => {
    layerSprites[slot] = scene.add.sprite(0,0,null).setOrigin(0.5).setVisible(false);
    previewContainer.add(layerSprites[slot]);
  });
  previewContainer.add(layerSprites.body);
  equipmentContainer.add(previewContainer);

  // Slots
  const slots = [
    { slotName: 'hat', x: width/2, y: 50, accepts: 'hat' },
    { slotName: 'face', x: width/2, y: 80, accepts: 'face' },
    { slotName: 'top', x: 60, y: 130, accepts: 'top' },
    { slotName: 'bottom', x: 60, y: 170, accepts: 'bottom' },
    { slotName: 'shoes', x: 60, y: 210, accepts: 'shoes' },
    { slotName: 'gloves', x: width-60, y: 130, accepts: 'gloves' },
    { slotName: 'weapon', x: width-60, y: 170, accepts: 'weapon' }
  ];
  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32,32,0x444444,0.8)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    zone.slotName = slot.slotName;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y+20, slot.slotName.toUpperCase(), {
      fontSize:'10px', fill:'#ccc'
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle drop
  scene.input.on('drop', (pointer, gameObject, dropZone) => {
    if (!dropZone.accepts || !gameObject.itemType) return;
    if (dropZone.accepts === gameObject.itemType) {
      // Icon in slot
      const icon = scene.make.image({
        x: dropZone.x, y: dropZone.y, key: gameObject.itemKey, add: false
      }).setOrigin(0.5).setScale(1.2);
      equipmentContainer.add(icon);
      // Update preview
      const layer = layerSprites[dropZone.slotName];
      if (layer) {
        layer.setTexture(gameObject.itemKey);
        layer.setVisible(true);
      }
    }
  });

  // Toggle with E
  scene.input.keyboard.on('keydown-E', () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    titleBar.setVisible(equipmentOpen);
    closeButton.setVisible(equipmentOpen);
    if (equipmentOpen) {
      const pos = equipmentContainer.getBounds();
      titleBar.setPosition(pos.x, pos.y - 20);
      closeButton.setPosition(pos.x + width - 20, pos.y - 20);
    }
  });
}
