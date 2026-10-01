# Uptime Monitor

A mobile app for monitoring the availability of HTTP services. Add a URL, and the app checks it, records response times and notifies you when a service goes down or comes back up.

All data is stored locally on the device. There are no accounts, no servers and no tracking.

## Features

- HTTP/HTTPS checks with expected status code, optional keyword match and timeout
- Response time history and uptime per service
- Local notifications on state changes
- Light and dark mode

## Stack

Expo, Expo Router, expo-sqlite and [@ozanarslan/native-jsx](https://github.com/ozanarslan/native-jsx).

## Development

```sh
bun install
bunx expo run:ios      # or run:android
```

| Script         | Description                                                |
| -------------- | ---------------------------------------------------------- |
| `bun lint`     | Lint with oxlint                                           |
| `bun fm`       | Format with oxfmt                                          |
| `bun licenses` | Regenerate open-source license data (also runs on install) |

## Release build (Android)

```sh
bunx expo run:android --variant release --device
```

## Legal

- [Privacy policy](docs/privacy.md)
- [Terms of use](docs/terms.md)
