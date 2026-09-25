import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const col = mongoose.connection.collection("components");

  const nb = await col.findOne({ slug: "notification-banner" });
  console.log("=== NOTIFICATION BANNER ===");
  console.log({
    name: nb?.name,
    slug: nb?.slug,
    sourceFilesCount: nb?.sourceFiles?.length,
    sourceFiles: nb?.sourceFiles,
    supportingFilesCount: nb?.supportingFiles?.length,
    supportingFiles: nb?.supportingFiles,
    themeFilesCount: nb?.themeFiles?.length,
    themeFiles: nb?.themeFiles,
    previewData: nb?.previewData,
    propsDocumentation: nb?.propsDocumentation,
    usageDocumentation: nb?.usageDocumentation,
    agentPrompt: nb?.agentPrompt,
    installInfo: nb?.installInfo,
  });

  const ctf = await col.findOne({ slug: "copyable-text-field" });
  console.log("\n=== COPYABLE TEXT FIELD ===");
  console.log({
    name: ctf?.name,
    slug: ctf?.slug,
    sourceFilesCount: ctf?.sourceFiles?.length,
    installInfo: ctf?.installInfo,
  });

  await mongoose.disconnect();
}
inspect().catch(console.error);
