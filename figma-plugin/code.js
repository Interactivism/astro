(async () => {
  const COLORS = {
    "Primary Yellow":  { r: 0.973, g: 0.949, b: 0.110 },
    "Brand Teal":      { r: 0.051, g: 0.675, b: 0.741 },
    "Success Green":   { r: 0.275, g: 0.725, b: 0.502 },
    "Error Red":       { r: 0.906, g: 0.329, b: 0.435 },
    "Warm Orange":     { r: 0.961, g: 0.533, b: 0.247 },
    "Body Text":       { r: 0.200, g: 0.200, b: 0.200 },
    "Secondary Text":  { r: 0.290, g: 0.290, b: 0.290 },
    "Tertiary Text":   { r: 0.608, g: 0.608, b: 0.608 },
    "Meta Text":       { r: 0.675, g: 0.675, b: 0.675 },
    "Charcoal":        { r: 0.125, g: 0.125, b: 0.125 },
    "Border":          { r: 0.808, g: 0.808, b: 0.808 },
    "Off White":       { r: 0.945, g: 0.937, b: 0.937 },
    "Hover BG":        { r: 0.973, g: 0.973, b: 0.973 },
    "White":           { r: 1.000, g: 1.000, b: 1.000 },
  };

  const TYPE_SCALE = [
    ["Hero / Display",  90, 96,  "Source Sans Pro", "Regular",  "Body Text",     "Designing for the Human–AI Era"],
    ["H1 Large",        60, 68,  "Source Sans Pro", "Regular",  "Body Text",     "Human-AI Experience"],
    ["H1 Page",         40, 50,  "Source Sans Pro", "Regular",  "Body Text",     "Our Services"],
    ["H2",              34, 42,  "Source Sans Pro", "Regular",  "Body Text",     "AI Product Strategy"],
    ["H3",              30, 38,  "Source Sans Pro", "Regular",  "Body Text",     "Research & Discovery"],
    ["Content Intro",   48, 72,  "Source Sans Pro", "Light",    "Secondary Text","We help organizations design better experiences."],
    ["Body Copy",       22, 36,  "Roboto Slab",     "Light",    "Secondary Text","Our work bridges the gap between emerging technology and the people who use it."],
    ["Body Small",      18, 30,  "Roboto Slab",     "Light",    "Secondary Text","We believe great design starts with deep understanding of user needs."],
    ["Nav Link",        24, 24,  "Source Sans Pro", "SemiBold", "Body Text",     "SERVICES"],
    ["Button Label",    28, 28,  "Source Sans Pro", "SemiBold", "Body Text",     "GET IN TOUCH"],
    ["Tag / Label",     16, 16,  "Source Sans Pro", "SemiBold", "Body Text",     "CASE STUDY"],
    ["Caption",         18, 28,  "Source Sans Pro", "Regular",  "Secondary Text","Interactivism helps teams design smarter and more collaboratively."],
    ["Meta / Small",    14, 22,  "Source Sans Pro", "Regular",  "Tertiary Text", "March 2025 · 5 min read"],
  ];

  function fill(color) { return [{ type: 'SOLID', color }]; }

  async function loadFont(family, style) {
    try { await figma.loadFontAsync({ family, style }); return true; }
    catch(e) { return false; }
  }

  async function txt(chars, family, style, size, lh, color) {
    if (!await loadFont(family, style)) {
      await loadFont("Inter", "Regular");
      family = "Inter"; style = "Regular";
    }
    const t = figma.createText();
    t.fontName = { family, style };
    t.fontSize = size;
    t.lineHeight = { value: lh, unit: "PIXELS" };
    t.fills = fill(color);
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    t.characters = chars;
    return t;
  }

  function hline(w) {
    const r = figma.createRectangle();
    r.resize(w, 1);
    r.fills = fill(COLORS["Border"]);
    return r;
  }

  // ── Find placement ──────────────────────────────────────────
  const target = figma.root.findOne(n => n.id === '137:338');
  const page = target ? target.parent : figma.currentPage;
  const ox = target ? target.x + target.width + 80 : 0;
  const oy = target ? target.y : 0;

  // ── Root frame ──────────────────────────────────────────────
  const root = figma.createFrame();
  root.name = "Interactivism / Visual Style Sheet";
  root.fills = fill({ r: 0.98, g: 0.98, b: 0.98 });
  root.resize(1200, 100);
  page.appendChild(root);
  root.x = ox; root.y = oy;

  let y = 80;

  function place(node, x) {
    root.appendChild(node);
    node.x = x; node.y = y;
  }

  // ═══════════════════════════════════════════════════════════
  // SECTION HEADER helper
  // ═══════════════════════════════════════════════════════════
  async function section(title) {
    const t = await txt(title, "Source Sans Pro", "SemiBold", 11, 14, COLORS["Charcoal"]);
    t.letterSpacing = { value: 2, unit: "PIXELS" };
    t.characters = t.characters.toUpperCase();
    place(t, 80);
    y += 14 + 24;
  }

  // ═══════════════════════════════════════════════════════════
  // 1. COLORS
  // ═══════════════════════════════════════════════════════════
  await section("Color Palette");

  const colorGroups = [
    ["Brand",     ["Primary Yellow","Brand Teal","Success Green","Error Red","Warm Orange"]],
    ["Text",      ["Body Text","Secondary Text","Tertiary Text","Meta Text"]],
    ["Structure", ["Charcoal","Border","Off White","Hover BG","White"]],
  ];

  for (const [groupName, names] of colorGroups) {
    const gl = await txt(groupName.toUpperCase(), "Source Sans Pro", "Regular", 10, 13, COLORS["Meta Text"]);
    gl.letterSpacing = { value: 1.5, unit: "PIXELS" };
    place(gl, 80);
    y += 13 + 10;

    let x = 80;
    for (const name of names) {
      const color = COLORS[name];

      const swatch = figma.createRectangle();
      swatch.name = name;
      swatch.resize(80, 80);
      swatch.cornerRadius = 4;
      swatch.fills = fill(color);
      const lum = 0.2126*color.r + 0.7152*color.g + 0.0722*color.b;
      if (lum > 0.85) {
        swatch.strokes = [{ type:'SOLID', color:{ r:0.75, g:0.75, b:0.75 } }];
        swatch.strokeWeight = 1;
      }
      root.appendChild(swatch);
      swatch.x = x; swatch.y = y;

      const nl = await txt(name, "Source Sans Pro", "Regular", 10, 13, COLORS["Secondary Text"]);
      nl.resize(80, 13); nl.textAutoResize = "HEIGHT";
      root.appendChild(nl); nl.x = x; nl.y = y + 88;

      const r255 = Math.round(color.r*255);
      const g255 = Math.round(color.g*255);
      const b255 = Math.round(color.b*255);
      const hex = '#' + [r255,g255,b255].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
      const hl = await txt(hex, "Source Sans Pro", "Regular", 10, 13, COLORS["Meta Text"]);
      root.appendChild(hl); hl.x = x; hl.y = y + 88 + 16;

      x += 80 + 16;
    }
    y += 80 + 16 + 16 + 16 + 24;
  }

  y += 40;

  // ═══════════════════════════════════════════════════════════
  // 2. TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════
  await section("Typography Scale");

  root.appendChild(hline(1040)); root.children[root.children.length-1].x = 80; root.children[root.children.length-1].y = y;
  y += 1;

  for (const [name, size, lh, family, style, colorKey, sample] of TYPE_SCALE) {
    y += 24;

    // Meta column
    const nameT = await txt(name, "Source Sans Pro", "SemiBold", 11, 14, COLORS["Body Text"]);
    place(nameT, 80);

    const infoT = await txt(`${family} ${style}\n${size}px / ${lh}px`, "Source Sans Pro", "Regular", 10, 14, COLORS["Tertiary Text"]);
    root.appendChild(infoT); infoT.x = 80; infoT.y = y + 16;

    // Sample column
    const sampleT = await txt(sample, family, style, size, lh, COLORS[colorKey]);
    root.appendChild(sampleT); sampleT.x = 320; sampleT.y = y;

    const rowH = Math.max(size + lh, 28 + 14 + 14 + 8);
    y += rowH + 24;

    const div = hline(1040);
    root.appendChild(div); div.x = 80; div.y = y;
    y += 1;
  }

  y += 48;

  // ═══════════════════════════════════════════════════════════
  // 3. BUTTONS
  // ═══════════════════════════════════════════════════════════
  await section("Button Styles");

  const buttons = [
    ["Primary CTA",     { r:0.973,g:0.949,b:0.110 }, { r:0.2,g:0.2,b:0.2 },   240, 80,  28, false],
    ["Secondary",       { r:1,g:1,b:1 },             { r:0.2,g:0.2,b:0.2 },   240, 80,  28, true ],
    ["Dark / Tertiary", { r:0.125,g:0.125,b:0.125 }, { r:1,g:1,b:1 },         240, 80,  24, false],
    ["Tag",             { r:0.125,g:0.125,b:0.125 }, { r:1,g:1,b:1 },         160, 44,  16, false],
  ];

  let bx = 80;
  for (const [bname, bg, fg, bw, bh, fsize, bordered] of buttons) {
    const bf = figma.createFrame();
    bf.name = bname;
    bf.resize(bw, bh);
    bf.cornerRadius = 2;
    bf.fills = fill(bg);
    if (bordered) { bf.strokes = [{ type:'SOLID', color:COLORS["Border"] }]; bf.strokeWeight = 1; }
    bf.layoutMode = "HORIZONTAL";
    bf.primaryAxisAlignItems = "CENTER";
    bf.counterAxisAlignItems = "CENTER";
    root.appendChild(bf); bf.x = bx; bf.y = y;

    const bt = await txt(bname.toUpperCase(), "Source Sans Pro", "SemiBold", fsize, fsize, fg);
    bt.letterSpacing = { value: 1, unit: "PIXELS" };
    bf.appendChild(bt);

    const note = await txt(`${fsize}px · SemiBold`, "Source Sans Pro", "Regular", 10, 13, COLORS["Meta Text"]);
    root.appendChild(note); note.x = bx; note.y = y + bh + 8;

    bx += bw + 24;
  }

  y += 80 + 8 + 13 + 48;

  // ── Resize root to fit content ──────────────────────────────
  root.resize(1200, y);

  figma.viewport.scrollAndZoomIntoView([root]);
  figma.currentPage.selection = [root];
  figma.closePlugin("✓ Style sheet created!");
})();
