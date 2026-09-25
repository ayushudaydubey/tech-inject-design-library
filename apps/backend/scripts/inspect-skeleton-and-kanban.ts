import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const col = mongoose.connection.collection("components");

  const skel = await col.findOne({ slug: "skeleton" });
  console.log("=== SKELETON DB RECORD ===");
  console.log("Preview Data:", skel?.previewData);
  console.log("Source Files:", skel?.sourceFiles);

  const pkb = await col.findOne({ slug: "pipeline-kanban-board" });
  console.log("\n=== PIPELINE KANBAN BOARD DB RECORD ===");
  console.log("Preview Data:", pkb?.previewData);
  console.log("Source Content:\n", pkb?.sourceFiles?.[0]?.content);

  const kb = await col.findOne({ slug: "kanban-board" });
  console.log("\n=== KANBAN BOARD DB RECORD ===");
  console.log("Preview Data:", kb?.previewData);

  await mongoose.disconnect();
}

check().catch(console.error);
