import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * options: [{ value, label, imageUrl? }]
 * imageUrl (optional): logo hiện bên trái label
 */
function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  className = "",
  showImage = true,
}) {
  const [open, setOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 280,
  });

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );

  const updateMenuPosition = () => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();

    const spacing = 8;
    const viewportPadding = 12;

    const availableBelow =
      window.innerHeight - rect.bottom - spacing - viewportPadding;

    const availableAbove = rect.top - spacing - viewportPadding;

    const shouldOpenAbove =
      availableBelow < 220 && availableAbove > availableBelow;

    const menuHeight = Math.min(
      280,
      shouldOpenAbove ? availableAbove : availableBelow,
    );

    setMenuPosition({
      left: rect.left,
      width: rect.width,
      top: shouldOpenAbove
        ? Math.max(
            viewportPadding,
            rect.top - spacing - Math.max(menuHeight, 120),
          )
        : rect.bottom + spacing,
      maxHeight: Math.max(menuHeight, 120),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    updateMenuPosition();

    const handleResize = () => {
      updateMenuPosition();
    };

    const handleScroll = () => {
      updateMenuPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (option) => {
    if (disabled) {
      return;
    }

    onChange(option.value);
    setOpen(false);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  };

  const toggleOpen = () => {
    if (disabled) {
      return;
    }

    setOpen((current) => !current);
  };

  const menu = (
    <div
      ref={menuRef}
      role="listbox"
      className="fixed z-[9999] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        width: `${menuPosition.width}px`,
      }}
    >
      <div
        className="overflow-y-auto overscroll-contain"
        style={{
          maxHeight: `${menuPosition.maxHeight}px`,
        }}
      >
        {options.length === 0 ? (
          <div className="px-3 py-3 text-sm text-neutral-400">No options</div>
        ) : (
          options.map((option) => {
            const active = String(option.value) === String(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                  active
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                {showImage && (
                  <OptionThumb imageUrl={option.imageUrl} active={active} />
                )}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-left text-sm text-neutral-950 outline-none transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? "border-neutral-950 bg-white ring-4 ring-neutral-100" : ""
        }`}
      >
        {selectedOption ? (
          <>
            {showImage && <OptionThumb imageUrl={selectedOption.imageUrl} />}
            <span className="min-w-0 flex-1 truncate">
              {selectedOption.label}
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-neutral-400">
            {placeholder}
          </span>
        )}

        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && createPortal(menu, document.body)}
    </div>
  );
}

/**
 * Thumbnail logo 24x24 — placeholder xám nếu không có ảnh
 */
function OptionThumb({ imageUrl, active = false }) {
  if (!imageUrl) {
    return (
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[9px] font-medium ${
          active
            ? "border-white/20 bg-white/10 text-white/50"
            : "border-neutral-200 bg-neutral-100 text-neutral-300"
        }`}
        aria-hidden="true"
      >
        —
      </span>
    );
  }

  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white ${
        active ? "border-white/25" : "border-neutral-200"
      }`}
    >
      <img
        src={imageUrl}
        alt=""
        className="h-full w-full object-contain p-0.5"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}

export default CustomSelect;
