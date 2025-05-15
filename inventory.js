let inventoryContainer;
let inventoryOpen = false;
let titleBar, closeButton;
let items = [
  { key: "item_hat_red", type: "hat" },
  { key: "item_potion", type: "potion" },
  { key: "item_top_blue", type: "top" },
  { key: "item_sword", type: "weapon" }
];

const itemData = {
  "item_hat_red": { name: "Red Hat", type: "hat" },
  "item_potion": { name: "Health Potion", type: "potion" },
  "item_top_blue": { name: "Blue Shirt", type: "top" },
  "item_sword": { name: "Sword", type: "weapon" }
};

function initInventoryUI(scene) {
  // Create container
  inventoryContainer = scene.add.container(100, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  const width = 200, height = 200;
  inventoryContainer.setSize(width, height);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, width, height - 20, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Title bar
  titleBar = scene.add.rectangle(0, 0, width, 20, 0x111111)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  inventoryContainer.add(titleBar);

  // Close button
  closeButton = scene.add.text(width - 20, 2, "✖", {
    fontSize: "14px", fill: "#fff", backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  inventoryContainer.add(closeButton);

  closeButton.on("pointerdown", () => {
    inventoryOpen = false;
    inventoryContainer.setVisible(false);
    titleBar.setVisible(false);
    closeButton.setVisible(false);
  });

  // Dragging logic
  scene.input.setDraggable(titleBar);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      inventoryContainer.setPosition(dragX, dragY + 20);
      titleBar.setPosition(dragX, dragY);
      closeButton.setPosition(dragX + width - 20, dragY);
    }
  });

  // Render items
  items.forEach((item, i) => {
    const sprite = scene.add.image(20 + (i % 4) * 45, 30 + Math.floor(i / 4) * 45, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    sprite.itemKey = item.key;
    sprite.itemType = item.type;

    // Enable dragging
    scene.input.setDraggable(sprite);

    sprite.on("dragstart", () => sprite.setScale(1.3));
    sprite.on("dragend", () => sprite.setScale(1.2));

    // Double-click detection
    sprite.on("pointerup", (pointer) => {
      if (pointer.event.detail === 2) {
        if (item.type === "potion") {
          console.log(`Used ${itemData[item.key].name}`);
        } else {
          attemptEquip(item.key, item.type);
        }
      }
    });

    inventoryContainer.add(sprite);
  });

  // Toggle inventory
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    titleBar.setVisible(inventoryOpen);
    closeButton.setVisible(inventoryOpen);

    if (inventoryOpen) {
      const pos = inventoryContainer.getBounds();
      titleBar.setPosition(pos.x, pos.y - 20);
      closeButton.setPosition(pos.x + width - 20, pos.y - 20);
    }
  });
}

function attemptEquip(itemKey, itemType) {
  if (!window.equipmentSlots) return;
  window.equipmentSlots.forEach(slot => {
    if (slot.accepts === itemType) {
      slot.setTextures && slot.setTextures(itemKey); // if zone supports texture
      console.log(`Equipped ${itemKey} to ${slot.slotName}`);
    }
  });
}
