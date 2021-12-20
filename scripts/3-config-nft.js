import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0xB375409a0b3BCd62B35Edb6925803b45ecEA0000",
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "BCI Chair",
        description: "Enter the matrix, join MiruDAO",
        image: readFileSync("scripts/assets/enterthematrix.jpeg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()