// equipment.js

let equipmentContainer;
let equipmentOpen = false;
let eqTitleBar, eqCloseBtn;
let eqDragOffsetX = 0, eqDragOffsetY = 0;
window.equipmentSlots = [];
let layerSprites = {};

const EQ_X = 350, EQ_Y = 120, EQ_W = 260, EQ_H = 320;

function initEquipmentUI(scene) {
  // ── 1) Panel container ─────────────────────────────────────────────
  equipmentContainer = scene.add.container(EQ_X, EQ_Y)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);
  equipmentContainer.setSize(EQ_W, EQ_H);

  // Background under the bar
  const bg = scene.add.rectangle(0, 20, EQ_W, EQ_H - 20, 0x1c1c1c, 0.95)
    .setOrigin(0);
  equipmentContainer.add(bg);

  // ── 2) Live preview (character frame 4 as the base) ────────────────
  // Base body
  layerSprites.body = scene.add.sprite(EQ_W/2, 80, 'character', 4)
    .setOrigin(0.5)
    .setScrollFactor(0);
  equipmentContainer.add(layerSprites.body);

  // Overlay layers (hidden until equipped)
  ["hat","face","top","bottom","shoes","gloves","weapon"].forEach(slot => {
    layerSprites[slot] = scene.add.sprite(EQ_W/2, 80, 'character', 4)
      .setOrigin(0.5)
      .setVisible(false)
      .setScrollFactor(0);
    equipmentContainer.add(layerSprites[slot]);
  });

  // ── 3) Slots definition & drop zones ───────────────────────────────
  const defs = [
    { slot: 'hat',    x: EQ_W/2,    y:  50 },
    { slot: 'face',   x: EQ_W/2,    y:  80 },
    { slot: 'top',    x:   60,      y: 130 },
    { slot: 'bottom', x:   60,      y: 170 },
    { slot: 'shoes',  x:   60,      y: 210 },
    { slot: 'gloves', x: EQ_W - 60, y: 130 },
    { slot: 'weapon', x: EQ_W - 60, y: 170 }
  ];
  defs.forEach(d => {
    // drop zone
    const z = scene.add.rectangle(d.x, d.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    z.slotName = d.slot;
    z.accepts  = d.slot;
    scene.input.setDropZone(z);
    equipmentContainer.add(z);
    window.equipmentSlots.push(z);

    // label
    const lbl = scene.add.text(d.x, d.y + 20, d.slot.toUpperCase(), {
      fontSize: "10px", fill: "#ccc"
    })
    .setOrigin(0.5)
    .setScrollFactor(0);
    equipmentContainer.add(lbl);
  });

  // ── 4) Title-bar & close button (outside) ─────────────────────────
  eqTitleBar = scene.add.rectangle(
    EQ_X, EQ_Y - 20, EQ_W, 20, 0x111111
  )
  .setOrigin(0)
  .setDepth(11)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);
  scene.input.setDraggable(eqTitleBar);

  eqTitleBar.on("dragstart", (pointer, dragX, dragY) => {
    eqDragOffsetX = dragX - equipmentContainer.x;
    eqDragOffsetY = dragY - equipmentContainer.y;
  });

  eqCloseBtn = scene.add.text(
    EQ_X + EQ_W - 20, EQ_Y - 20, "✖", {
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
  eqCloseBtn.on("pointerdown", () => {
    equipmentOpen = false;
    equipmentContainer.setVisible(false);
    eqTitleBar.setVisible(false);
    eqCloseBtn.setVisible(false);
  });

  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === eqTitleBar) {
      const nx = dragX - eqDragOffsetX;
      const ny = dragY - eqDragOffsetY;
      equipmentContainer.setPosition(nx, ny);
      eqTitleBar.setPosition(nx, ny - 20);
      eqCloseBtn.setPosition(nx + EQ_W - 20, ny - 20);
    }
  });

  // ── 5) Drop handler updates preview ────────────────────────────────
  scene.input.on("drop", (pointer, dragged, dropZone) => {
    if (dropZone.accepts === dragged.itemType) {
      // show the item’s texture/frame
      layerSprites[dropZone.slotName]
        .setTexture(dragged.itemKey)
        .setVisible(true);
    }
  });

  // ── 6) Double-click helper ────────────────────────────────────────
  window.applyEquip = (key, type) => {
    for (const z of window.equipmentSlots) {
      if (z.accepts === type) {
        layerSprites[z.slotName]
          .setTexture(key)
          .setVisible(true);
        break;
      }
    }
  };

  // ── 7) Toggle with E ───────────────────────────────────────────────
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    equipmentContainer.setVisible(equipmentOpen);
    eqTitleBar.setVisible(equipmentOpen);
    eqCloseBtn.setVisible(equipmentOpen);
  });
}
