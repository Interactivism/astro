(async () => {
  // ── Pre-load all fonts first ────────────────────────────────
  const FONTS = [
    ["Source Sans Pro", "Light"],
    ["Source Sans Pro", "Regular"],
    ["Source Sans Pro", "SemiBold"],
    ["Roboto Slab", "Light"],
    ["Roboto Slab", "Regular"],
    ["Inter", "Regular"],
    ["Inter", "Semi Bold"],
  ];
  const available = new Set();
  for (const [family, style] of FONTS) {
    try {
      await figma.loadFontAsync({ family, style });
      available.add(`${family}::${style}`);
    } catch(e) {}
  }

  function bestFont(family, style) {
    if (available.has(`${family}::${style}`)) return { family, style };
    // Try Inter fallbacks
    for (const s of ["Regular", "Semi Bold"]) {
      if (available.has(`Inter::${s}`)) return { family: "Inter", style: s };
    }
    // Last resort — return as-is and let Figma error
    return { family: "Inter", style: "Regular" };
  }

  // ── Helpers ─────────────────────────────────────────────────
  const C = {
    yellow:  { r: 0.973, g: 0.949, b: 0.110 },
    teal:    { r: 0.051, g: 0.675, b: 0.741 },
    green:   { r: 0.275, g: 0.725, b: 0.502 },
    red:     { r: 0.906, g: 0.329, b: 0.435 },
    orange:  { r: 0.961, g: 0.533, b: 0.247 },
    dark1:   { r: 0.200, g: 0.200, b: 0.200 }, // #333
    dark2:   { r: 0.290, g: 0.290, b: 0.290 }, // #4a4a4a
    dark3:   { r: 0.608, g: 0.608, b: 0.608 }, // #9b9b9b
    dark4:   { r: 0.675, g: 0.675, b: 0.675 }, // #acacac
    charcoal:{ r: 0.125, g: 0.125, b: 0.125 }, // #202020
    border:  { r: 0.808, g: 0.808, b: 0.808 }, // #cecece
    offwhite:{ r: 0.945, g: 0.937, b: 0.937 }, // #f1efef
    hoverbg: { r: 0.973, g: 0.973, b: 0.973 }, // #f8f8f8
    white:   { r: 1.000, g: 1.000, b: 1.000 },
    bgpage:  { r: 0.980, g: 0.980, b: 0.980 },
  };

  function sf(c) { return [{ type: 'SOLID', color: c }]; }

  function makeRect(w, h, color, radius) {
    const r = figma.createRectangle();
    r.resize(w, h);
    r.fills = sf(color);
    if (radius) r.cornerRadius = radius;
    return r;
  }

  function makeLine(w) {
    const r = figma.createRectangle();
    r.resize(w, 1);
    r.fills = sf(C.border);
    return r;
  }

  function makeText(chars, family, style, size, lhPx, color) {
    const t = figma.createText();
    const fn = bestFont(family, style);
    t.fontName = fn;
    t.fontSize = size;
    t.lineHeight = { value: lhPx, unit: "PIXELS" };
    t.fills = sf(color);
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    t.characters = chars;
    return t;
  }

  function add(parent, node, x, y) {
    parent.appendChild(node);
    node.x = x; node.y = y;
  }

  // ── Canvas placement ────────────────────────────────────────
  const target = figma.currentPage.findOne(n => n.id === '137:338');
  const ox = target ? target.x + target.width + 80 : 100;
  const oy = target ? target.y : 100;

  // ── Root frame ──────────────────────────────────────────────
  const W = 1100;
  const root = figma.createFrame();
  root.name = "Interactivism / Visual Style Sheet";
  root.fills = sf(C.bgpage);
  root.resize(W, 100);
  figma.currentPage.appendChild(root);
  root.x = ox; root.y = oy;

  let y = 64;
  const PAD = 64;

  // ── Section heading ─────────────────────────────────────────
  function addSection(label) {
    const t = makeText(label.toUpperCase(), "Source Sans Pro", "SemiBold", 11, 14, C.charcoal);
    t.letterSpacing = { value: 2, unit: "PIXELS" };
    add(root, t, PAD, y);
    y += 14 + 20;
  }

  // ═══════════════════════════════════════════════════════════
  // 1. COLORS
  // ═══════════════════════════════════════════════════════════
  addSection("Color Palette");

  const colorGroups = [
    ["Brand",     [["Primary Yellow","#F8F21C",C.yellow],["Brand Teal","#0DACBD",C.teal],["Success Green","#46B980",C.green],["Error Red","#E7546F",C.red],["Warm Orange","#F5883F",C.orange]]],
    ["Text",      [["Body Text","#333333",C.dark1],["Secondary Text","#4A4A4A",C.dark2],["Tertiary Text","#9B9B9B",C.dark3],["Meta Text","#ACACAC",C.dark4]]],
    ["Structure", [["Charcoal","#202020",C.charcoal],["Border","#CECECE",C.border],["Off White","#F1EFEF",C.offwhite],["Hover BG","#F8F8F8",C.hoverbg],["White","#FFFFFF",C.white]]],
  ];

  for (const [group, swatches] of colorGroups) {
    const gl = makeText(group, "Source Sans Pro", "Regular", 10, 13, C.dark4);
    gl.letterSpacing = { value: 1.5, unit: "PIXELS" };
    add(root, gl, PAD, y);
    y += 13 + 8;

    let x = PAD;
    for (const [name, hex, color] of swatches) {
      const sw = makeRect(72, 72, color, 4);
      const lum = 0.2126*color.r + 0.7152*color.g + 0.0722*color.b;
      if (lum > 0.85) { sw.strokes = [{ type:'SOLID', color:C.border }]; sw.strokeWeight = 1; }
      add(root, sw, x, y);

      const nl = makeText(name, "Source Sans Pro", "Regular", 10, 13, C.dark2);
      add(root, nl, x, y + 76);

      const hl = makeText(hex, "Source Sans Pro", "Regular", 10, 13, C.dark4);
      add(root, hl, x, y + 76 + 14);

      x += 72 + 16;
    }
    y += 72 + 14 + 14 + 24;
  }

  y += 40;

  // ═══════════════════════════════════════════════════════════
  // 2. TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════
  addSection("Typography Scale");
  add(root, makeLine(W - PAD*2), PAD, y); y += 1;

  const TYPE_SCALE = [
    ["Hero / Display",  90, 96,  "Source Sans Pro","Regular",  C.dark1, "Designing for the Human–AI Era"],
    ["H1 Large",        60, 68,  "Source Sans Pro","Regular",  C.dark1, "Human-AI Experience"],
    ["H1 Page",         40, 50,  "Source Sans Pro","Regular",  C.dark1, "Our Services"],
    ["H2",              34, 42,  "Source Sans Pro","Regular",  C.dark1, "AI Product Strategy"],
    ["H3",              30, 38,  "Source Sans Pro","Regular",  C.dark1, "Research & Discovery"],
    ["Content Intro",   48, 72,  "Source Sans Pro","Light",    C.dark2, "We help organizations design better experiences."],
    ["Body Copy",       22, 36,  "Roboto Slab",   "Light",    C.dark2, "Our work bridges the gap between emerging technology and the people who use it."],
    ["Body Small",      18, 30,  "Roboto Slab",   "Light",    C.dark2, "We believe great design starts with deep understanding of user needs."],
    ["Nav Link",        24, 24,  "Source Sans Pro","SemiBold", C.dark1, "SERVICES"],
    ["Button Label",    28, 28,  "Source Sans Pro","SemiBold", C.dark1, "GET IN TOUCH"],
    ["Tag / Label",     16, 16,  "Source Sans Pro","SemiBold", C.dark1, "CASE STUDY"],
    ["Caption",         18, 28,  "Source Sans Pro","Regular",  C.dark2, "Interactivism helps teams design smarter."],
    ["Meta / Small",    14, 22,  "Source Sans Pro","Regular",  C.dark3, "March 2025 · 5 min read"],
  ];

  const META_X = PAD;
  const SAMPLE_X = 280;

  for (const [name, size, lh, fam, sty, color, sample] of TYPE_SCALE) {
    y += 20;

    const nameT = makeText(name, "Source Sans Pro", "SemiBold", 11, 14, C.dark1);
    add(root, nameT, META_X, y);

    const infoT = makeText(`${fam} ${sty} · ${size}/${lh}px`, "Source Sans Pro", "Regular", 10, 14, C.dark4);
    add(root, infoT, META_X, y + 16);

    const sampleT = makeText(sample, fam, sty, size, lh, color);
    add(root, sampleT, SAMPLE_X, y);

    const rowH = Math.max(lh, 44);
    y += rowH + 20;

    add(root, makeLine(W - PAD*2), PAD, y);
    y += 1;
  }

  y += 48;

  // ═══════════════════════════════════════════════════════════
  // 3. BUTTONS
  // ═══════════════════════════════════════════════════════════
  addSection("Button Styles");

  const BTNS = [
    ["Primary CTA",     C.yellow,    C.dark1,   240, 80, 28],
    ["Secondary",       C.white,     C.dark1,   240, 80, 28],
    ["Dark",            C.charcoal,  C.white,   240, 80, 24],
    ["Tag",             C.charcoal,  C.white,   160, 44, 16],
  ];

  let bx = PAD;
  for (const [bname, bg, fg, bw, bh, fs] of BTNS) {
    const bf = figma.createFrame();
    bf.name = bname; bf.resize(bw, bh); bf.cornerRadius = 2;
    bf.fills = sf(bg); bf.layoutMode = "HORIZONTAL";
    bf.primaryAxisAlignItems = "CENTER"; bf.counterAxisAlignItems = "CENTER";
    if (bname === "Secondary") { bf.strokes = [{ type:'SOLID', color:C.border }]; bf.strokeWeight = 1; }
    add(root, bf, bx, y);

    const bt = makeText(bname.toUpperCase(), "Source Sans Pro", "SemiBold", fs, fs, fg);
    bt.letterSpacing = { value: 1, unit: "PIXELS" };
    bf.appendChild(bt);

    const note = makeText(`${fs}px · SemiBold · uppercase`, "Source Sans Pro", "Regular", 10, 13, C.dark4);
    add(root, note, bx, y + bh + 8);

    bx += bw + 24;
  }

  y += 80 + 8 + 13 + 64;

  // ── Resize and finish ───────────────────────────────────────
  root.resize(W, y);
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.currentPage.selection = [root];
  figma.closePlugin("✓ Done!");
})();
