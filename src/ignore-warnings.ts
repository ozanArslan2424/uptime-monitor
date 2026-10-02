import { LogBox } from "react-native";

const IGNORED = [
	"DrawerLayoutAndroid is deprecated",
	"[Reanimated] Dependencies should only be used on the web",
];

LogBox.ignoreLogs(IGNORED);

const warn = console.warn;
console.warn = (...args: unknown[]) => {
	const message = String(args[0]);
	if (IGNORED.some((ignored) => message.includes(ignored))) {
		return;
	}
	warn(...args);
};
