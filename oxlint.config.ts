import nativeJsx from "@ozanarslan/native-jsx/oxlint";
import { defineConfig } from "oxlint";
import native from "oxlint-config-universe/native";

export default defineConfig({
	extends: [native, nativeJsx],
	rules: {
		"typescript/no-empty-object-type": "off",
		"eslint/no-void": "off",
	},
});
