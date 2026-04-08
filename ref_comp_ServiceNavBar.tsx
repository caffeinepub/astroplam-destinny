import { useNavigate } from "@tanstack/react-router";

const LINKS = [
  { icon: "\uD83C\uDFE0", label: "Home", path: "/" },
  { icon: "\u2B50", label: "Astro Chart", path: "/horoscope" },
  { icon: "\uD83D\uDD22", label: "Numerology", path: "/numerology" },
];

export default function ServiceNavBar() {
  const navigate = useNavigate();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";
  return (
    <nav className="w-full px-3 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none bg-amber-50 border-b border-amber-100">
      {LINKS.map((link) => {
        const isActive =
          link.path === "/"
            ? currentPath === "/"
            : currentPath.startsWith(link.path);
        return (
          <button
            key={link.path}
            type="button"
            data-ocid={`service_nav.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
            onClick={() =>
              navigate({
                to: link.path as
                  | "/"
                  | "/horoscope"
                  | "/numerology"
                  | "/courses",
              })
            }
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              color: isActive ? "#ffffff" : "#a07845",
              background: isActive ? "#c8a96e" : "transparent",
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
