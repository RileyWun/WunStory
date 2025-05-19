// inventory.js

let inventoryContainer;
let inventoryOpen = false;
let invTitleBar, invCloseBtn;

const INV_X = 100, INV_Y = 120, INV_W = 200, INV_H = 200;

// Use your item image keys here
const items = [
  { key: "item_hat_red",   type: "hat"    },
  { key: "item_potion",    type: "potion" },
  { key: "item_top_blue",  type: "top"    },
  { key: "item_sword",     type: "weapon" }
];

function initInventoryUI(scene) {
  // Main panel container
  inventoryContainer = scene.add.container(INV_X, INV_Y)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  inventoryContainer.setSize(INV_W, INV_H);

  // Panel background
  const bg = scene.add.rectangle(0, 0, INV_W, INV_H, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Create item icons
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const icon = scene.add.image(x, y, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setInteractive({ draggable: true, useHandCursor: true });
    icon.itemKey  = item.key;
    icon.itemType = item.type;

    // Drag behavior
    scene.input.setDraggable(icon);
    icon.on('dragstart', () => icon.setScale(1.3));
    icon.on('dragend',   () => icon.setScale(1.2));
    icon.on('drag',      (pointer, dragX, dragY) => {
      icon.x = dragX - inventoryContainer.x;
      icon.y = dragY - inventoryContainer.y;
    });

    // Double-click to equip/use
    icon.lastClick = 0;
    icon.on('pointerdown', () => {
      const now = Date.now();
      if (now - icon.lastClick < 300) {
        if (icon.itemType === 'potion') {
          console.log(`Used potion: ${icon.itemKey}`);
        } else {
          window.applyEquip && window.applyEquip(icon.itemKey, icon.itemType);
        }
      }
      icon.lastClick = now;
    });

    inventoryContainer.add(icon);
  });

  // Title bar
  invTitleBar = scene.add.rectangle(
    INV_X, INV_Y - 20, INV_W, 20,
    0x111111
  )
  .setOrigin(0)
  .setDepth(11)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);
  scene.input.setDraggable(invTitleBar);

  // Close button
  invCloseBtn = scene.add.text(
    INV_X + INV_W - 20, INV_Y - 20, "✖", {
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
  invCloseBtn.on('pointerdown', () => {
    inventoryOpen = false;
    inventoryContainer.setVisible(false);
    invTitleBar.setVisible(false);
    invCloseBtn.setVisible(false);
  });

  // Dragging the title bar
  scene.input.on('drag', (pointer, go, dragX, dragY) => {
    if (go === invTitleBar) {
      invTitleBar.setPosition(dragX, dragY);
      invCloseBtn.setPosition(dragX + INV_W - 20, dragY);
      inventoryContainer.setPosition(dragX, dragY + 20);
    }
  });

  // Toggle with "I"
  const keyI = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  keyI.on('down', () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
