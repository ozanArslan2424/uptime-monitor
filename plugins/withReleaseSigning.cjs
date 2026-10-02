const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withReleaseSigning(config) {
	return withAppBuildGradle(config, (config) => {
		let gradle = config.modResults.contents;
		if (gradle.includes("signingConfigs.release")) {
			return config;
		}

		// Point buildTypes.release at the release signing config (must run before the insert below)
		gradle = gradle.replace(
			/(release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
			"$1signingConfig signingConfigs.release",
		);

		// Add signingConfigs.release, guarded so debug builds work without the properties
		gradle = gradle.replace(
			/signingConfigs \{/,
			`signingConfigs {
        release {
            if (project.hasProperty('UPLOAD_STORE_FILE')) {
                storeFile file(UPLOAD_STORE_FILE)
                storePassword UPLOAD_STORE_PASSWORD
                keyAlias UPLOAD_KEY_ALIAS
                keyPassword UPLOAD_KEY_PASSWORD
            }
        }`,
		);

		config.modResults.contents = gradle;
		return config;
	});
};
