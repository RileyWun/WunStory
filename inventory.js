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
  // Main container
  inventoryContainer = scene.add.container(100, 120)
    .setScrollFactor(0).setDepth(10).setVisible(false);
  // Background
  const bg = scene.add.rectangle(0, 0, W, H, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Populate items
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
    spr.on("pointerup", (pointer) => {
      if (pointer.event.detail === 2) {
        if (item.type === "potion") {
          console.log(`Used ${itemData[item.key].name}`);
        } else {
          window.applyEquip && window.applyEquip(item.key, item.type);
        }
      }
    });
    inventoryContainer.add(spr);
  });

  // Title bar
  invTitleBar = scene.add.rectangle(100, 120, W, 20, 0x111111)
    .setOrigin(0).setDepth(11).setScrollFactor(0)
    .setInteractive({ useHandCursor: true });
  scene.input.setDraggable(invTitleBar);

  // Close button
  invCloseBtn = scene.add.text(100 + W - 20, 120, "✖", {
    fontSize:"14px", fill:"#fff",
    backgroundColor:"#900", padding:{left:4,right:4,top:1,bottom:1}
  }).setOrigin(0).setDepth(11).setScrollFactor(0)
    .setInteractive({ useHandCursor: true });
  invCloseBtn.on("pointerdown", () => {
    inventoryOpen = false;
    inventoryContainer.setVisible(false);
    invTitleBar.setVisible(false);
    invCloseBtn.setVisible(false);
  });

  // Drag logic
  scene.input.on("drag", (p, go, dragX, dragY) => {
    if (go === invTitleBar) {
      invTitleBar.setPosition(dragX, dragY);
      invCloseBtn.setPosition(dragX + W - 20, dragY);
      inventoryContainer.setPosition(dragX, dragY + 20);
    }
  });

  // Toggle inventory
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
