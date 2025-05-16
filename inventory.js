
let inventoryContainer;
let inventoryOpen = false;
let inventoryTitleBar, inventoryCloseBtn;

const inventoryItems = [
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
  const W = 200, H = 200;
  inventoryContainer = scene.add.container(100, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  inventoryContainer.setSize(W, H);

  // Title bar
  inventoryTitleBar = scene.add.rectangle(0, 0, W, 20, 0x111111)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  inventoryContainer.add(inventoryTitleBar);

  // Close button
  inventoryCloseBtn = scene.add.text(W - 20, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  inventoryContainer.add(inventoryCloseBtn);
  inventoryCloseBtn.on("pointerdown", () => {
    inventoryOpen = false;
    inventoryContainer.setVisible(false);
    inventoryTitleBar.setVisible(false);
    inventoryCloseBtn.setVisible(false);
  });

  // Background
  const bg = scene.add.rectangle(0, 20, W, H - 20, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Dragging logic
  scene.input.setDraggable(inventoryTitleBar);
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === inventoryTitleBar) {
      inventoryContainer.setPosition(dragX, dragY + 20);
      inventoryTitleBar.setPosition(dragX, dragY);
      inventoryCloseBtn.setPosition(dragX + W - 20, dragY);
    }
  });

  // Items
  inventoryItems.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const sprite = scene.add.image(x, y, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    sprite.itemKey = item.key;
    sprite.itemType = item.type;
    scene.input.setDraggable(sprite);
    sprite.on("dragstart", () => sprite.setScale(1.3));
    sprite.on("dragend", () => sprite.setScale(1.2));
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

  // Toggle with I
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    inventoryTitleBar.setVisible(inventoryOpen);
    inventoryCloseBtn.setVisible(inventoryOpen);
    if (inventoryOpen) {
      const b = inventoryContainer.getBounds();
      inventoryTitleBar.setPosition(b.x, b.y - 20);
      inventoryCloseBtn.setPosition(b.x + W - 20, b.y - 20);
    }
  });
}

function attemptEquip(itemKey, itemType) {
  if (!window.equipmentSlots) return;
  window.equipmentSlots.forEach(slot => {
    if (slot.accepts === itemType) {
      if (slot.setTexture) slot.setTexture(itemKey);
      console.log(`Equipped ${itemKey} to ${slot.slotName}`);
    }
  });
}
