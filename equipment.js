
let equipmentContainer;
let equipmentOpen = false;
let equipmentTitleBar, equipmentCloseButton;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  equipmentContainer = scene.add.container(350, 120).setScrollFactor(0).setDepth(10).setVisible(false);
  equipmentContainer.setSize(260, 300);

  const bg = scene.add.rectangle(0, 0, 260, 300, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title Bar
  equipmentTitleBar = scene.add.rectangle(0, 0, 260, 20, 0x111111).setOrigin(0).setInteractive();
  scene.input.setDraggable(equipmentTitleBar);
  equipmentContainer.add(equipmentTitleBar);

  // Close Button
  equipmentCloseButton = scene.add.text(240, 2, "✖", {
    fontSize: "14px", fill: "#fff", backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(equipmentCloseButton);

  equipmentCloseButton.on("pointerdown", () => {
    equipmentContainer.setVisible(false);
    equipmentTitleBar.setVisible(false);
    equipmentCloseButton.setVisible(false);
    equipmentOpen = false;
  });

  // Drag logic
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === equipmentTitleBar) {
      equipmentContainer.setPosition(dragX, dragY + 20);
      equipmentTitleBar.setPosition(dragX, dragY);
      equipmentCloseButton.setPosition(dragX + 240, dragY);
    }
  });

  // Slots
  const slots = [
    { slotName: "hat", x: 110, y: 30, accepts: "hat" },
    { slotName: "face", x: 110, y: 55, accepts: "face" },
    { slotName: "top", x: 30, y: 100, accepts: "top" },
    { slotName: "bottom", x: 30, y: 130, accepts: "bottom" },
    { slotName: "shoes", x: 30, y: 160, accepts: "shoes" },
    { slotName: "gloves", x: 190, y: 100, accepts: "gloves" },
    { slotName: "weapon", x: 190, y: 140, accepts: "weapon" }
  ];

  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8).setOrigin(0.5).setInteractive();
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

  // Handle item drop
  scene.input.on("drop", (pointer, gameObject, dropZone) => {
    if (!dropZone || !dropZone.accepts || !gameObject.itemType) return;
    if (dropZone.accepts === gameObject.itemType) {
      const icon = scene.add.image(dropZone.x, dropZone.y, gameObject.itemKey)
        .setOrigin(0.5)
        .setScale(1.2);
      equipmentContainer.add(icon);
      console.log(`Equipped ${gameObject.itemKey} to ${dropZone.slotName}`);
    }
  });

  // Toggle
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    equipmentTitleBar.setVisible(equipmentOpen);
    equipmentCloseButton.setVisible(equipmentOpen);

    const pos = equipmentContainer.getBounds();
    equipmentTitleBar.setPosition(pos.x, pos.y - 20);
    equipmentCloseButton.setPosition(pos.x + 240, pos.y - 20);
  });
}
