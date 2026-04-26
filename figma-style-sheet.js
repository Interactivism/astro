// ============================================================
// Interactivism Visual Style Sheet Generator
// Run via: Figma > Plugins > Development > Open Console
// Then paste this entire script and press Enter
// ============================================================

(async () => {
  // ─── Config ────────────────────────────────────────────────
  const BASE = 16; // 1rem = 16px

  const COLORS = {
    // Brand
    "Primary Yellow":   { r: 0.973, g: 0.949, b: 0.110 }, // #f8f21c
    "Brand Teal":       { r: 0.051, g: 0.675, b: 0.741 }, // #0dacbd
    "Success Green":    { r: 0.275, g: 0.725, b: 0.502 }, // #46b980
    "Error Red":        { r: 0.906, g: 0.329, b: 0.435 }, // #e7546f
    "Warm Orange":      { r: 0.961, g: 0.533, b: 0.247 }, // #f5883f
    // Text
    "Body Text":        { r: 0.200, g: 0.200, b: 0.200 }, // #333333
    "Secondary Text":   { r: 0.290, g: 0.290, b: 0.290 }, // #4a4a4a
    "Tertiary Text":    { r: 0.608, g: 0.608, b: 0.608 }, // #9b9b9b
    "Meta Text":        { r: 0.675, g: 0.675, b: 0.675 }, // #acacac
    // Structure
    "Charcoal":         { r: 0.125, g: 0.125, b: 0.125 }, // #202020
    "Border":           { r: 0.808, g: 0.808, b: 0.808 }, // #cecece
    "Off White":        { r: 0.945, g: 0.937, b: 0.937 }, // #f1efef
    "Hover BG":         { r: 0.973, g: 0.973, b: 0.973 }, // #f8f8f8
    "White":            { r: 1.000, g: 1.000, b: 1.000 }, // #ffffff
  };

  const BRAND_COLOR_NAMES = ["Primary Yellow", "Brand Teal", "Success Green", "Error Red", "Warm Orange"];
  const TEXT_COLOR_NAMES  = ["Body Text", "Secondary Text", "Tertiary Text", "Meta Text"];
  const STRUCT_COLOR_NAMES = ["Charcoal", "Border", "Off White", "Hover BG", "White"];

  const TYPE_SCALE = [
    // name, size(px), lineHeight(px), family, style, colorKey, sample
    ["Hero / Display",    90, 96,  "Source Sans Pro", "Regular",  "Body Text",      "Designing for the Human–AI Era"],
    ["H1 Large",          60, 68,  "Source Sans Pro", "Regular",  "Body Text",      "Human-AI Experience"],
    ["H1 Page",           40, 50,  "Source Sans Pro", "Regular",  "Body Text",      "Our Services"],
    ["H2",                34, 42,  "Source Sans Pro", "Regular",  "Body Text",      "AI Product Strategy"],
    ["H3",                30, 38,  "Source Sans Pro", "Regular",  "Body Text",      "Research & Discovery"],
    ["Content Intro",     48, 72,  "Source Sans Pro", "Light",    "Secondary Text", "We help organizations design better experiences through the integration of human insight and AI capabilities."],
    ["Body Copy",         22, 36,  "Roboto Slab",     "Light",    "Secondary Text", "Our work bridges the gap between emerging technology and the people who use it, creating products that are both powerful and intuitive."],
    ["Body Small",        18, 30,  "Roboto Slab",     "Light",    "Secondary Text", "We believe great design starts with deep understanding of user needs, context, and behavior."],
    ["Nav Link",          24, 24,  "Source Sans Pro", "SemiBold", "Body Text",      "SERVICES"],
    ["Button Label",      28, 28,  "Source Sans Pro", "SemiBold", "Body Text",      "GET IN TOUCH"],
    ["Tag / Label",       16, 16,  "Source Sans Pro", "SemiBold", "Body Text",      "CASE STUDY"],
    ["Caption",           18, 28,  "Source Sans Pro", "Regular",  "Secondary Text", "Interactivism helps teams design smarter, faster, and more collaboratively."],
    ["Meta / Small",      14, 22,  "Source Sans Pro", "Regular",  "Tertiary Text",  "March 2025 · 5 min read"],
  ];

  // ─── Helpers ───────────────────────────────────────────────
  function hexToFigmaRGB(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    return {r, g, b};
  }

  function solidFill(color) {
    return [{ type: 'SOLID', color }];
  }

  function newFrame(name, w, h, bg) {
    const f = figma.createFrame();
    f.name = name;
    f.resize(w, h);
    f.fills = bg ? solidFill(bg) : [];
    f.clipsContent = false;
    return f;
  }

  async function safeLoadFont(family, style) {
    try {
      await figma.loadFontAsync({ family, style });
      return true;
    } catch(e) {
      console.warn(`Font not available: ${family} ${style}`);
      return false;
    }
  }

  async function newText(chars, family, style, size, lhPx, color) {
    const loaded = await safeLoadFont(family, style);
    if (!loaded) {
      await safeLoadFont("Inter", "Regular");
      family = "Inter"; style = "Regular";
    }
    const t = figma.createText();
    t.fontName = { family, style };
    t.fontSize = size;
    t.lineHeight = { value: lhPx, unit: "PIXELS" };
    t.fills = solidFill(color);
    t.characters = chars;
    return t;
  }

  function autoLayout(node, dir, gap, ph, pv) {
    node.layoutMode = dir;
    node.itemSpacing = gap;
    node.paddingLeft = ph;
    node.paddingRight = ph;
    node.paddingTop = pv;
    node.paddingBottom = pv;
    node.primaryAxisSizingMode = "AUTO";
    node.counterAxisSizingMode = "AUTO";
  }

  // ─── Find target location ──────────────────────────────────
  const targetNode = figma.root.findOne(n => n.id === '137:338');
  const page = targetNode ? targetNode.parent : figma.currentPage;
  let originX = 0, originY = 0;
  if (targetNode) {
    originX = targetNode.x + targetNode.width + 80;
    originY = targetNode.y;
  }

  // ─── Root container ────────────────────────────────────────
  const root = figma.createFrame();
  root.name = "Interactivism / Visual Style Sheet";
  root.fills = solidFill({ r: 0.98, g: 0.98, b: 0.98 });
  root.clipsContent = false;
  autoLayout(root, "VERTICAL", 80, 80, 80);
  page.appendChild(root);
  root.x = originX;
  root.y = originY;

  // ─── Section label helper ──────────────────────────────────
  async function sectionLabel(title) {
    const dark = COLORS["Charcoal"];
    const t = await newText(title, "Source Sans Pro", "SemiBold", 13, 16, dark);
    t.letterSpacing = { value: 2, unit: "PIXELS" };
    const upper = t.characters.toUpperCase();
    t.characters = upper;
    return t;
  }

  // ═══════════════════════════════════════════════════════════
  // 1. COLOR PALETTE
  // ═══════════════════════════════════════════════════════════
  const colorsSection = newFrame("Colors", 100, 100, null);
  autoLayout(colorsSection, "VERTICAL", 32, 0, 0);
  root.appendChild(colorsSection);

  const colorsLabel = await sectionLabel("Color Palette");
  colorsSection.appendChild(colorsLabel);

  const colorGroups = [
    ["Brand", BRAND_COLOR_NAMES],
    ["Text",  TEXT_COLOR_NAMES],
    ["Structure", STRUCT_COLOR_NAMES],
  ];

  for (const [groupName, names] of colorGroups) {
    const groupFrame = newFrame(groupName, 100, 100, null);
    autoLayout(groupFrame, "VERTICAL", 12, 0, 0);
    colorsSection.appendChild(groupFrame);

    // Group label
    const glabel = await newText(groupName, "Source Sans Pro", "Regular", 11, 14,
      { r: 0.5, g: 0.5, b: 0.5 });
    glabel.letterSpacing = { value: 1.5, unit: "PIXELS" };
    glabel.characters = glabel.characters.toUpperCase();
    groupFrame.appendChild(glabel);

    const swatchRow = newFrame(`${groupName} Swatches`, 100, 100, null);
    autoLayout(swatchRow, "HORIZONTAL", 16, 0, 0);
    groupFrame.appendChild(swatchRow);

    for (const name of names) {
      const color = COLORS[name];
      const swatchOuter = newFrame(name, 100, 100, null);
      autoLayout(swatchOuter, "VERTICAL", 8, 0, 0);
      swatchRow.appendChild(swatchOuter);

      // Color rect
      const rect = figma.createRectangle();
      rect.name = name;
      rect.resize(80, 80);
      rect.cornerRadius = 4;
      rect.fills = solidFill(color);
      // Add border for light colors
      const lum = 0.2126*color.r + 0.7152*color.g + 0.0722*color.b;
      if (lum > 0.85) {
        rect.strokes = [{ type:'SOLID', color:{ r:0.8, g:0.8, b:0.8 } }];
        rect.strokeWeight = 1;
      }
      swatchOuter.appendChild(rect);

      // Label
      const label = await newText(name, "Source Sans Pro", "Regular", 11, 14,
        COLORS["Secondary Text"]);
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      label.resize(80, 14);
      label.textAutoResize = "HEIGHT";
      swatchOuter.appendChild(label);

      // Hex value
      const r255 = Math.round(color.r*255);
      const g255 = Math.round(color.g*255);
      const b255 = Math.round(color.b*255);
      const hex = '#' + [r255,g255,b255].map(v=>v.toString(16).padStart(2,'0')).join('');
      const hexLabel = await newText(hex.toUpperCase(), "Source Sans Pro", "Regular", 10, 14,
        COLORS["Meta Text"]);
      hexLabel.textAutoResize = "WIDTH_AND_HEIGHT";
      swatchOuter.appendChild(hexLabel);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 2. TYPOGRAPHY SCALE
  // ═══════════════════════════════════════════════════════════
  const typeSection = newFrame("Typography", 100, 100, null);
  autoLayout(typeSection, "VERTICAL", 0, 0, 0);
  root.appendChild(typeSection);

  const typeLabel = await sectionLabel("Typography Scale");
  typeSection.appendChild(typeLabel);

  const typeDivider = figma.createRectangle();
  typeDivider.resize(900, 1);
  typeDivider.fills = solidFill(COLORS["Border"]);
  typeDivider.name = "divider";
  typeSection.appendChild(typeDivider);

  for (const [name, size, lh, family, style, colorKey, sample] of TYPE_SCALE) {
    const rowBg = newFrame(name, 100, 100, null);
    autoLayout(rowBg, "HORIZONTAL", 40, 0, 24);
    rowBg.primaryAxisAlignItems = "CENTER";
    typeSection.appendChild(rowBg);

    // Left: meta info
    const meta = newFrame(`${name} meta`, 200, 100, null);
    autoLayout(meta, "VERTICAL", 4, 0, 0);
    meta.layoutGrow = 0;
    rowBg.appendChild(meta);

    const styleName = await newText(name, "Source Sans Pro", "SemiBold", 12, 16,
      COLORS["Body Text"]);
    meta.appendChild(styleName);

    const styleInfo = await newText(
      `${family}\n${style} · ${size}px / ${lh}px`,
      "Source Sans Pro", "Regular", 11, 16,
      COLORS["Tertiary Text"]
    );
    styleInfo.textAutoResize = "WIDTH_AND_HEIGHT";
    meta.appendChild(styleInfo);

    // Spacer rect (invisible) to push type sample to right
    const spacer = figma.createRectangle();
    spacer.resize(1, 1);
    spacer.fills = [];
    spacer.layoutGrow = 0;

    // Right: type sample
    const sampleText = await newText(sample, family, style, size, lh, COLORS[colorKey]);
    sampleText.textAutoResize = "WIDTH_AND_HEIGHT";
    sampleText.layoutGrow = 1;
    rowBg.appendChild(sampleText);

    // Divider below each row
    const divider = figma.createRectangle();
    divider.resize(900, 1);
    divider.fills = solidFill({ r: 0.94, g: 0.94, b: 0.94 });
    typeSection.appendChild(divider);
  }

  // ═══════════════════════════════════════════════════════════
  // 3. BUTTONS
  // ═══════════════════════════════════════════════════════════
  const btnSection = newFrame("Buttons", 100, 100, null);
  autoLayout(btnSection, "VERTICAL", 24, 0, 0);
  root.appendChild(btnSection);

  const btnLabel = await sectionLabel("Button Styles");
  btnSection.appendChild(btnLabel);

  const btnRow = newFrame("Button Row", 100, 100, null);
  autoLayout(btnRow, "HORIZONTAL", 24, 0, 0);
  btnRow.primaryAxisAlignItems = "CENTER";
  btnSection.appendChild(btnRow);

  const BUTTONS = [
    // label, bg, textColor, note
    ["Primary CTA",    "#f8f21c", "#333333", "Source Sans Pro SemiBold · 28px · Uppercase · h:80px · r:2px"],
    ["Secondary",      "#ffffffb3", "#333333", "White 70% · SemiBold · 28px"],
    ["Dark / Tertiary","#202020", "#ffffff",  "Charcoal · SemiBold · 24px"],
    ["Tag",            "#202020", "#ffffff",  "Source Sans Pro SemiBold · 16px · Uppercase · r:2px"],
  ];

  for (const [bname, bgHex, fgHex, note] of BUTTONS) {
    const btnWrap = newFrame(bname, 100, 100, null);
    autoLayout(btnWrap, "VERTICAL", 8, 0, 0);
    btnRow.appendChild(btnWrap);

    // Button shape
    const btnFrame = figma.createFrame();
    btnFrame.name = bname;
    const isTag = bname === "Tag";
    btnFrame.resize(isTag ? 160 : 240, isTag ? 44 : 80);
    btnFrame.cornerRadius = 2;
    const bgRgb = hexToFigmaRGB(bgHex.slice(0,7));
    btnFrame.fills = solidFill(bgRgb);
    if (bgHex.includes('ff') || bgHex === "#ffffff" || bgHex === "#ffffffb3") {
      btnFrame.strokes = [{ type:'SOLID', color: COLORS["Border"] }];
      btnFrame.strokeWeight = 1;
    }
    btnFrame.layoutMode = "HORIZONTAL";
    btnFrame.primaryAxisAlignItems = "CENTER";
    btnFrame.counterAxisAlignItems = "CENTER";
    btnWrap.appendChild(btnFrame);

    const fgRgb = hexToFigmaRGB(fgHex);
    const btnLabelSize = isTag ? 16 : 28;
    const btnText = await newText(bname.toUpperCase(), "Source Sans Pro", "SemiBold",
      btnLabelSize, btnLabelSize, fgRgb);
    btnText.letterSpacing = { value: 1, unit: "PIXELS" };
    btnFrame.appendChild(btnText);

    const noteText = await newText(note, "Source Sans Pro", "Regular", 10, 14, COLORS["Tertiary Text"]);
    noteText.textAutoResize = "WIDTH_AND_HEIGHT";
    btnWrap.appendChild(noteText);
  }

  // ─── Final: fit & select ───────────────────────────────────
  root.resize(root.width, root.height); // force recalc
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.currentPage.selection = [root];

  console.log("✓ Style sheet created:", root.name, `(${Math.round(root.width)}×${Math.round(root.height)}px)`);
})();
