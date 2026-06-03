/* ============================================================
   ui.jsx — shared icons + small components
   ============================================================ */

function Icon({ name, size = 20, stroke = 1.7, ...rest }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", ...rest };
  const paths = {
    check: <polyline points="20 6 9 17 4 12" />,
    sun: <g><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.1" y2="4.9"/></g>,
    partly: <g><circle cx="9" cy="9" r="3.2"/><line x1="9" y1="2.5" x2="9" y2="4"/><line x1="2.5" y1="9" x2="4" y2="9"/><line x1="4.4" y1="4.4" x2="5.5" y2="5.5"/><path d="M8 18.5h9a3.5 3.5 0 0 0 .2-7 5 5 0 0 0-9.6.8A3.4 3.4 0 0 0 8 18.5z"/></g>,
    cloud: <path d="M7 18.5h10a3.6 3.6 0 0 0 .2-7.2 5.2 5.2 0 0 0-10-.6A3.6 3.6 0 0 0 7 18.5z"/>,
    drop: <path d="M12 3s5.5 6 5.5 10a5.5 5.5 0 0 1-11 0C6.5 9 12 3 12 3z"/>,
    flower: <g><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c0-2.5-1-4.6 0-6 1 1.4 0 3.5 0 6M12 14.4c0 2.5 1 4.6 0 6-1-1.4 0-3.5 0-6M9.6 12c-2.5 0-4.6 1-6 0 1.4-1 3.5 0 6 0M14.4 12c2.5 0 4.6-1 6 0-1.4 1-3.5 0-6 0"/></g>,
    calendar: <g><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><line x1="3.5" y1="9.5" x2="20.5" y2="9.5"/><line x1="8" y1="3" x2="8" y2="6.5"/><line x1="16" y1="3" x2="16" y2="6.5"/></g>,
    clock: <g><circle cx="12" cy="12" r="8.5"/><polyline points="12 7.5 12 12 15 14"/></g>,
    wallet: <g><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M16 12.5h2.5"/><path d="M3 9h13a2 2 0 0 1 2 2"/></g>,
    sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>,
    cart: <g><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3h2l2.2 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/></g>,
    heart: <path d="M12 20s-7-4.6-9.2-9A4.6 4.6 0 0 1 12 6.5 4.6 4.6 0 0 1 21.2 11C19 15.4 12 20 12 20z"/>,
    cup: <g><path d="M5 8h12v4a6 6 0 0 1-12 0V8z"/><path d="M17 9h2.2a2 2 0 0 1 0 4H17"/><line x1="5" y1="21" x2="17" y2="21"/></g>,
    car: <g><path d="M5 16.5h14M6 16.5l1.4-5a2 2 0 0 1 1.9-1.4h5.4a2 2 0 0 1 1.9 1.4l1.4 5"/><rect x="3.5" y="11" width="17" height="6" rx="2"/><circle cx="7.5" cy="17.5" r="1.2"/><circle cx="16.5" cy="17.5" r="1.2"/></g>,
    play: <g><circle cx="12" cy="12" r="8.5"/><polygon points="10 8.5 16 12 10 15.5"/></g>,
    chevL: <polyline points="15 6 9 12 15 18" />,
    chevR: <polyline points="9 6 15 12 9 18" />,
    pin: <g><path d="M12 21s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10z"/><circle cx="12" cy="11" r="2.3"/></g>,
    note: <g><path d="M5 3.5h9l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 20V5A1.5 1.5 0 0 1 5 3.5z"/><polyline points="14 3.5 14 9 19 9"/></g>,
    list: <g><line x1="8.5" y1="7" x2="20" y2="7"/><line x1="8.5" y1="12" x2="20" y2="12"/><line x1="8.5" y1="17" x2="20" y2="17"/><circle cx="4.5" cy="7" r="1.1"/><circle cx="4.5" cy="12" r="1.1"/><circle cx="4.5" cy="17" r="1.1"/></g>,
    tag: <g><path d="M3.5 12.5l8-8H19a1.5 1.5 0 0 1 1.5 1.5v7.5l-8 8z"/><circle cx="16" cy="8" r="1.2"/></g>,
    bolt: <polygon points="13 2 4 14 11 14 10 22 19 9 12 9 13 2"/>,
    google: <g stroke="none"><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.3-.18-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"/></g>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}

/* Eyebrow heading with rule */
function Eyebrow({ children, icon }) {
  return (
    <div className="section-eyebrow">
      {icon && <Icon name={icon} size={14} />}
      <span>{children}</span>
      <span className="ln"></span>
    </div>
  );
}

/* Checkbox row */
function CheckRow({ done, onToggle, label, meta }) {
  return (
    <div className={"check" + (done ? " done" : "")} onClick={onToggle}>
      <div className="box"><Icon name="check" size={13} /></div>
      <div className="label">{label}</div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  );
}

Object.assign(window, { Icon, Eyebrow, CheckRow });
