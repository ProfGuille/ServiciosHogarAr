// fix-import-extensions.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "src");

async function fixImports(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await fixImports(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      let content = await fs.readFile(fullPath, "utf-8");

      const updated = content.replace(
        /from\s+["'](\.[^"']*?)(?<!\.js|\.ts)["']/g,
        (_match, p1) => `from "${p1}.js"`
      );

      if (updated !== content) {
        await fs.writeFile(fullPath, updated);
        console.log(`✔️  Fixed imports in: ${fullPath}`);
      }
    }
  }
}

fixImports(SRC_DIR).catch(console.error);

