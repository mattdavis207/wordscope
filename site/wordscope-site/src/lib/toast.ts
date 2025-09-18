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

function colorsFor(type: ToastType) {
  switch (type) {
    case "success":
      return { bg: "#16a34a", border: "#15803d" };
    case "error":
      return { bg: "#dc2626", border: "#b91c1c" };
    case "warning":
      return { bg: "#f59e0b", border: "#d97706" };
    default:
      return { bg: "#374151", border: "#1f2937" };
  }
}

export function showToast(message: string, type: ToastType = "info", opts: ToastOptions = {}) {
  if (typeof window === "undefined") return; // no-op on server
  const duration = Math.max(1500, Math.min(10000, opts.duration ?? 3500));

  const container = getContainer();
  const toast = document.createElement("div");
  const { bg, border } = colorsFor(type);

  Object.assign(toast.style, {
    minWidth: "240px",
    maxWidth: "420px",
    background: bg,
    color: "white",
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

