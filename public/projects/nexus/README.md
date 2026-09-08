# Nexus Media

Approved public assets belong here. Configure their paths in `src/data/nexus.ts`
only when the files exist; the current empty configuration makes no requests.

| File | Capture | Placement |
| --- | --- | --- |
| cover.webp | Clean desktop + device composition, preferably 16:9 | Home preview and case cover |
| demo.mp4 | One complete 45-75 second flow, 16:9 | Case section 01, manual playback |
| poster.webp | Representative video frame | Video before playback |
| captions.vtt | Portuguese WebVTT captions for narration/audio | Native video caption track |
| desktop.webp | Request or task on the desktop | Case section 02 |
| device.webp | Corresponding result on the device | Case section 02 |
| detail.webp | A visible validation/approval, if useful | Case section 04 |

Example asset map, once the files are ready:

```ts
export const nexusMedia: NexusMedia = {
  cover: '/projects/nexus/cover.webp',
  video: '/projects/nexus/demo.mp4',
  poster: '/projects/nexus/poster.webp',
  captions: '/projects/nexus/captions.vtt',
  desktop: '/projects/nexus/desktop.webp',
  device: '/projects/nexus/device.webp',
  detail: '/projects/nexus/detail.webp',
}
```

Record a working, representative task: show the initial state, the desktop
request, any required confirmation, and the resulting device update. Keep both
sides legible; show the pointer deliberately and avoid rapid zooms. Clearly
identify any edits or accelerated waiting time. Add captions for narrated audio
and update the accompanying case text to describe the actual recorded flow.

Use demo data. Exclude keys, tokens, logs, personal notifications and internal
TCC documents. Do not expose a public control endpoint just for the portfolio.
Only reviewed public captures go in this folder, because it is deployed as-is.

Missing video keeps the honest pending state. Missing optional screenshots are
omitted. Invalid configured media shows a fallback instead of a broken element.
