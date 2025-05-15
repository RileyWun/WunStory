
let equipmentContainer;
let equipmentOpen = false;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  equipmentContainer = scene.add.container(350, 120).setScrollFactor(0).setDepth(10).setVisible(false);
  equipmentContainer.setSize(260, 300);

  const bg = scene.add.rectangle(0, 0, 260, 300, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Title bar inside the container
  const titleBar = scene.add.rectangle(0, 0, 260, 20, 0x111111).setOrigin(0).setInteractive();
  equipmentContainer.add(titleBar);
  scene.input.setDraggable(titleBar);

  const closeButton = scene.add.text(240, 2, "✖", {
    fontSize: "14px", fill: "#fff", backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  equipmentContainer.add(closeButton);

  closeButton.on("pointerdown", () => {
    equipmentContainer.setVisible(false);
    equipmentOpen = false;
  });

  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      equipmentContainer.setPosition(dragX, dragY);
    }
  });

  // Simulated character preview
  const preview = scene.add.rectangle(130, 120, 40, 60, 0xaaaaaa).setOrigin(0.5);
  equipmentContainer.add(preview);

  const slots = [
    { slotName: "hat", x: 130, y: 30, accepts: "hat" },
    { slotName: "face", x: 130, y: 55, accepts: "face" },
    { slotName: "top", x: 40, y: 100, accepts: "top" },
    { slotName: "bottom", x: 40, y: 130, accepts: "bottom" },
    { slotName: "shoes", x: 40, y: 160, accepts: "shoes" },
    { slotName: "gloves", x: 210, y: 100, accepts: "gloves" },
    { slotName: "weapon", x: 210, y: 140, accepts: "weapon" }
  ];

  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8).setOrigin(0.5).setInteractive();
    zone.slotName = slot.slotName;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y + 18, slot.slotName.toUpperCase(), {
      fontSize: "10px",
      fill: "#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  // Handle item drop into slot
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

  // Toggle with E key
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
  });
}
