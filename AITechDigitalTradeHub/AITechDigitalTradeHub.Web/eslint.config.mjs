import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // Existing effects intentionally synchronize local UI state when an
      // external mode/profile changes. Refactor them incrementally.
      "react-hooks/set-state-in-effect": "off"
    }
  },
  globalIgnores([".next/**", "node_modules/**", "out/**", "dist/**", "next-env.d.ts"])
]);
