import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { Alert, Linking } from "react-native";

import { SettingsPressableRow } from "@/components/settings/SettingsPressableRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsSwitchRow } from "@/components/settings/SettingsSwitchRow";
import { resetSettings, updateSettings, useSettings } from "@/features/settings/store";
import { LINKS } from "@/lib/constants";
import { getDatabase } from "@/lib/db";

const VERSION_TEXT = `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`;

export function SettingsView() {
	const styles = styleSheet.useWithColorScheme();
	const router = useRouter();
	const settings = useSettings();

	function confirmClearHistory() {
		Alert.alert(
			"Clear check history?",
			"All recorded checks will be removed. Your services are kept.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: async () => {
						const db = await getDatabase();
						await db.repositories.check.deleteAll();
					},
				},
			],
		);
	}

	function confirmDeleteAllData() {
		Alert.alert(
			"Delete all data?",
			"All services, check history and settings will be permanently removed from this device.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						const db = await getDatabase();
						await db.repositories.service.deleteAll();
						resetSettings();
					},
				},
			],
		);
	}

	return (
		<scroll-view contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
			<SettingsSection
				title="MONITORING"
				footer="When off, only https:// addresses can be added. Plain HTTP traffic is unencrypted."
			>
				<SettingsSwitchRow
					label="Allow HTTP addresses"
					value={settings.allowHttp}
					onValueChange={(allowHttp) => updateSettings({ allowHttp })}
				/>
			</SettingsSection>

			<SettingsSection title="NOTIFICATIONS">
				<SettingsPressableRow label="Notification settings" onPress={Linking.openSettings} />
			</SettingsSection>

			<SettingsSection
				title="DATA"
				footer="All data is stored only on this device. Nothing is collected or sent to us."
			>
				<SettingsPressableRow
					label="Clear check history"
					destructive
					onPress={confirmClearHistory}
				/>
				<SettingsPressableRow label="Delete all data" destructive onPress={confirmDeleteAllData} />
			</SettingsSection>

			<SettingsSection title="ABOUT">
				<SettingsPressableRow
					label="Privacy policy"
					onPress={() => Linking.openURL(LINKS.privacyPolicy)}
				/>
				<SettingsPressableRow
					label="Terms of use"
					onPress={() => Linking.openURL(LINKS.termsOfUse)}
				/>

				<SettingsPressableRow
					label="Open-source licenses"
					onPress={() => router.push("/licenses")}
				/>
				<SettingsPressableRow
					label="Contact support"
					onPress={() => Linking.openURL(`mailto:${LINKS.supportEmail}`)}
				/>
				<SettingsPressableRow label="Version" value={VERSION_TEXT} />
			</SettingsSection>
		</scroll-view>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	content: {
		padding: s.spacing(4),
		gap: s.spacing(6),
	},
}));
