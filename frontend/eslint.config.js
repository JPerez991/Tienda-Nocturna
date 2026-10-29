import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Páginas que exportan mapas auxiliares (ej. ESTADO_PEDIDO) avisan,
      // no fallan: la regla queda como advertencia.
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Patrón fetch-on-mount: el reset sincrónico (setError(null)) al
      // inicio del efecto es deliberado (ver React: "You Might Not Need an
      // Effect"); lo dejamos como advertencia, no como error.
      "react-hooks/set-state-in-effect": "warn",
      // Usamos `void promesa` en handlers a propósito.
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
);
