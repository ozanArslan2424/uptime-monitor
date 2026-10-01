import { FlatList } from "react-native";

import { LicenseRow } from "@/components/licenses/LicenseRow";
import { LICENSES } from "@/lib/constants";

export function LicensesView() {
	const styles = styleSheet.useWithColorScheme();

	return (
		<FlatList
			data={LICENSES}
			contentInsetAdjustmentBehavior="automatic"
			keyExtractor={(license) => `${license.name}@${license.version}`}
			ListHeaderComponent={
				<text style={styles.header}>
					This app is built with the following open-source software. Tap a package to read its
					license.
				</text>
			}
			renderItem={(item) => <LicenseRow license={item.item} />}
		/>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	header: {
		...s.text.xs,
		color: s.color.mutedForeground,
		padding: s.spacing(4),
	},
}));
