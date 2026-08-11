import { basename } from "node:path";

const inputPaths = process.argv.filter((value) => value.endsWith(".wav"));
process.stdout.write(
  JSON.stringify({
    results: inputPaths.map((inputPath) => ({ text: `local:${basename(inputPath)}` })),
  }),
);
