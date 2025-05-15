
let equipmentContainer;
let equipmentOpen = false;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  const width = 260, height = 320;
  
  // Create container and enable drag
  equipmentContainer = scene.add.container(350, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  
  equipmentContainer.setSize(width, height);
  equipmentContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
  scene.input.setDraggable(equipmentContainer);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
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
  closeBtn.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
  });
  equipmentContainer.add(closeBtn);

  // Player preview
  const preview = scene.add.rectangle(width / 2, 140, 40, 60, 0xaaaaaa).setOrigin(0.5);
  equipmentContainer.add(preview);

  // Define slots
  const slots = [
    { slotName: "hat", x: width / 2, y: 50, accepts: "hat" },
    { slotName: "face", x: width / 2, y: 80, accepts: "face" },
    { slotName: "top", x: 60, y: 140, accepts: "top" },
    { slotName: "bottom", x: 60, y: 180, accepts: "bottom" },
    { slotName: "shoes", x: 60, y: 220, accepts: "shoes" },
    { slotName: "gloves", x: width - 60, y: 140, accepts: "gloves" },
    { slotName: "weapon", x: width - 60, y: 180, accepts: "weapon" }
  ];

  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive();
    zone.slotName = slot.slotName;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y + 18, slot.slotName.toUpperCase(), {
      fontSize: "10px", fill: "#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle drop events
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
      console.log(`Equipped ${gameObject.itemKey} to ${dropZone.slotName}`);
    }
  });

  // Toggle with E key
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
  });
}
