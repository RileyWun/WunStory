
let equipmentContainer;
let equipmentOpen = false;
let equipTitleBar, equipCloseButton;

function initEquipmentUI(scene) {
  equipmentContainer = scene.add.container(350, 120).setScrollFactor(0).setDepth(10).setVisible(false);
  equipmentContainer.setSize(220, 260);

  const bg = scene.add.rectangle(0, 0, 220, 260, 0x1c1c1c, 0.95).setOrigin(0);
  equipmentContainer.add(bg);

  // Player preview (mock sprite)
  const playerPreview = scene.add.rectangle(110, 100, 40, 60, 0xaaaaaa, 1).setOrigin(0.5);
  equipmentContainer.add(playerPreview);

  // Equipment slot labels (could be images later)
  const slots = [
    { label: "Hat", x: 110, y: 10 },
    { label: "Face", x: 110, y: 35 },
    { label: "Top", x: 30, y: 100 },
    { label: "Bottom", x: 30, y: 130 },
    { label: "Shoes", x: 30, y: 160 },
    { label: "Gloves", x: 190, y: 100 },
    { label: "Weapon", x: 190, y: 140 }
  ];

  slots.forEach(slot => {
    const text = scene.add.text(slot.x, slot.y, slot.label, {
      fontSize: "12px", fill: "#fff"
    }).setOrigin(0.5);
    equipmentContainer.add(text);
  });

  // Title bar (drag area)
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

  // Close button
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

  // Toggle panel with E key
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
