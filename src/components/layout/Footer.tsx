import { Link } from "react-router-dom";
import { FlashLogo } from "@/components/FlashLogo";

const links = {
  Product: [
    { label: "Templates", href: "/templates" },
    { label: "AI Tools", href: "/ai-tools" },
    { label: "Editor", href: "/editor" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Help Center", href: "#" },
    { label: "Tutorials", href: "#" },
    { label: "Community", href: "#" },
    { label: "API", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 px-4 py-12">
      <div className="container mx-auto">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-1">
            <FlashLogo />
            <p className="mt-3 text-sm text-muted-foreground">
              Create anything. Instantly.
            </p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold">{title}</h4>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Flash AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
