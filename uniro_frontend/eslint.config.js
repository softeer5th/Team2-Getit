import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default tseslint.config(
	{ ignores: ["dist"] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended, pluginQuery.configs["flat/recommended"]],
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			prettier: eslintPluginPrettier,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
			"no-console": "warn",
			eqeqeq: ["error", "always"],
			indent: "off",
			semi: "off",
			quotes: "off",
			"@typescript-eslint/no-unused-vars": ["warn"],
			"react/react-in-jsx-scope": "off",
		},
	},
);
