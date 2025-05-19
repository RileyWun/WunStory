// inventory.js

let inventoryContainer, invTitleBar, invCloseBtn;
let inventoryOpen = false;

const INV_X = 100, INV_Y = 120, INV_W = 200, INV_H = 200;
const items = [
  { key: "item_hat_red",   type: "hat"    },
  { key: "item_potion",    type: "potion" },
  { key: "item_top_blue",  type: "top"    },
  { key: "item_sword",     type: "weapon" }
];

function initInventoryUI(scene) {
  // 1) UI container (just holds background)
  inventoryContainer = scene.add.container(INV_X, INV_Y)
    .setScrollFactor(0)
    .setVisible(false)
    .setDepth(10);

  // background
  const bg = scene.add.rectangle(0, 0, INV_W, INV_H, 0x222222, 0.95)
    .setOrigin(0);
  inventoryContainer.add(bg);

  // 2) Create item icons as INDIVIDUAL sprites (not added to the container)
  items.forEach((item, i) => {
    const x = INV_X + 10 + (i % 4) * 45;
    const y = INV_Y + 30 + Math.floor(i / 4) * 45;
    const spr = scene.add.image(x, y, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setScrollFactor(0)
      .setInteractive({ draggable: true, useHandCursor: true });

    spr.itemKey  = item.key;
    spr.itemType = item.type;

    // drag = move the sprite itself in world coords
    scene.input.setDraggable(spr);
    spr.on('dragstart', () => spr.setScale(1.3));
    spr.on('dragend',   () => spr.setScale(1.2));
    spr.on('drag', (pointer, dragX, dragY) => {
      spr.x = dragX;
      spr.y = dragY;
    });

    // double-click to equip/use
    spr.lastClick = 0;
    spr.on('pointerdown', () => {
      const now = Date.now();
      if (now - spr.lastClick < 300) {
        if (spr.itemType === 'potion') {
          console.log(`Used potion: ${spr.itemKey}`);
        } else {
          window.applyEquip && window.applyEquip(spr.itemKey, spr.itemType);
        }
      }
      spr.lastClick = now;
    });
  });

  // 3) Title bar & close button (outside, also scrollFactor=0)
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

  invCloseBtn = scene.add.text(
    INV_X + INV_W - 20, INV_Y - 20, '✖', {
      fontSize: "14px", fill: "#fff",
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

  // drag the bar → move the panel container + close button
  scene.input.on('drag', (pointer, go, dragX, dragY) => {
    if (go === invTitleBar) {
      invTitleBar.setPosition(dragX, dragY);
      invCloseBtn.setPosition(dragX + INV_W - 20, dragY);
      inventoryContainer.setPosition(dragX, dragY + 20);
    }
  });

  // toggle with "I"
  const keyI = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  keyI.on('down', () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    invTitleBar.setVisible(inventoryOpen);
    invCloseBtn.setVisible(inventoryOpen);
  });
}
