import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import eslintComments from "eslint-plugin-eslint-comments";
import noUseExtendNative from "eslint-plugin-no-use-extend-native";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            import: importPlugin,
            unicorn,
            "eslint-comments": eslintComments,
            "no-use-extend-native": noUseExtendNative,
        },
        rules: {
            "no-use-extend-native/no-use-extend-native": "error",
            "eslint-comments/no-unused-disable": "error",
            "unicorn/prefer-node-protocol": "error",
            "import/no-duplicates": "error",
        },
    },
    {
        ignores: ["**/dist/**", "**/node_modules/**"],
    },
);
