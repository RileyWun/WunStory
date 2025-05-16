let inventoryContainer;
let inventoryOpen = false;
let invTitleBar, invCloseBtn;

const INV_X = 100;
const INV_Y = 120;
const INV_W = 200;
const INV_H = 200;

const items = [
  { key: "item_hat_red", type: "hat" },
  { key: "item_potion",  type: "potion" },
  { key: "item_top_blue", type: "top" },
  { key: "item_sword",    type: "weapon" }
];

function initInventoryUI(scene) {
  // Main panel
  inventoryContainer = scene.add
    .container(INV_X, INV_Y)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false)
    .setSize(INV_W, INV_H);

  // Background under title bar
  const bg = scene.add
    .rectangle(0, 0, INV_W, INV_H, 0x222222, 0.95)
    .setOrigin(0);
  inventoryContainer.add(bg);

  // Populate items
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const spr = scene.add
      .image(x, y, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    spr.itemKey  = item.key;
    spr.itemType = item.type;

    // draggable visuals
    scene.input.setDraggable(spr);
    spr.on("dragstart", () => spr.setScale(1.3));
    spr.on("dragend",   () => spr.setScale(1.2));

    // manual double-click on pointerup
    spr.lastClickTime = 0;
    spr.on("pointerup", () => {
      const now = Date.now();
      if (now - spr.lastClickTime < 300) {
        // double-click detected
        if (item.type === "potion") {
          console.log(`Used ${item.key}`);
        } else {
          window.applyEquip && window.applyEquip(item.key, item.type);
        }
        spr.lastClickTime = 0;
      } else {
        spr.lastClickTime = now;
      }
    });

    inventoryContainer.add(spr);
  });

  // Title bar (20px high strip above panel)
  invTitleBar = scene.add
    .rectangle(INV_X, INV_Y - 20, INV_W, 20, 0x111111)
    .setOrigin(0)
    .setDepth(11)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);
  scene.input.setDraggable(invTitleBar);

  // Close button
  invCloseBtn = scene.add
    .text(INV_X + INV_W - 20, INV_Y - 20, "✖", {
      fontSize:"14px", fill:"#fff",
      backgroundColor:"#900", padding:{left:4,right:4,top:1,bottom:1}
    })
    .setOrigin(0)
    .setDepth(11)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);
  invCloseBtn.on("pointerdown", () => {
    inventoryOpen = false;
    inventoryContainer.setVisible(false);
    invTitleBar.setVisible(false);
    invCloseBtn.setVisible(false);
  });

  // Drag handler moves entire panel
  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === invTitleBar) {
      invTitleBar.setPosition(dragX, dragY);
      invCloseBtn.setPosition(dragX + INV_W - 20, dragY);
      inventoryContainer.setPosition(dragX, dragY + 20);
    }
  });

  // Toggle with "I"
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
