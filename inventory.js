// inventory.js

let inventoryContainer;
let inventoryOpen = false;
let invTitleBar, invCloseBtn;

const items = [
  { key: "item_hat_red",   type: "hat"    },
  { key: "item_potion",    type: "potion" },
  { key: "item_top_blue",  type: "top"    },
  { key: "item_sword",     type: "weapon" }
];

function initInventoryUI(scene) {
  const W = 200, H = 200;

  // Main panel container
  inventoryContainer = scene.add.container(100, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  inventoryContainer.setSize(W, H);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, W, H - 20, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Title bar (drag handle)
  invTitleBar = scene.add.rectangle(0, 0, W, 20, 0x111111)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  inventoryContainer.add(invTitleBar);
  scene.input.setDraggable(invTitleBar);

  // Close button
  invCloseBtn = scene.add.text(W - 20, 2, "✖", {
    fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0)
    .setInteractive({ useHandCursor: true });
  inventoryContainer.add(invCloseBtn);
  invCloseBtn.on("pointerdown", () => {
    inventoryOpen = false;
    inventoryContainer.setVisible(false);
    invTitleBar.setVisible(false);
    invCloseBtn.setVisible(false);
  });

  // Dragging logic
  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === invTitleBar) {
      invTitleBar.setPosition(dragX, dragY);
      invCloseBtn.setPosition(dragX + W - 20, dragY);
      inventoryContainer.setPosition(dragX, dragY + 20);
    }
  });

  // Populate items
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const sprite = scene.add.image(x, y, item.key)
      .setOrigin(0)
      .setScale(1.2)
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
          console.log(`Used ${item.key}`);
        } else {
          window.applyEquip && window.applyEquip(item.key, item.type);
        }
      }
    });

    inventoryContainer.add(sprite);
  });

  // Toggle inventory with I
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
