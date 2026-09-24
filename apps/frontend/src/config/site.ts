export const siteConfig = {
  name: "Tech Inject Design Library",
  shortName: "Tech Inject UI",
  description:
    "Enterprise design system and modular component catalogue for high-velocity engineering teams.",
  url: "http://localhost:3000",
  navItems: [
    { label: "Catalogue", href: "/components" },
    { label: "Get Started", href: "/get-started" },
  ],
  links: {
    github: "https://github.com",
    admin: "http://localhost:3000",
    docs: "/get-started",
  },
  cli: {
    commandPrefix: "npx tech-inject add",
    authFlag: "--auth",
  },
};
