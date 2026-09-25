import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const col = mongoose.connection.collection("components");
  const all = await col.find({}).sort({ category: 1, name: 1 }).toArray();

  console.log(`SLUG | NAME | CATEGORY | ACCESS | STATUS`);
  console.log(`------------------------------------------------------------------`);
  for (const c of all) {
    console.log(`${c.slug.padEnd(25)} | ${c.name.padEnd(25)} | ${c.category.padEnd(16)} | ${c.accessType.padEnd(7)} | ${c.status}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
