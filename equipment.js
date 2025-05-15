
let equipmentContainer;
let equipmentOpen = false;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  equipmentContainer = scene.add.container(350, 120).setScrollFactor(0).setDepth(10).setVisible(false);
  equipmentContainer.setSize(240, 280);

  const background = scene.add.rectangle(0, 0, 240, 280, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(background);

  const titleBar = scene.add.rectangle(0, 0, 240, 20, 0x111111).setOrigin(0).setInteractive();
  titleBar.input && (titleBar.input.cursor = "pointer");
  equipmentContainer.add(titleBar);

  // Drag logic
  scene.input.setDraggable(titleBar);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      equipmentContainer.setPosition(dragX, dragY);
    }
  });

  const closeButton = scene.add.text(220, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  closeButton.on("pointerdown", () => {
    equipmentContainer.setVisible(false);
    equipmentOpen = false;
  });
  equipmentContainer.add(closeButton);

  // Player preview
  const playerPreview = scene.add.rectangle(120, 110, 40, 60, 0xaaaaaa).setOrigin(0.5);
  equipmentContainer.add(playerPreview);

  // Define slots
  const slots = [
    { slotName: "hat", x: 120, y: 30, accepts: "hat" },
    { slotName: "face", x: 120, y: 55, accepts: "face" },
    { slotName: "top", x: 40, y: 100, accepts: "top" },
    { slotName: "bottom", x: 40, y: 130, accepts: "bottom" },
    { slotName: "shoes", x: 40, y: 160, accepts: "shoes" },
    { slotName: "gloves", x: 200, y: 100, accepts: "gloves" },
    { slotName: "weapon", x: 200, y: 140, accepts: "weapon" }
  ];

  slots.forEach(slot => {
    const dropZone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive();
    dropZone.slotName = slot.slotName;
    dropZone.accepts = slot.accepts;
    dropZone.input.dropZone = true;

    equipmentContainer.add(dropZone);
    window.equipmentSlots.push(dropZone);

    const label = scene.add.text(slot.x, slot.y + 18, slot.slotName.toUpperCase(), {
      fontSize: "10px",
      fill: "#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle drop event
  scene.input.on("drop", (pointer, gameObject, dropZone) => {
    if (!dropZone || !dropZone.accepts || !gameObject.itemType) return;
    if (dropZone.accepts === gameObject.itemType) {
      const icon = scene.add.image(dropZone.x, dropZone.y, gameObject.itemKey)
        .setOrigin(0.5)
        .setScale(1.2);
      equipmentContainer.add(icon);
      console.log(`Equipped ${gameObject.itemKey} to ${dropZone.slotName}`);
    } else {
      console.log(`Cannot equip ${gameObject.itemKey} to ${dropZone.slotName}`);
    }
  });

  // Toggle panel with E key
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
  });
}
