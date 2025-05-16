let inventoryContainer;
let inventoryOpen = false;
const INVENTORY_KEY = 'I';
const invStartX = 100, invStartY = 120;
const INV_W = 200, INV_H = 200;

const items = [
  { key: "item_hat_red", type: "hat" },
  { key: "item_potion", type: "potion" },
  { key: "item_top_blue", type: "top" },
  { key: "item_sword", type: "weapon" }
];

const itemData = {
  "item_hat_red": { name: "Red Hat", type: "hat" },
  "item_potion":  { name: "Health Potion", type: "potion" },
  "item_top_blue": { name: "Blue Shirt", type: "top" },
  "item_sword":   { name: "Sword", type: "weapon" }
};

function initInventoryUI(scene) {
  inventoryContainer = scene.add.container(invStartX, invStartY)
    .setScrollFactor(0).setDepth(10).setVisible(false);
  inventoryContainer.setSize(INV_W, INV_H);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, INV_W, INV_H - 20, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Title bar (drag handle)
  const titleBar = scene.add.rectangle(0, 0, INV_W, 20, 0x111111)
    .setOrigin(0).setInteractive({ useHandCursor: true });
  inventoryContainer.add(titleBar);
  scene.input.setDraggable(titleBar);

  // Close button
  const closeBtn = scene.add.text(INV_W - 20, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left:4, right:4, top:1, bottom:1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  inventoryContainer.add(closeBtn);
  closeBtn.on("pointerdown", () => {
    inventoryContainer.setVisible(false);
    inventoryOpen = false;
  });

  // Dragging logic
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      inventoryContainer.setPosition(dragX, dragY);
    }
  });

  // Populate items
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const sprite = scene.add.image(x, y, item.key)
      .setOrigin(0).setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    sprite.itemKey = item.key;
    sprite.itemType = item.type;

    // Enable dragging
    scene.input.setDraggable(sprite);
    sprite.on("dragstart", () => sprite.setScale(1.3));
    sprite.on("dragend",   () => sprite.setScale(1.2));

    // Double-click to equip/use
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

  // Toggle inventory with I
  scene.input.keyboard.on(`keydown-${INVENTORY_KEY}`, () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
  });
}

function attemptEquip(itemKey, itemType) {
  if (!window.equipmentSlots) return;
  window.equipmentSlots.forEach(slot => {
    if (slot.accepts === itemType && typeof slot.setTexture === "function") {
      slot.setTexture(itemKey);
      console.log(`Equipped ${itemKey} to ${slot.slotName}`);
    }
  });
}
