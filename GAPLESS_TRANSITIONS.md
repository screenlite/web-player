# Gapless Transitions

This document explains how the web player achieves seamless, gap-free transitions between media items in a playlist section.

## Overview

Gapless playback works by preloading the next media item before the current one ends. The player maintains multiple HTML media elements per section simultaneously — one actively playing, one silently preloading — and swaps visibility at the precise transition moment.

## Architecture

### Relevant Files

- [src/utils/calculateCurrentMediaState.ts](src/utils/calculateCurrentMediaState.ts) — Sequence position and preload scheduling
- [src/renderer/SectionContainer.ts](src/renderer/SectionContainer.ts) — Per-section element lifecycle management
- [src/renderer/MediaItemRenderer.ts](src/renderer/MediaItemRenderer.ts) — Individual HTML element control
- [src/utils/updateMediaItem.ts](src/utils/updateMediaItem.ts) — Item state transitions
- [src/utils/updateMediaItemsState.ts](src/utils/updateMediaItemsState.ts) — Batch state synchronization
- [src/types.ts](src/types.ts) — `MediaItem` and `MediaSequenceState` types

---

## How It Works

### 1. Time-Based Sequence Position

Every second, the app computes elapsed time since the playlist started and passes it to [`calculateMediaSequenceState()`](src/utils/calculateCurrentMediaState.ts). This function uses modulo arithmetic to loop the sequence indefinitely:

```
cycleTime = elapsedSinceStart % totalDuration
```

It then walks the item list accumulating durations until it finds which item should be playing at `cycleTime`, and how many milliseconds remain until the next transition.

### 2. Preload Window

Five seconds before a transition, the function sets `preloadIndex` to the upcoming item's index:

```typescript
const PRELOAD_TIME = 5000 // ms

const shouldPreloadNext = timeUntilNextItem <= PRELOAD_TIME
```

This returns a `MediaSequenceState` with two key fields:

```typescript
{
  currentIndex: number     // currently visible item
  preloadIndex: number | null  // item to load silently, or null
}
```

### 3. State Propagation

[`updateMediaItemsState()`](src/utils/updateMediaItemsState.ts) maps over all items and applies the new state via [`updateMediaItem()`](src/utils/updateMediaItem.ts):

```typescript
{
  hidden: index !== state.currentIndex,
  preload: index === state.preloadIndex
}
```

The function returns the same array reference if nothing changed, avoiding unnecessary DOM work.

### 4. Renderer Lifecycle in SectionContainer

[`SectionContainer`](src/renderer/SectionContainer.ts) maintains a `Map<id, MediaItemRenderer>` and on each update decides which renderers to create, update, or destroy:

- **Visible item** (`hidden=false`): renderer exists, element is on-screen
- **Preload item** (`preload=true, hidden=true`): renderer is created and mounted but invisible — the browser begins loading the media
- **Idle item** (`hidden=true, preload=false`): renderer is unmounted and removed from the DOM

This means at most two elements exist per section at any time.

### 5. Element-Level Control

[`MediaItemRenderer`](src/renderer/MediaItemRenderer.ts) controls the actual HTML element:

| State change | Action |
|---|---|
| `hidden` → visible | `video.play()`, `opacity: 1`, `zIndex: 1` |
| visible → `hidden` | `video.pause()`, `video.currentTime = 0`, `opacity: 0`, `zIndex: 0` |

Videos are created with `loop = true` so they continue playing past their natural end, preventing any stall while the scheduler catches up.

When a preloaded video becomes visible, it starts from `currentTime = 0` — the browser has already buffered it during the preload window, so playback begins instantly.

### 6. Single-Item Loop Handling

A single-item section cannot preload "the next item" because there is none. To handle this, [`SectionContainer`](src/renderer/SectionContainer.ts#L60-L66) duplicates the item with a synthetic ID:

```typescript
if (items.length === 1) {
    items = [...items, { ...items[0], id: `${items[0].id}-copy` }]
}
```

The two entries represent the same media file. When the original is near its end, the copy is preloaded, ensuring the loop is seamless even for single-file sections.

---

## Transition Sequence (Timeline)

```
T-5s   preloadIndex set → SectionContainer creates renderer for next item
       browser begins buffering next video in background

T-0    currentIndex advances → next item becomes visible (opacity 1, zIndex 1, play)
                              → previous item hidden (pause, reset, opacity 0, zIndex 0)
       SectionContainer destroys previous item's renderer (if not needed for next cycle)
```

Because the next video is already loaded and at `currentTime = 0`, there is no decode delay at `T-0`. The swap is a single style update — effectively instantaneous.

---

## Update Frequency

The app checks wall-clock time every 10ms but only re-renders once per second (when the second value changes). The `calculateMediaSequenceState` function evaluates preload eligibility on every render, so the preload window is triggered within one second of crossing the 5-second threshold.

For most content this is sufficient. If sub-second transition accuracy is needed, the render interval in [src/App.ts](src/App.ts) could be reduced.
