// publish.js
require("dotenv").config(); // Lataa GH_TOKEN ym.
const builder = require("electron-builder");

builder.build({
  publish: "always"
}).then(() => {
  console.log("✅ Published successfully!");
}).catch((err) => {
  console.error("❌ Publish failed:", err);
});
