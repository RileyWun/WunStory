
let inventoryContainer;
let inventoryOpen = false;

function initInventoryUI(scene) {
  inventoryContainer = scene.add.container(100, 100).setScrollFactor(0).setDepth(10).setVisible(false);
  inventoryContainer.setSize(200, 200);
  inventoryContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 200), Phaser.Geom.Rectangle.Contains);

  scene.input.setDraggable(inventoryContainer);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === inventoryContainer) {
      inventoryContainer.setPosition(dragX, dragY);
    }
  });

  const bg = scene.add.rectangle(0, 0, 200, 200, 0x222222, 0.9).setOrigin(0);
  inventoryContainer.add(bg);

const closeButton = scene.add.text(180, 0, "✖", {
  fontSize: "16px",
  fill: "#fff",
  backgroundColor: "#900",
  padding: { left: 5, right: 5, top: 2, bottom: 2 }
}).setOrigin(0).setInteractive({ useHandCursor: true });

closeButton.setDepth(999); // Ensure it's above other UI elements

closeButton.on("pointerdown", () => {
  console.log("Close button clicked");
  inventoryContainer.setVisible(false);
  inventoryOpen = false;
});

  inventoryContainer.add(closeButton);

  // Example items
  const items = ["item_sword", "item_potion", "item_shirt"];
  items.forEach((key, i) => {
    const icon = scene.add.image(20 + (i % 4) * 45, 40 + Math.floor(i / 4) * 45, key)
      .setOrigin(0)
      .setScale(1.2);
    inventoryContainer.add(icon);
  });

  // Toggle inventory with I
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
  });
}
