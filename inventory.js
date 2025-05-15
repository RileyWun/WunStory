
let inventoryContainer;
let inventoryOpen = false;
let items = [
  { key: "item_hat_red", type: "hat" },
  { key: "item_potion", type: "potion" },
  { key: "item_top_blue", type: "top" }
];
let itemSprites = [];

const itemData = {
  "item_hat_red": { name: "Red Hat", type: "hat" },
  "item_potion": { name: "Health Potion", type: "potion" },
  "item_top_blue": { name: "Blue Shirt", type: "top" }
};

function initInventoryUI(scene) {
  inventoryContainer = scene.add.container(100, 120).setScrollFactor(0).setDepth(10).setVisible(false);
  inventoryContainer.setSize(200, 200);

  const bg = scene.add.rectangle(0, 0, 200, 200, 0x222222, 0.95).setOrigin(0);
  inventoryContainer.add(bg);

  const titleBar = scene.add.rectangle(100, 100, 200, 20, 0x111111, 1).setOrigin(0).setInteractive();
  titleBar.setDepth(999).setScrollFactor(0).setVisible(false);
  scene.input.setDraggable(titleBar);
  titleBar.input && (titleBar.input.cursor = 'pointer');

  const closeButton = scene.add.text(280, 100, "✖", {
    fontSize: "14px", fill: "#fff", backgroundColor: "#900",
    padding: { left: 4, right: 4, top: 1, bottom: 1 }
  }).setOrigin(0).setInteractive({ useHandCursor: true });
  closeButton.setDepth(999).setScrollFactor(0).setVisible(false);

  closeButton.on("pointerdown", () => {
    inventoryContainer.setVisible(false);
    titleBar.setVisible(false);
    closeButton.setVisible(false);
    inventoryOpen = false;
  });

  scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (gameObject === titleBar) {
      inventoryContainer.setPosition(dragX, dragY + 20);
      titleBar.setPosition(dragX, dragY);
      closeButton.setPosition(dragX + 180, dragY);
    }
  });

  items.forEach((item, i) => {
    const sprite = scene.add.image(20 + (i % 4) * 45, 30 + Math.floor(i / 4) * 45, item.key)
      .setOrigin(0)
      .setScale(1.2)
      .setInteractive({ draggable: true });

    sprite.itemKey = item.key;
    sprite.itemType = item.type;

    sprite.on("dragstart", () => sprite.setScale(1.3));
    sprite.on("dragend", () => sprite.setScale(1.2));

    sprite.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown() && pointer.downTime - pointer.upTime < 300) {
        if (item.type === "potion") {
          console.log(`Used ${itemData[item.key].name}`);
        } else {
          attemptEquip(item.key, item.type);
        }
      }
    });

    inventoryContainer.add(sprite);
    itemSprites.push(sprite);
  });

  scene.input.keyboard.on("keydown-I", () => {
    inventoryOpen = !inventoryOpen;
    inventoryContainer.setVisible(inventoryOpen);
    titleBar.setVisible(inventoryOpen);
    closeButton.setVisible(inventoryOpen);

    const pos = inventoryContainer.getBounds();
    titleBar.setPosition(pos.x, pos.y - 20);
    closeButton.setPosition(pos.x + 180, pos.y - 20);
  });
}

function attemptEquip(itemKey, itemType) {
  if (!window.equipmentSlots) return;
  for (let slot of window.equipmentSlots) {
    if (slot.accepts === itemType) {
      slot.setTexture(itemKey);
      slot.itemKey = itemKey;
      console.log(`Equipped ${itemKey} to ${slot.slotName}`);
      break;
    }
  }
}
