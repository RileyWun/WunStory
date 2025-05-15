
let inventoryContainer;
let inventoryOpen = false;
let titleBar, closeButton;

function initInventoryUI(scene) {
  inventoryContainer = scene.add.container(100, 100).setScrollFactor(0).setDepth(10).setVisible(false);
  inventoryContainer.setSize(200, 200);

  const bg = scene.add.rectangle(0, 20, 200, 180, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  const items = ["item_sword", "item_potion", "item_shirt"];
  items.forEach((key, i) => {
    const icon = scene.add.image(20 + (i % 4) * 45, 40 + Math.floor(i / 4) * 45, key)
      .setOrigin(0)
      .setScale(1.2);
    inventoryContainer.add(icon);
  });

  // Title bar
  titleBar = scene.add.rectangle(100, 100, 200, 20, 0x111111, 1).setOrigin(0).setInteractive();
  titleBar.setDepth(999).setScrollFactor(0);
  scene.input.setDraggable(titleBar);
  titleBar.input && (titleBar.input.cursor = 'pointer');

  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      inventoryContainer.setPosition(dragX, dragY);
      titleBar.setPosition(dragX, dragY);
      closeButton.setPosition(dragX + 180, dragY);
    }
  });

  // Close button
  closeButton = scene.add.text(280, 100, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  closeButton.setDepth(999).setScrollFactor(0);

  closeButton.on("pointerdown", () => {
    console.log("✖ clicked");
    inventoryContainer.setVisible(false);
    titleBar.setVisible(false);
    closeButton.setVisible(false);
    inventoryOpen = false;
  });

  // Toggle inventory panel
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    titleBar.setVisible(inventoryOpen);
    closeButton.setVisible(inventoryOpen);

    const pos = inventoryContainer.getBounds();
    titleBar.setPosition(pos.x, pos.y);
    closeButton.setPosition(pos.x + 180, pos.y);
  });
}
