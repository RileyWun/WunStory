
let inventoryContainer;
let inventoryOpen = false;
let closeButton;

function initInventoryUI(scene) {
  inventoryContainer = scene.add.container(100, 100).setScrollFactor(0).setDepth(10).setVisible(false);
  inventoryContainer.setSize(200, 200);
  inventoryContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 200), Phaser.Geom.Rectangle.Contains);

  scene.input.setDraggable(inventoryContainer);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === inventoryContainer) {
      inventoryContainer.setPosition(dragX, dragY);
      closeButton.setPosition(dragX + 180, dragY); // sync close button position
    }
  });

  const bg = scene.add.rectangle(0, 0, 200, 200, 0x222222, 0.9).setOrigin(0);
  inventoryContainer.add(bg);

  // Add item icons
  const items = ["item_sword", "item_potion", "item_shirt"];
  items.forEach((key, i) => {
    const icon = scene.add.image(20 + (i % 4) * 45, 40 + Math.floor(i / 4) * 45, key)
      .setOrigin(0)
      .setScale(1.2);
    inventoryContainer.add(icon);
  });

  // Close button outside the container
  closeButton = scene.add.text(280, 100, "✖", {
    fontSize: "16px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 5, right: 5, top: 2, bottom: 2 }
  }).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(11).setVisible(false);

  closeButton.on("pointerdown", () => {
    console.log("✖ clicked");
    inventoryContainer.setVisible(false);
    closeButton.setVisible(false);
    inventoryOpen = false;
  });

  // Toggle inventory with I
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    closeButton.setVisible(inventoryOpen);

    // Reposition close button on toggle
    const pos = inventoryContainer.getBounds();
    closeButton.setPosition(pos.x + 180, pos.y);
  });
}
