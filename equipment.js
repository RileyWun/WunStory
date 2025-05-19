// equipment.js

function initEquipmentUI(scene) {
  const EQ_X = 350, EQ_Y = 120, EQ_W = 260, EQ_H = 320;
  let equipmentOpen = false;

  // ---- Panel body container ----
  const eqContent = scene.add.container(EQ_X, EQ_Y + 20)
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false);

  eqContent.setSize(EQ_W, EQ_H);
  const bg = scene.add.rectangle(0, 0, EQ_W, EQ_H, 0x1c1c1c, 0.95)
    .setOrigin(0);
  eqContent.add(bg);

  // ---- Live preview: base body frame (frame 4) ----
  const base = scene.add.sprite(EQ_W/2, 80, 'character', 4)
    .setOrigin(0.5)
    .setScrollFactor(0);
  eqContent.add(base);

  // Overlay slots for hat/face/top/etc.
  const layerSprites = {};
  ["hat","face","top","bottom","shoes","gloves","weapon"].forEach(slot => {
    layerSprites[slot] = scene.add.sprite(EQ_W/2, 80, 'character', 4)
      .setOrigin(0.5)
      .setVisible(false)
      .setScrollFactor(0);
    eqContent.add(layerSprites[slot]);
  });

  // ---- Drop-zones around the preview ----
  const defs = [
    { slot:'hat',    x: EQ_W/2,    y: 50 },
    { slot:'face',   x: EQ_W/2,    y: 80 },
    { slot:'top',    x:   60,      y:130 },
    { slot:'bottom', x:   60,      y:170 },
    { slot:'shoes',  x:   60,      y:210 },
    { slot:'gloves', x: EQ_W-60,   y:130 },
    { slot:'weapon', x: EQ_W-60,   y:170 }
  ];

  window.equipmentSlots = [];
  defs.forEach(def => {
    const z = scene.add.rectangle(def.x, def.y, 32, 32, 0x444444, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    z.slotName = def.slot;
    z.accepts  = def.slot;
    scene.input.setDropZone(z);
    eqContent.add(z);
    window.equipmentSlots.push(z);

    const lbl = scene.add.text(def.x, def.y + 20, def.slot.toUpperCase(), {
      fontSize: "10px", fill: "#ccc"
    })
    .setOrigin(0.5)
    .setScrollFactor(0);
    eqContent.add(lbl);
  });

  // ---- Title bar & close button ----
  const eqTitleBar = scene.add.rectangle(
    EQ_X, EQ_Y, EQ_W, 20, 0x111111
  )
  .setOrigin(0)
  .setDepth(11)
  .setScrollFactor(0)
  .setInteractive({ useHandCursor: true })
  .setVisible(false);

  const eqCloseBtn = scene.add.text(
    EQ_X + EQ_W - 20, EQ_Y, "✖", {
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

  eqCloseBtn.on("pointerdown", () => {
    equipmentOpen = false;
    eqContent.setVisible(false);
    eqTitleBar.setVisible(false);
    eqCloseBtn.setVisible(false);
  });

  // ---- Drag logic for the title bar ----
  scene.input.setDraggable(eqTitleBar);
  let eqOffX = 0, eqOffY = 0;
  eqTitleBar.on("dragstart", (pointer, dragX, dragY) => {
    eqOffX = dragX - eqContent.x;
    eqOffY = dragY - eqContent.y;
  });
  scene.input.on("drag", (pointer, go, dragX, dragY) => {
    if (go === eqTitleBar) {
      const nx = dragX - eqOffX;
      const ny = dragY - eqOffY;
      eqContent.setPosition(nx, ny + 20);
      eqTitleBar.setPosition(nx, ny);
      eqCloseBtn.setPosition(nx + EQ_W - 20, ny);
    }
  });

  // ---- Drop handler ----
  scene.input.on("drop", (pointer, dragged, dropZone) => {
    if (dropZone.accepts === dragged.itemType) {
      layerSprites[dropZone.slotName]
        .setTexture(dragged.itemKey)
        .setVisible(true);
    }
  });

  // ---- Double-click equip helper ----
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

  // ---- Toggle with "E" ----
  scene.input.keyboard.on("keydown-E", () => {
    equipmentOpen = !equipmentOpen;
    eqContent.setVisible(equipmentOpen);
    eqTitleBar.setVisible(equipmentOpen);
    eqCloseBtn.setVisible(equipmentOpen);
  });
}
