# renet-api

Unofficial REST API for [Resident Evil Portal](https://game.capcom.com/residentevil/en/) (RE.NET). Scrapes player profiles and game data and serves them as clean JSON.

## Installation

```bash
npm install -g renet-api
```

Or locally in a project:

```bash
npm install renet-api
```

## Usage

### As a standalone server (CLI)

```bash
renet-api
# or on a custom port:
renet-api 8080
# or via environment variable:
PORT=8080 renet-api
```

The server starts at `http://localhost:3000` by default.

### As a library (Node.js)

```js
import { getProfile, getGameDetail, searchUsers } from "renet-api";

// Get a player profile by user ID
const profile = await getProfile("1944925");
console.log(profile.username); // "metju"

// Search for players by username
const results = await searchUsers("metju");
console.log(results); // [{ username: "metju", userId: "1944925" }]

// Get detailed game data
const game = await getGameDetail("2604056", "requiem", "ps5");
console.log(game.story.overallPercent); // "55%"
```

### Embed the server in your own app

```js
import { createServer } from "renet-api";

const app = createServer();
app.listen(3000, () => console.log("Running"));
```

---

## REST API Reference

### `GET /profile/:userId`

Returns the player's profile page data — username, bio, avatar, ambassador info, and a list of all linked games with their stats.

**Example:** `GET /profile/1944925`

```json
{
  "ok": true,
  "data": {
    "userId": "1944925",
    "username": "metju",
    "bio": "^_^",
    "avatar": "https://game.capcom.com/residentevil/image/collection/icon/...",
    "ambassadorImg": "https://r.ambassador.jp/uimg/re/...",
    "capcomId": "auth0|...",
    "ambassadorId": "1000251342",
    "games": [
      {
        "slug": "requiem",
        "name": "Resident Evil Requiem",
        "platform": "ps5",
        "link": "https://game.capcom.com/...",
        "stats": {
          "Story": "55%",
          "RECORDS": "49 / 50"
        }
      }
    ]
  }
}
```

> **Note:** The `userId` in the profile URL (e.g. `p1944925`) is different from the `userId` used in game detail URLs. Use the `link` field from `games[]` to extract the correct ID for `/game/` requests.

---

### `GET /game/:userId/:slug/:platform`

Returns detailed data for a specific game — story progress, play time, difficulty completions, best times, and the full challenges list with global completion percentages.

The `userId` here is the numeric ID found in game URLs like `.../o2604056.html` — **not** the profile ID.

**Example:** `GET /game/2604056/requiem/ps5`

```json
{
  "ok": true,
  "data": {
    "slug": "requiem",
    "platform": "ps5",
    "story": {
      "overallPercent": "55%",
      "totalPlayTime": "45 : 57' 48\"",
      "difficulties": [
        { "difficulty": "Casual", "completed": true },
        { "difficulty": "Standard (Modern)", "completed": false }
      ],
      "bestTimes": ["3:57'51\"", "0:00'00\"", "0:00'00\"", "4:54'43\""]
    },
    "challenges": {
      "completed": 49,
      "total": 50,
      "list": [
        {
          "name": "Déjà vu",
          "completed": true,
          "mission": "Encounter an outbreak in Wrenwood.",
          "globalCompletionPercent": 96.0,
          "reward": {
            "name": "Norman Cole",
            "img": "https://game.capcom.com/...",
            "type": "ICON"
          }
        }
      ]
    }
  }
}
```

**Available slugs:**

| Slug | Game |
|------|------|
| `requiem` | Resident Evil Requiem |
| `four` | Resident Evil 4 |
| `village` | Resident Evil Village |
| `three` | Resident Evil 3 |
| `two` | Resident Evil 2 |
| `seven` | Resident Evil 7 biohazard |
| `rev2` | Resident Evil Revelations 2 |
| `one` | Resident Evil |
| `rev` | Resident Evil Revelations |
| `six` | Resident Evil 6 |
| `uc` | Umbrella Corps |
| `resistance` | Resident Evil Resistance |

**Available platforms:**

| Value | Platform |
|-------|----------|
| `ps5` | PlayStation 5 |
| `ps4` | PlayStation 4 |
| `ps3` | PlayStation 3 |
| `steam` | PC (Steam) |
| `xseries` | Xbox Series |
| `xone` | Xbox One |
| `x360` | Xbox 360 |
| `nsw` | Nintendo Switch |
| `nsw2` | Nintendo Switch 2 |
| `epic` | Epic Games |

---

### `GET /search?q=:username`

Searches RE.NET for players matching the given username.

**Example:** `GET /search?q=metju`

```json
{
  "ok": true,
  "results": [
    { "username": "metju", "userId": "1944925" }
  ]
}
```

---

### `GET /lookup?username=:username`

Convenience endpoint — searches for the username and immediately returns the full profile of the first result.

**Example:** `GET /lookup?username=metju`

Returns the same response as `/profile/:userId`.

---

## How to find your userId

Your user ID is in the URL of your RE.NET profile page:

```
https://game.capcom.com/residentevil/en/p1944925.html
                                                ↑ this is your userId
```

For game detail requests, the ID is different — it's in the game page URL:

```
https://game.capcom.com/residentevil/requiem/en/playstation5/o2604056.html
                                                                ↑ use this for /game/
```

Both IDs are returned in the `/profile/` response — the game `link` field contains the correct URL to extract from.

---

## Requirements

- Node.js 18 or higher

---

## Disclaimer

This is an unofficial, community-made tool. It is not affiliated with or endorsed by Capcom. Use responsibly.