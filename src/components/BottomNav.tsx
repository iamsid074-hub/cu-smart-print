import { memo, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Utensils, ShoppingBag, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const NAV_ITEMS = [
  { to: "/home",    icon: Home,        label: "Home",    color: "#6366f1" },
  { to: "/food",    icon: Utensils,    label: "Food",    color: "#f97316" },
  { to: "/grocery", icon: ShoppingBag, label: "Grocery", color: "#10b981" },
  { to: "/wallet",  icon: Wallet,      label: "Wallet",  color: "#8b5cf6" },
];

const BottomNav = () => {
  const location    = useLocation();
  const { totalItems } = useCart();

  const activeIndex = useMemo(
    () => NAV_ITEMS.findIndex((i) => location.pathname.startsWith(i.to)),
    [location.pathname]
  );

  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/admin")
  ) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
    >
      {/* Glass bar */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          margin: "0 12px 10px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 -2px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          height: "62px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sliding active background */}
        {activeIndex !== -1 && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              bottom: "8px",
              left: `calc(${activeIndex * 25}% + 8px)`,
              width: "calc(25% - 16px)",
              borderRadius: "16px",
              background: NAV_ITEMS[activeIndex].color + "14",
              transition: "left 0.28s cubic-bezier(0.34,1.4,0.64,1)",
              willChange: "left",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          const Icon = item.icon;
          const showBadge = item.to === "/grocery" && totalItems > 0;

          return (
            <Link
              key={item.to}
              to={item.to}
              tabIndex={-1}
              draggable={false}
              onMouseDown={(e) => e.preventDefault()}
              style={{
                flex: "1 1 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                height: "100%",
                textDecoration: "none",
                outline: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Icon wrapper */}
              <div style={{ position: "relative" }}>
                <Icon
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{
                    width: isActive ? "1.3rem" : "1.2rem",
                    height: isActive ? "1.3rem" : "1.2rem",
                    color: isActive ? item.color : "#9ca3af",
                    transition: "color 0.2s ease, width 0.2s ease, height 0.2s ease",
                    display: "block",
                  }}
                />
                {showBadge && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-7px",
                    background: "#f97316", color: "#fff",
                    fontSize: "8px", fontWeight: 900, minWidth: "13px", height: "13px",
                    paddingInline: "2px", borderRadius: "99px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>

              {/* Label */}
              <span style={{
                fontSize: "10px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? item.color : "#9ca3af",
                transition: "color 0.2s ease, font-weight 0.2s ease",
                lineHeight: 1,
                userSelect: "none",
                pointerEvents: "none",
              }}>
                {item.label}
              </span>

              {/* Active underline dot */}
              <div style={{
                position: "absolute",
                bottom: "6px",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: item.color,
                opacity: isActive ? 1 : 0,
                transform: `scale(${isActive ? 1 : 0})`,
                transition: "opacity 0.2s ease, transform 0.2s cubic-bezier(0.34,1.6,0.64,1)",
              }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default memo(BottomNav);
