
let equipmentContainer;
let equipmentOpen = false;
let equipmentTitleBar, equipmentCloseButton;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  const width = 260;
  const height = 320;
  // Main container
  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);

  // Background (below title bar)
  const bg = scene.add.rectangle(0, 20, width, height - 20, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar at y=0
  equipmentTitleBar = scene.add.rectangle(0, 0, width, 20, 0x111111).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(equipmentTitleBar);

  // Close button on title bar
  equipmentCloseButton = scene.add.text(width - 20, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(equipmentCloseButton);

  // Close handler
  equipmentCloseButton.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
    equipmentTitleBar.setVisible(false);
    equipmentCloseButton.setVisible(false);
  });

  // Drag by title bar
  scene.input.setDraggable(equipmentTitleBar);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === equipmentTitleBar) {
      equipmentContainer.setPosition(dragX, dragY + 20);
      equipmentTitleBar.setPosition(dragX, dragY);
      equipmentCloseButton.setPosition(dragX + width - 20, dragY);
    }
  });

  // Slots definition
  const slots = [
    { name: "hat", x: width/2, y: 50, accepts: "hat" },
    { name: "face", x: width/2, y: 80, accepts: "face" },
    { name: "top", x: 60, y: 140, accepts: "top" },
    { name: "bottom", x: 60, y: 180, accepts: "bottom" },
    { name: "shoes", x: 60, y: 220, accepts: "shoes" },
    { name: "gloves", x: width - 60, y: 140, accepts: "gloves" },
    { name: "weapon", x: width - 60, y: 180, accepts: "weapon" }
  ];

  // Create slot zones and labels
  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive();
    zone.slotName = slot.name;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y + 18, slot.name.toUpperCase(), {
      fontSize: "10px", fill: "#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle drop
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
    equipmentTitleBar.setVisible(equipmentOpen);
    equipmentCloseButton.setVisible(equipmentOpen);
    // position on open
    const bounds = equipmentContainer.getBounds();
    equipmentTitleBar.setPosition(bounds.x, bounds.y - 20);
    equipmentCloseButton.setPosition(bounds.x + width - 20, bounds.y - 20);
  });
}
