// inventory.js

let inventoryContainer;
let inventoryOpen = false;
let invTitleBar, invCloseBtn;
let invDragOffsetX = 0, invDragOffsetY = 0;

const INV_X = 100, INV_Y = 120, INV_W = 200, INV_H = 200;
const items = [
  { key: "item_hat_red",  type: "hat"    },
  { key: "item_potion",   type: "potion" },
  { key: "item_top_blue", type: "top"    },
  { key: "item_sword",    type: "weapon" }
];

function initInventoryUI(scene) {
  // ── 1) Container for background + icons ──────────────────────────────
  inventoryContainer = scene.add.container(INV_X, INV_Y)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  inventoryContainer.setSize(INV_W, INV_H);

  // Background under the title-bar
  const bg = scene.add.rectangle(0, 20, INV_W, INV_H - 20, 0x222222, 0.95)
    .setOrigin(0);
  inventoryContainer.add(bg);

  // Populate icons *inside* the container
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const icon = scene.add.image(x, y, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    icon.itemKey  = item.key;
    icon.itemType = item.type;

    // Drag within container
    scene.input.setDraggable(icon);
    icon.on("drag", (pointer, dragX, dragY) => {
      icon.x = dragX - inventoryContainer.x;
      icon.y = dragY - inventoryContainer.y;
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

    inventoryContainer.add(icon);
  });

  // ── 2) Title-bar (outside the container) ─────────────────────────────
  invTitleBar = scene.add.rectangle(
    INV_X, INV_Y - 20, INV_W, 20, 0x111111
  )
  .setOrigin(0)
  .setDepth(11)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);
  scene.input.setDraggable(invTitleBar);

  // When drag starts, record offset from container origin
  invTitleBar.on("dragstart", (pointer, dragX, dragY) => {
    invDragOffsetX = dragX - inventoryContainer.x;
    invDragOffsetY = dragY - inventoryContainer.y;
  });

  // ── 3) Close button ────────────────────────────────────────────────
  invCloseBtn = scene.add.text(
    INV_X + INV_W - 20, INV_Y - 20, "✖", {
      fontSize:"14px", fill:"#fff",
      backgroundColor:"#900",
      padding:{ left:4, right:4, top:1, bottom:1 }
    }
  )
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

  // ── 4) Drag handler: move container and chrome together ────────────
  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === invTitleBar) {
      const nx = dragX - invDragOffsetX;
      const ny = dragY - invDragOffsetY;
      inventoryContainer.setPosition(nx, ny);
      invTitleBar.setPosition(nx, ny - 20);
      invCloseBtn.setPosition(nx + INV_W - 20, ny - 20);
    }
  });

  // ── 5) Toggle with I ────────────────────────────────────────────────
  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
