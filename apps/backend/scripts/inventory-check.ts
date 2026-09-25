import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function run() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set!");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully to MongoDB.");

  const collection = mongoose.connection.collection("components");
  const count = await collection.countDocuments();
  console.log(`Total documents in 'components' collection: ${count}`);

  const components = await collection.find({}).toArray();

  const inventory: any[] = [];
  const slugMap = new Map<string, any[]>();
  const normNameMap = new Map<string, any[]>();

  for (const c of components) {
    const normName = normalize(c.name || "");
    const normSlug = normalize(c.slug || "");

    const item = {
      id: c._id.toString(),
      name: c.name,
      normalizedName: normName,
      slug: c.slug,
      normalizedSlug: normSlug,
      category: c.category,
      accessTier: c.accessType,
      status: c.status,
      sourceFilesCount: c.sourceFiles?.length || 0,
      sourceFilenames: (c.sourceFiles || []).map((f: any) => f.filename),
      supportingFilesCount: c.supportingFiles?.length || 0,
      supportingFilenames: (c.supportingFiles || []).map((f: any) => f.filename),
      hasDependencies: Boolean(c.declaredDependencies && Object.keys(c.declaredDependencies).length > 0),
      dependencies: c.declaredDependencies || {},
      hasPreviewData: Boolean(c.previewData && c.previewData.trim().length > 0),
      hasPropsDoc: Boolean(c.propsDocumentation && c.propsDocumentation.trim().length > 0),
      hasUsageDoc: Boolean(c.usageDocumentation && c.usageDocumentation.trim().length > 0),
      hasAgentPrompt: Boolean(c.agentPrompt && c.agentPrompt.trim().length > 0),
      hasCliInfo: Boolean(c.installInfo?.packageManagerCommand),
      cliCommand: c.installInfo?.packageManagerCommand || "",
    };

    inventory.push(item);

    if (!slugMap.has(c.slug)) slugMap.set(c.slug, []);
    slugMap.get(c.slug)!.push(c);

    if (!normNameMap.has(normName)) normNameMap.set(normName, []);
    normNameMap.get(normName)!.push(c);
  }

  console.log("\n=== INVENTORY SUMMARY ===");
  console.log(`Total items: ${inventory.length}`);

  let duplicateSlugs = 0;
  for (const [slug, list] of slugMap.entries()) {
    if (list.length > 1) {
      console.warn(`DUPLICATE SLUG: ${slug} (${list.length} occurrences)`);
      duplicateSlugs++;
    }
  }

  let duplicateNames = 0;
  for (const [normName, list] of normNameMap.entries()) {
    if (list.length > 1) {
      console.warn(`DUPLICATE NORMALIZED NAME: ${normName} (${list.length} occurrences: ${list.map(l => l.name).join(", ")})`);
      duplicateNames++;
    }
  }

  console.log(`Duplicate slugs: ${duplicateSlugs}`);
  console.log(`Duplicate normalized names: ${duplicateNames}`);

  console.log("\n=== COMPONENT LIST ===");
  for (const item of inventory) {
    const isComplete =
      item.sourceFilesCount > 0 &&
      item.hasPreviewData &&
      item.hasPropsDoc &&
      item.hasUsageDoc &&
      item.hasAgentPrompt &&
      item.hasCliInfo;

    console.log(
      `[${item.status.toUpperCase()}] [${item.accessTier.toUpperCase()}] [${item.category}] "${item.name}" (slug: "${item.slug}") - Complete: ${isComplete ? "YES" : "NO"}`
    );
  }

  const freeCount = inventory.filter((c) => c.accessTier === "free").length;
  const premCount = inventory.filter((c) => c.accessTier === "premium").length;
  const categories = [...new Set(inventory.map((c) => c.category))];

  console.log(`\nFree count: ${freeCount}`);
  console.log(`Premium count: ${premCount}`);
  console.log(`Categories (${categories.length}):`, categories);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Error running inventory check:", err);
  process.exit(1);
});
