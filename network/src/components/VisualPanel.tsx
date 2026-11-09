import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Maximize, Minimize } from "lucide-react";

const ExpandedContext = createContext(false);
export const useExpandedVisual = () => useContext(ExpandedContext);

/** Keeps the same children mounted in normal, native-fullscreen and fallback views. */
export function VisualPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const native = useRef(false);
  const id = useId();
  const leave = () => {
    if (document.fullscreenElement === root.current)
      void document.exitFullscreen().catch(() => setExpanded(false));
    else setExpanded(false);
  };
  useEffect(() => {
    const changed = () => {
      if (document.fullscreenElement === root.current) native.current = true;
      else if (native.current) {
        native.current = false;
        setExpanded(false);
      }
    };
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  useEffect(() => {
    if (!expanded || !root.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const scroll = { x: window.scrollX, y: window.scrollY };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Prevent keyboard navigation into controls hidden behind the expanded view.
    const siblings: Array<[HTMLElement, boolean]> = [];
    let node: HTMLElement | null = root.current;
    while (node?.parentElement) {
      for (const sibling of Array.from(node.parentElement.children)) {
        if (sibling !== node && sibling instanceof HTMLElement) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      node = node.parentElement;
    }
    button.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      siblings.forEach(([element, inert]) => {
        element.inert = inert;
      });
      if (previous?.isConnected) previous.focus({ preventScroll: true });
      window.scrollTo(scroll.x, scroll.y);
    };
  }, [expanded]);
  return (
    <ExpandedContext.Provider value={expanded}>
      <section
        ref={root}
        className={`visual-panel ${className} ${expanded ? "is-expanded" : ""}`}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded ? true : undefined}
        aria-labelledby={id}
        onKeyDown={(event) => {
          if (!expanded) return;
          if (event.key === "Escape") {
            event.stopPropagation();
            leave();
          }
          if (event.key === "Tab") {
            const controls = Array.from(
              root.current?.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), select:not(:disabled), summary, a[href], [tabindex="0"]',
              ) ?? [],
            ).filter(
              (el) => el.getClientRects().length && !el.closest("[inert]"),
            );
            const first = controls[0],
              last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="visual-heading">
          <h2 id={id}>{title}</h2>
          <button
            ref={button}
            className="secondary"
            aria-label={`${expanded ? "Exit fullscreen" : "Fullscreen"}: ${title}`}
            onClick={() => {
              if (expanded) {
                leave();
                return;
              }
              setExpanded(true);
              try {
                void root.current?.requestFullscreen?.().catch(() => {
                  /* Expanded view is the fallback. */
                });
              } catch {
                /* Browsers without native fullscreen use the expanded view. */
              }
            }}
          >
            {expanded ? <Minimize size={17} /> : <Maximize size={17} />}
            {expanded ? "Exit fullscreen" : "Fullscreen"}
          </button>
        </div>
        <div className="visual-content">{children}</div>
      </section>
    </ExpandedContext.Provider>
  );
}
