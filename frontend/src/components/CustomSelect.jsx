import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  className = "",
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
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                  active
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                <span className="truncate">{option.label}</span>
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
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-left text-sm transition-all duration-200 ${
          open
            ? "border-neutral-950 bg-white ring-4 ring-neutral-100"
            : "border-neutral-200 hover:border-neutral-300"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={
            selectedOption
              ? "truncate text-neutral-950"
              : "truncate text-neutral-400"
          }
        >
          {selectedOption?.label || placeholder}
        </span>

        <span
          className={`ml-4 shrink-0 text-neutral-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(menu, document.body)}
    </div>
  );
}

export default CustomSelect;
