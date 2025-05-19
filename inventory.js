// inventory.js

let inventoryContainer;
let inventoryOpen = false;
let invTitleBar, invCloseBtn;

const INV_X = 100, INV_Y = 120, INV_W = 200, INV_H = 200;

// Four items: frame index + type
const items = [
  { frame: 0, type: "hat"    },
  { frame: 1, type: "potion" },
  { frame: 2, type: "top"    },
  { frame: 3, type: "weapon" }
];

function initInventoryUI(scene) {
  // Main panel container
  inventoryContainer = scene.add.container(INV_X, INV_Y)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  inventoryContainer.setSize(INV_W, INV_H);

  // Background
  const bg = scene.add.rectangle(0, 0, INV_W, INV_H, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  // Create draggable item sprites from your character sheet
  items.forEach((item, i) => {
    const x = 10 + (i % 4) * 45;
    const y = 30 + Math.floor(i / 4) * 45;
    const spr = scene.add.sprite(x, y, 'character', item.frame)
      .setOrigin(0)
      .setScale(1.5)
      .setInteractive({ draggable: true, useHandCursor: true });

    spr.itemFrame = item.frame;
    spr.itemType  = item.type;

    // Enable dragging and reposition sprite relative to the panel
    scene.input.setDraggable(spr);
    spr.on('dragstart', () => spr.setScale(1.7));
    spr.on('dragend',   () => spr.setScale(1.5));
    spr.on('drag',      (pointer, dragX, dragY) => {
      spr.x = dragX - inventoryContainer.x;
      spr.y = dragY - inventoryContainer.y;
    });

    // Manual double-click to equip/use
    spr.lastClick = 0;
    spr.on('pointerdown', () => {
      const now = Date.now();
      if (now - spr.lastClick < 300) {
        if (spr.itemType === 'potion') {
          console.log(`Used potion: frame ${spr.itemFrame}`);
        } else {
          window.applyEquip && window.applyEquip(spr.itemFrame, spr.itemType);
        }
      }
      spr.lastClick = now;
    });

    inventoryContainer.add(spr);
  });

  // Title bar (hidden initially)
  invTitleBar = scene.add.rectangle(
    INV_X, INV_Y - 20,
    INV_W, 20,
    0x111111
  )
  .setOrigin(0)
  .setDepth(11)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);
  scene.input.setDraggable(invTitleBar);

  // Close button (hidden initially)
  invCloseBtn = scene.add.text(
    INV_X + INV_W - 20, INV_Y - 20,
    "✖", {
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

  // Dragging the bar moves the whole panel
  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    if (gameObject === invTitleBar) {
      invTitleBar.setPosition(dragX, dragY);
      invCloseBtn.setPosition(dragX + INV_W - 20, dragY);
      inventoryContainer.setPosition(dragX, dragY + 20);
    }
  });

  // Toggle panel with "I"
  const keyI = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  keyI.on('down', () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
