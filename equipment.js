
let equipmentContainer;
let equipmentOpen = false;
let equipTitleBar, equipCloseButton;
window.equipmentSlots = [];

function initEquipmentUI(scene) {
  equipmentContainer = scene.add.container(350, 120).setScrollFactor(0).setDepth(10).setVisible(false);
  equipmentContainer.setSize(220, 260);

  const bg = scene.add.rectangle(0, 0, 220, 260, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  const playerPreview = scene.add.rectangle(110, 100, 40, 60, 0xaaaaaa, 1).setOrigin(0.5);
  equipmentContainer.add(playerPreview);

  const slots = [
    { slotName: "hat", x: 110, y: 10, accepts: "hat" },
    { slotName: "face", x: 110, y: 35, accepts: "face" },
    { slotName: "top", x: 30, y: 100, accepts: "top" },
    { slotName: "bottom", x: 30, y: 130, accepts: "bottom" },
    { slotName: "shoes", x: 30, y: 160, accepts: "shoes" },
    { slotName: "gloves", x: 190, y: 100, accepts: "gloves" },
    { slotName: "weapon", x: 190, y: 140, accepts: "weapon" }
  ];

  slots.forEach(slot => {
    const zone = scene.add.rectangle(slot.x, slot.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive();
    zone.slotName = slot.slotName;
    zone.accepts = slot.accepts;
    zone.input.dropZone = true;

    scene.input.setDraggable(zone);
    equipmentContainer.add(zone);
    window.equipmentSlots.push(zone);

    const label = scene.add.text(slot.x, slot.y + 20, slot.slotName.toUpperCase(), {
      fontSize: "10px", fill: "#ccc"
    }).setOrigin(0.5);
    equipmentContainer.add(label);
  });

  equipTitleBar = scene.add.rectangle(350, 100, 220, 20, 0x111111, 1).setOrigin(0).setInteractive();
  equipTitleBar.setDepth(999).setScrollFactor(0).setVisible(false);
  scene.input.setDraggable(equipTitleBar);
  equipTitleBar.input && (equipTitleBar.input.cursor = 'pointer');

  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === equipTitleBar) {
      equipmentContainer.setPosition(dragX, dragY + 20);
      equipTitleBar.setPosition(dragX, dragY);
      equipCloseButton.setPosition(dragX + 200, dragY);
    }
  });

  equipCloseButton = scene.add.text(550, 100, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  equipCloseButton.setDepth(999).setScrollFactor(0).setVisible(false);

  equipCloseButton.on("pointerdown", () => {
    equipmentContainer.setVisible(false);
    equipTitleBar.setVisible(false);
    equipCloseButton.setVisible(false);
    equipmentOpen = false;
  });

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

  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    equipTitleBar.setVisible(equipmentOpen);
    equipCloseButton.setVisible(equipmentOpen);

    const pos = equipmentContainer.getBounds();
    equipTitleBar.setPosition(pos.x, pos.y - 20);
    equipCloseButton.setPosition(pos.x + 200, pos.y - 20);
  });
}
