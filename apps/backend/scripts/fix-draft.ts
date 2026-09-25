import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function fixDraft() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const col = mongoose.connection.collection("components");

  await col.updateOne(
    { slug: "customer-activity-feed" },
    {
      $set: {
        supportingFiles: [
          {
            filename: "types.ts",
            path: "types.ts",
            content: `export interface ActivityItem {\n  id: string;\n  title: string;\n  timestamp: string;\n  type: 'call' | 'email' | 'meeting' | 'note';\n}\n\nexport interface CustomerActivityFeedProps {\n  items?: ActivityItem[];\n}`,
            fileType: "ts",
            language: "typescript",
          },
        ],
      },
    }
  );

  console.log("Draft customer-activity-feed updated with types.ts");
  await mongoose.disconnect();
}

fixDraft().catch(console.error);
