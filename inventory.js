
let inventoryContainer;
let inventoryOpen = false;
let titleBar, closeButton;

function initInventoryUI(scene) {
  inventoryContainer = scene.add.container(100, 100).setScrollFactor(0).setDepth(10).setVisible(false);
  inventoryContainer.setSize(200, 200);

  // Panel background
  const bg = scene.add.rectangle(0, 20, 200, 180, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Title bar (drag zone)
  titleBar = scene.add.rectangle(0, 0, 200, 20, 0x111111, 1).setOrigin(0).setInteractive();
  inventoryContainer.add(titleBar);

  // Close button on title bar
  closeButton = scene.add.text(180, 0, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  inventoryContainer.add(closeButton);

  closeButton.on("pointerdown", () => {
    inventoryContainer.setVisible(false);
    inventoryOpen = false;
  });

  // Drag the entire panel by the title bar only
  scene.input.setDraggable(titleBar);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      inventoryContainer.setPosition(dragX, dragY);
    }
  });

  // Item icons (static mock)
  const items = ["item_sword", "item_potion", "item_shirt"];
  items.forEach((key, i) => {
    const icon = scene.add.image(20 + (i % 4) * 45, 40 + Math.floor(i / 4) * 45, key)
      .setOrigin(0)
      .setScale(1.2);
    inventoryContainer.add(icon);
  });

  // Toggle visibility with I key
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
  });
}
