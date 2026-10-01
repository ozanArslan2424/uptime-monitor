import { type AndroidSymbol, unstable_getMaterialSymbolSourceAsync } from "expo-symbols";
import { useEffect, useState } from "react";
import { Platform, type ImageSourcePropType } from "react-native";
import type { SFSymbol } from "sf-symbols-typescript";

interface Args {
	ios: SFSymbol;
	android: AndroidSymbol;
	size: number;
	color: string;
}

export function useIcon(args: Args): SFSymbol | ImageSourcePropType | undefined {
	const [androidSource, setAndroidSource] = useState<ImageSourcePropType>();

	useEffect(() => {
		if (Platform.OS !== "android") return;

		let cancelled = false;
		unstable_getMaterialSymbolSourceAsync(args.android, args.size, args.color).then((source) => {
			if (!cancelled) setAndroidSource(source ?? undefined);
		});

		return () => {
			cancelled = true;
		};
	}, [args.android, args.size, args.color]);

	switch (Platform.OS) {
		case "ios":
			return args.ios;
		case "android":
			return androidSource;
		case "windows":
		case "macos":
		case "web":
		default:
			return androidSource;
	}
}
