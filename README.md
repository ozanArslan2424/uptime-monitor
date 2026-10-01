# Uptime Monitor: Outline

## Data model

- **Service**: `id`, `name`, `url`, `method` (GET/HEAD), `expectedStatus` (default 200), `keyword?` (must appear in the body), `timeoutMs`, `enabled`, `createdAt`
- **Check**: `id`, `serviceId`, `timestamp`, `ok`, `statusCode?`, `responseTimeMs?`, `error?` (timeout, DNS, keyword missing, wrong status)
- **Derived**, not stored: current status, uptime % over 24h and 7d, average response time, and when the last state change happened

## Core logic

- **`checkService(service)`**
  - Runs `fetch` with an `AbortController` timeout.
  - Measures response time.
  - Validates the status code, then the keyword if one is set.
  - Returns a `Check`.
- **`runAllChecks()`**
  - Checks every enabled service in parallel.
  - Saves the results.
  - Compares each result to the previous check and notifies on a state change (up to down, or down to up).
- **Retention**: keep the last N checks per service (for example 500) and prune on insert.

## Screens (expo-router)

1. **`/` Service list**
   - Each row shows a status dot, name, host, last response time, and time since the last check.
   - Pull-to-refresh calls `runAllChecks()`.
   - The header shows a summary, like "3/4 up".
2. **`/service/new`** and **`/service/[id]/edit`**
   - Form fields for URL, name, expected status, keyword, timeout, and enabled.
   - Validates the URL.
   - Has a "Test now" button.
3. **`/service/[id]` Detail**
   - Current status and uptime %.
   - Response-time sparkline built from `view` bars.
   - Recent checks list with timestamp, code, time, and error.
   - Actions: check now, edit, delete.
4. **`/settings`**
   - Check interval.
   - Notification toggle.
   - Clear history.

## Background checks

- **Library**: `expo-background-task` (it replaces `expo-background-fetch` in recent SDKs).
- **Scheduling limits**: iOS decides when the task runs, roughly every 15 minutes at best and not guaranteed. Android is more reliable.
- **Foreground fallback**: run checks on app focus (`AppState`) and on a timer while the app is open.

## Notifications

- **Library**: `expo-notifications`, local notifications only.
- **When to notify**: only on state transitions, so there's no spam while a service stays down.
- **Content**: for example "api.paketera.com is DOWN (timeout)" and "… is back UP after 12m".

## Storage

- **Library**: `expo-sqlite`, with a `services` table and a `checks` table indexed on `(serviceId, timestamp)`.

## Dependencies

`expo-router`, `expo-sqlite`, `expo-background-task`, `expo-task-manager`, `expo-notifications`

## Build order

1. Data layer and `checkService`
2. List screen with manual refresh
3. Add/edit form
4. Detail screen with sparkline
5. Notifications on state change
6. Background task
