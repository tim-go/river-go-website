import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const measurementId =
  process.env.RIVERLAUNCH_FIREBASE_MEASUREMENT_ID ||
  process.env.VITE_FIREBASE_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
  "";

const outputPath = resolve("public/assets/analytics-config.js");

mkdirSync(dirname(outputPath), { recursive: true });

writeFileSync(
  outputPath,
  `window.RIVERLAUNCH_ANALYTICS_CONFIG = ${JSON.stringify(
    {
      measurementId,
    },
    null,
    2,
  )};\n`,
);

if (measurementId) {
  console.log(`Wrote analytics config for ${measurementId}`);
} else {
  console.log("Wrote analytics config with analytics disabled");
}
