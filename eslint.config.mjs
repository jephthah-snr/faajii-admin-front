import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next ships native flat configs from v16, so the old
// FlatCompat/eslintrc bridge is no longer needed.
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
