# Swell

An unofficial Tidal app for LG webOS TVs (webOS 23 / 2023 models or newer), built for personal and family use.
Swell is not affiliated with Tidal. A Tidal subscription is required.

- Big cover grids, artist pages with full discography, top charts, fast search with an on-screen keyboard
- Now Playing with synced lyrics and the real stream quality (codec, bit depth, sample rate)
- Queue you can reorder with the remote
- Colours that follow the cover art: a soft glow and an accent taken from the cover, with a slow cross-fade
- Made for the remote: arrows move, OK selects, hold OK for options, Back returns; the Magic Remote pointer works too

Playback, sign-in and catalogue access go through Tidal's official libraries
(`@tidal-music/player`, `@tidal-music/auth`, `@tidal-music/api`). No unofficial APIs are used.

## How it fits together

```
TV app (webos/)  ──opens──▶  https://lankyfranky89.github.io/Swell/   (this repo, GitHub Pages)
                                   │
                         Sign in ──▶ login.tidal.com ──▶ https://lankyfranky89.github.io/Swell/callback/
```

The TV app is a tiny launcher. The real app lives on GitHub Pages, because Tidal's sign-in must return to a real
`https://` address. Updates to the site reach the TV without reinstalling.

## One-time setup

1. **Client ID.** Put your Tidal client ID in `src/js/config.js` (`CLIENT_ID`). It is not a secret.
2. **Tidal dashboard** (developer.tidal.com, your app):
   - Redirect URI: `https://lankyfranky89.github.io/Swell/callback/` (exactly, with the capital S and the last slash)
   - Scopes: `user.read`, `collection.read`, `collection.write`, `playlists.read`, `search.read`,
     `recommendations.read`, `playback`, `entitlements.read`
3. **Build and publish the site:**
   ```sh
   npm install
   npm run build        # builds and copies the site to the repo root
   git add -A && git commit -m "Update site" && git push
   ```

## Install on the TV (developer mode)

You need the LG webOS CLI on your computer: `npm install -g @webos-tools/cli`.

1. On the TV, open the **Developer Mode** app, sign in, and make sure Dev Mode Status and Key Server are on.
2. Register the TV once:
   ```sh
   ares-setup-device            # add a device named "tv" with the IP shown in the Developer Mode app
   ares-novacom -d tv --getkey  # enter the passphrase shown on the TV
   ```
3. Install and start Swell:
   ```sh
   ares-install -d tv tv/com.lankyfranky89.swell_0.1.0_all.ipk
   ares-launch -d tv com.lankyfranky89.swell
   ```

To rebuild the TV package after changing `webos/`: `npm run package:tv`.

Developer mode expires after a while. Open the Developer Mode app on the TV and press **Extend**
(or run `ares-extend-dev -d tv`), otherwise sideloaded apps are removed.

## Try it without signing in

Open `https://lankyfranky89.github.io/Swell/?demo=1` (or choose **Try demo mode** on the sign-in screen).
Demo mode uses invented artists and albums and a pretend player, so every screen can be tried.

## Remote

| Button | Action |
| --- | --- |
| Arrows | Move focus |
| OK | Select / play |
| Hold OK | Options (play next, add to queue, go to album or artist, favorite) |
| Back | Return; on Home, jumps to the side menu |
| Play / Pause / ⏩ / ⏪ | Control playback anywhere |
| Left / Right on the seek bar | Seek 10 seconds |
| Left / Right in the queue | Move a track earlier or later |

## Known limits

- Top charts come from Tidal's editorial pages when available, otherwise from Tidal's own chart playlists.
- Play reports are sent through Tidal's event producer to `events.tidal.com`; this address comes from Tidal's SDK
  docs and may need adjusting. Playback keeps working if it fails.
- Tested in demo mode in a desktop browser. Real playback depends on the TV's web engine and Widevine support.
