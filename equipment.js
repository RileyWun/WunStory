
let equipmentContainer;
let equipmentOpen = false;
let titleBar, closeButton;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  const width = 260;
  const height = 320;

  // Container
  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  equipmentContainer.setSize(width, height);

  // Background starts below title bar
  const bg = scene.add.rectangle(0, 20, width, height - 20, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar
  titleBar = scene.add.rectangle(0, 0, width, 20, 0x111111)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  equipmentContainer.add(titleBar);

  // Close button
  closeButton = scene.add.text(width - 20, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(closeButton);

  closeButton.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
  });

  // Dragging via titleBar
  scene.input.setDraggable(titleBar);
  titleBar.input && (titleBar.input.cursor = 'pointer');
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      equipmentContainer.setPosition(dragX, dragY);
    }
  });

  // Preview placeholder
  const preview = scene.add.rectangle(width/2, height/2 + 10, 40, 60, 0xaaaaaa).setOrigin(0.5);
  equipmentContainer.add(preview);

  // Slots layout
  const slots = [
    { slotName: "hat", x: width/2, y: 50, accepts: "hat" },
    { slotName: "face", x: width/2, y: 85, accepts: "face" },
    { slotName: "top", x: 60, y: 140, accepts: "top" },
    { slotName: "bottom", x: 60, y: 175, accepts: "bottom" },
    { slotName: "shoes", x: 60, y: 210, accepts: "shoes" },
    { slotName: "gloves", x: width - 60, y: 140, accepts: "gloves" },
    { slotName: "weapon", x: width - 60, y: 175, accepts: "weapon" }
  ];
  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    zone.slotName = slot.slotName;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y + 20, slot.slotName.toUpperCase(), {
      fontSize: "10px", fill: "#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Drop event
  scene.input.on("drop", (pointer, gameObject, dropZone) => {
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
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    titleBar.setVisible(equipmentOpen);
    closeButton.setVisible(equipmentOpen);
    if (equipmentOpen) {
      const pos = equipmentContainer.getBounds();
      titleBar.setPosition(pos.x, pos.y);
      closeButton.setPosition(pos.x + width - 20, pos.y + 2);
    }
  });
}
