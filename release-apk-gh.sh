set -e

npx expo prebuild -p android --clean

cd android
./gradlew assembleRelease
cd ..

VERSION=$(node -p "require('./app.json').expo.version")

cp android/app/build/outputs/apk/release/app-release.apk uptime-monitor-${VERSION}.apk
gh release create v${VERSION} uptime-monitor-${VERSION}.apk --title "v${VERSION}" --generate-notes
