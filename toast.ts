export type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
  duration?: number;
};

function getContainer(): HTMLDivElement {
  const existing = document.getElementById("wordscope-toast-container") as HTMLDivElement | null;
  if (existing) return existing;

  const container = document.createElement("div");
  container.id = "wordscope-toast-container";
  Object.assign(container.style, {
    position: "fixed",
    top: "16px",
    right: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: "2147483647",
    pointerEvents: "none",
  } as CSSStyleDeclaration);
  document.body.appendChild(container);
  return container;
}

function parseHex(color: string): string | null {
  const value = color.trim()
  if (/^#([0-9a-f]{3})$/i.test(value)) {
    const shorthand = value.slice(1)
    return `#${shorthand[0]}${shorthand[0]}${shorthand[1]}${shorthand[1]}${shorthand[2]}${shorthand[2]}`
  }
  if (/^#([0-9a-f]{6})$/i.test(value)) {
    return value
  }
  return null
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))
  return `#${toHex(clamp(r))}${toHex(clamp(g))}${toHex(clamp(b))}`
}

function mixColors(baseHex: string, blendHex: string, ratio: number) {
  const base = hexToRgb(baseHex)
  const blend = hexToRgb(blendHex)
  const mix = {
    r: base.r * (1 - ratio) + blend.r * ratio,
    g: base.g * (1 - ratio) + blend.g * ratio,
    b: base.b * (1 - ratio) + blend.b * ratio
  }
  return rgbToHex(mix)
}

function getCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback
  const computed = getComputedStyle(document.documentElement).getPropertyValue(name)
  const parsed = parseHex(computed) ?? parseHex(fallback)
  return parsed ?? fallback
}

function colorsFor(type: ToastType) {
  const themeBackground = getCssVar('--main-body', '#072141')
  const borderBase = getCssVar('--border', '#374151')
  const palette: Record<ToastType, string> = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#2563eb'
  }

  const blendColor = palette[type]
  const bg = mixColors(themeBackground, blendColor, type === 'warning' ? 0.3 : type === 'error' ? 0.35 : type === 'success' ? 0.28 : 0.24)
  const border = mixColors(borderBase, blendColor, 0.2)
  const text = getCssVar('--text', '#FFFFFF')

  return { bg, border, text }
}

export function showToast(message: string, type: ToastType = "info", opts: ToastOptions = {}) {
  if (typeof window === "undefined") return; // no-op on server
  const duration = Math.max(1500, Math.min(10000, opts.duration ?? 3500));

  const container = getContainer();
  const toast = document.createElement("div");
  const { bg, border, text } = colorsFor(type);

  Object.assign(toast.style, {
    minWidth: "240px",
    maxWidth: "420px",
    background: bg,
    color: text,
    border: `1px solid ${border}`,
    borderRadius: "10px",
    padding: "10px 14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    pointerEvents: "auto",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
    fontSize: "14px",
    lineHeight: "1.3",
    transform: "translateX(20px)",
    opacity: "0",
    transition: "transform 160ms ease, opacity 160ms ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  } as CSSStyleDeclaration);

  toast.textContent = message;

  const remove = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => {
      toast.remove();
      const containerNow = document.getElementById("wordscope-toast-container");
      if (containerNow && !containerNow.childElementCount) containerNow.remove();
    }, 180);
  };

  toast.addEventListener("click", remove);

  container.appendChild(toast);
  // trigger enter animation
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  setTimeout(remove, duration);
}
