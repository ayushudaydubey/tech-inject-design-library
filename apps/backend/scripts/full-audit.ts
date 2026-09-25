import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const col = mongoose.connection.collection("components");
  const all = await col.find({}).sort({ createdAt: 1 }).toArray();

  console.log(`=== FULL AUDIT OF ALL ${all.length} COMPONENTS IN MONGODB ===\n`);

  const results: any[] = [];

  for (const c of all) {
    const issues: string[] = [];

    // 1. Slug & Name
    if (!c.slug) issues.push("Missing slug");
    if (!c.name) issues.push("Missing name");
    if (!c.description) issues.push("Missing description");
    if (!c.category) issues.push("Missing category");

    // 2. Source files
    if (!c.sourceFiles || c.sourceFiles.length === 0) {
      issues.push("No sourceFiles");
    } else {
      for (const sf of c.sourceFiles) {
        if (!sf.content || sf.content.trim().length === 0) {
          issues.push(`Empty sourceFile: ${sf.filename}`);
        }
      }
    }

    // 3. Supporting files
    const typesFile = c.supportingFiles?.find((f: any) => f.filename.includes("type"));
    if (!typesFile && (!c.sourceFiles?.[0]?.content?.includes("interface") && !c.sourceFiles?.[0]?.content?.includes("type "))) {
      issues.push("No types file and no types in sourceFile");
    }

    // 4. Preview data
    if (!c.previewData || c.previewData.trim().length === 0) {
      issues.push("Missing previewData");
    } else {
      try {
        JSON.parse(c.previewData);
      } catch (err: any) {
        issues.push(`Invalid previewData JSON: ${err.message}`);
      }
    }

    // 5. Documentation
    if (!c.propsDocumentation || c.propsDocumentation.trim().length === 0) {
      issues.push("Missing propsDocumentation");
    }
    if (!c.usageDocumentation || c.usageDocumentation.trim().length === 0) {
      issues.push("Missing usageDocumentation");
    }

    // 6. Agent Prompt
    if (!c.agentPrompt || c.agentPrompt.trim().length === 0) {
      issues.push("Missing agentPrompt");
    }

    // 7. CLI / Install Info
    if (!c.installInfo || !c.installInfo.packageManagerCommand || c.installInfo.packageManagerCommand.trim().length === 0) {
      issues.push("Missing installInfo.packageManagerCommand");
    }

    results.push({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      category: c.category,
      accessType: c.accessType,
      status: c.status,
      issues,
      isClean: issues.length === 0,
    });
  }

  const clean = results.filter((r) => r.isClean);
  const dirty = results.filter((r) => !r.isClean);

  console.log(`Clean Components: ${clean.length}/${results.length}`);
  console.log(`Components Needing Attention: ${dirty.length}/${results.length}\n`);

  if (dirty.length > 0) {
    console.log("--- ISSUES PER COMPONENT ---");
    for (const d of dirty) {
      console.log(`[${d.status.toUpperCase()}] [${d.accessType.toUpperCase()}] ${d.name} (${d.slug}):`);
      for (const iss of d.issues) {
        console.log(`   - ${iss}`);
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
