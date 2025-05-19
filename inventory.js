// inventory.js

function initInventoryUI(scene) {
  const INV_X = 100, INV_Y = 120, INV_W = 200, INV_H = 200;
  let inventoryOpen = false;

  // ---- Container for the inventory body (below the title bar) ----
  const invContent = scene.add.container(INV_X, INV_Y + 20)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);

  const bg = scene.add.rectangle(0, 0, INV_W, INV_H, 0x222222, 0.95)
    .setOrigin(0);
  invContent.add(bg);

  // ---- Item definitions ----
  const items = [
    { key: "item_hat_red",  type: "hat"    },
    { key: "item_potion",   type: "potion" },
    { key: "item_top_blue", type: "top"    },
    { key: "item_sword",    type: "weapon" }
  ];

  // ---- Create icons inside invContent ----
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const icon = scene.add.image(x, y, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    icon.itemKey  = item.key;
    icon.itemType = item.type;

    // Drag within the panel
    scene.input.setDraggable(icon);
    icon.on("drag", (pointer, dragX, dragY) => {
      icon.x = dragX - invContent.x;
      icon.y = dragY - invContent.y;
    });
    icon.on("dragstart", () => icon.setScale(1.3));
    icon.on("dragend",   () => icon.setScale(1.2));

    // Double-click to equip/use
    icon.lastClick = 0;
    icon.on("pointerdown", () => {
      const now = Date.now();
      if (now - icon.lastClick < 300) {
        if (icon.itemType === "potion") {
          console.log(`Used potion: ${icon.itemKey}`);
        } else {
          window.applyEquip && window.applyEquip(icon.itemKey, icon.itemType);
        }
      }
      icon.lastClick = now;
    });

    invContent.add(icon);
  });

  // ---- Title bar (above the body) ----
  const invTitleBar = scene.add.rectangle(
    INV_X, INV_Y, INV_W, 20, 0x111111
  )
  .setOrigin(0)
  .setDepth(11)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);

  // ---- Close button ----
  const invCloseBtn = scene.add.text(
    INV_X + INV_W - 20, INV_Y, "✖", {
      fontSize: "14px",
      fill: "#fff",
      backgroundColor: "#900",
      padding: { left:4, right:4, top:1, bottom:1 }
    }
  )
  .setOrigin(0)
  .setDepth(11)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);

  // Clicking ✖ closes everything
  invCloseBtn.on("pointerdown", () => {
    inventoryOpen = false;
    invContent.setVisible(false);
    invTitleBar.setVisible(false);
    invCloseBtn.setVisible(false);
  });

  // ---- Drag logic for the title bar ----
  scene.input.setDraggable(invTitleBar);
  let dragOffsetX = 0, dragOffsetY = 0;

  invTitleBar.on("dragstart", (pointer, dragX, dragY) => {
    // record offset so the panel doesn't jump
    dragOffsetX = dragX - invContent.x;
    dragOffsetY = dragY - invContent.y;
  });

  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === invTitleBar) {
      const nx = dragX - dragOffsetX;
      const ny = dragY - dragOffsetY;
      invContent.setPosition(nx, ny + 20);
      invTitleBar.setPosition(nx, ny);
      invCloseBtn.setPosition(nx + INV_W - 20, ny);
    }
  });

  // ---- Toggle with the "I" key ----
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    invContent.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
