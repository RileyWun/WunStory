let inventoryContainer;
let inventoryOpen = false;
let invTitleBar, invCloseBtn;

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
  const W = 200, H = 200;
  inventoryContainer = scene.add.container(100, 120)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false)
    .setSize(W, H);

  // Background under title bar
  const bg = scene.add.rectangle(0, 20, W, H - 20, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Title bar (hidden initially)
  invTitleBar = scene.add.rectangle(0, 0, W, 20, 0x111111)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);
  inventoryContainer.add(invTitleBar);
  scene.input.setDraggable(invTitleBar);

  // Close button (hidden initially)
  invCloseBtn = scene.add.text(W - 20, 2, "✖", {
    fontSize: "14px", fill: "#fff",
    backgroundColor: "#900", padding: { left:4, right:4, top:1, bottom:1 }
  })
    .setOrigin(0)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);
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

  // Populate items with manual double-click detection
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const spr = scene.add.image(x, y, item.key)
      .setOrigin(0).setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    spr.itemKey  = item.key;
    spr.itemType = item.type;
    scene.input.setDraggable(spr);
    spr.on("dragstart", () => spr.setScale(1.3));
    spr.on("dragend",   () => spr.setScale(1.2));

    // Manual double-click
    let clicks = 0;
    spr.on("pointerdown", () => {
      clicks++;
      if (clicks === 2) {
        if (item.type === "potion") {
          console.log(`Used ${itemData[item.key].name}`);
        } else {
          window.applyEquip && window.applyEquip(item.key, item.type);
        }
        clicks = 0;
      }
      scene.time.delayedCall(300, () => { clicks = 0; });
    });

    inventoryContainer.add(spr);
  });

  // Toggle panel with I
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
