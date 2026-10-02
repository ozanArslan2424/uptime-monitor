import { defineDesignSystem } from "@ozanarslan/native-jsx";

export const designSystem = defineDesignSystem({
	palette: {
		serviceUp: "#4ade80",
		serviceDown: "#f87171",
	},
	modes: {
		dark: {
			color: {
				background: "#0b0b0d",
				foreground: "#ededef",
				card: "#161619",
				cardForeground: "#ededef",
				primary: "#34d399",
				primaryForeground: "#05140d",
				secondary: "#1f1f23",
				secondaryForeground: "#ededef",
				muted: "#1f1f23",
				mutedForeground: "#8b8b93",
				accent: "#132a1e",
				accentForeground: "#6ee7b7",
				destructive: "#f87171",
				destructiveForeground: "#1a0707",
				border: "#27272c",
				input: "#2e2e34",
				ring: "#34d399",
			},
		},
		light: {
			color: {
				background: "#f2f2f7",
				foreground: "#111114",
				card: "#ffffff",
				cardForeground: "#111114",
				primary: "#047857",
				primaryForeground: "#ffffff",
				secondary: "#e5e5ea",
				secondaryForeground: "#111114",
				muted: "#e5e5ea",
				mutedForeground: "#6b6b73",
				accent: "#d1fae5",
				accentForeground: "#065f46",
				destructive: "#dc2626",
				destructiveForeground: "#ffffff",
				border: "#d9d9de",
				input: "#d1d1d6",
				ring: "#047857",
			},
		},
	},
});

declare module "@ozanarslan/native-jsx" {
	interface Register {
		designSystem: typeof designSystem;
	}
}
