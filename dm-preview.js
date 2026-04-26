(function () {
  // Load DM Serif Display + DM Sans from Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap';
  document.head.appendChild(link);

  // Apply overrides once fonts begin loading
  const style = document.createElement('style');
  style.textContent = `
    /* ── Headlines → DM Serif Display ──────────────────── */
    h1, h2, h3, h4, h5, h6,
    .Slide-title,
    .Hero-headline h3,
    .Error h1,
    .Post-single h1,
    .Contact h1,
    .Archive .Archive-title span,
    [class*="headline"],
    [class*="Headline"] {
      font-family: 'DM Serif Display', serif !important;
      font-weight: 400 !important;
    }

    /* ── Body / UI / Labels → DM Sans ──────────────────── */
    body,
    p, a, li, dt, dd, td, th, blockquote, figcaption,
    input, textarea, select, button, label,
    .Nav, .Nav-item, .Site-navigation a,
    .Button-primary, .Button-secondary, .Button-tertiary, .Button-tag,
    .Button-tag--linked a,
    .Content-header, .Content--small, .Content--small-alt, .Content--large,
    .Page-content p, .Page-content ul,
    .Post-single .Post-content p, .Post-single .Post-content ul,
    .Slide-description, .Slide-caption, .Slide-subtitle,
    .Slide-info-content p,
    .Section-subheading, .Page-subtitle,
    .Card, .Card p, .Card-meta, .Card-footer,
    .Feature-description,
    .Footer, .Footer a, .Site-copyright,
    .Header-title, .Header-subTitle, .Header-actions,
    .Marquee-description, .Marquee-subtext,
    .Modal-option, .Modal-title,
    .InputAddOn-item, .InputAddOn-field,
    .Table, .Table-heading, .Table-cell,
    .Notice, .Error,
    .Event-meta, .Event-detail p,
    .Contact-details,
    .Archive .Archive-title { /* non-span part */
      font-family: 'DM Sans', sans-serif !important;
    }
  `;
  document.head.appendChild(style);

  console.log('%c DM font preview active ', 'background:#f8f21c;color:#333;font-weight:bold;padding:4px 8px;border-radius:2px;');
})();
