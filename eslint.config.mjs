import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
  ...compat.config({
    extends: ["next"], 
    rules: {
      "react/no-unescaped-entities": "off",
    },
  }),
];

export default eslintConfig;