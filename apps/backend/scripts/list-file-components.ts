import { freeComponents } from "../../../scripts/data/free-components";
import { premiumComponents } from "../../../scripts/data/premium-components";

console.log("=== FREE COMPONENTS DEFINED IN FILE ===");
freeComponents.forEach((c, i) => console.log(`${i + 1}. [${c.category}] ${c.name} (${c.slug})`));

console.log("\n=== PREMIUM COMPONENTS DEFINED IN FILE ===");
premiumComponents.forEach((c, i) => console.log(`${i + 1}. [${c.category}] ${c.name} (${c.slug})`));
