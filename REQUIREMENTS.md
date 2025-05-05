# Web-Based Digital Signage Player Requirements

## Technology Stack

- TypeScript
- React
- Vite

## 1. Content Playback

### 1.1 General Capabilities
- Supports a wide range of media formats (images, videos, audio, and HTML content).
- Enables positioning and scaling of content.
- Supports layout rotation (e.g., landscape, portrait).

### 1.2 Image Playback
- Displays static images.
- **Supported formats**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`.
- Configurable display duration for each image.
- Preloads images to prevent flickering and ensure smooth transitions.

### 1.3 Video Playback
- Plays video files.
- **Supported format**: `.mp4`.
- Supports autoplay and continuous looping based on schedule.
- Buffers videos to prevent playback interruptions.
- Smooth transitions between videos without flickering.
- Configurable volume control.

### 1.4 Audio Playback
- Plays background audio files.
- **Supported format**: `.mp3`.
- Configurable volume control.

### 1.5 HTML5 Content
- Renders HTML5-based content.
- Configurable display duration.
- Supports interactive elements such as buttons, forms, and touch events.
- Supports fallback to video or image content if HTML content fails to load.

## 2. Content Scheduling

### 2.1 Playlist Management
- Retrieves playlists from a remote CMS in JSON format or from an archive when operating as a standalone player without CMS.
- Parses and validates playlists before playback.
- Supports nested playlists for dynamic content rotation.
- Updates playlists in real-time and transitions seamlessly to new content.

### 2.2 Time-Based Scheduling
- Enables scheduling by time of day (e.g., 8 AM to 12 PM).
- Supports date-based rules (e.g., holidays).
- Supports day-of-week rules (e.g., weekdays, weekends).
- Dynamically adjusts playback based on current time.

### 2.3 Priority Content
- Displays high-priority playlists over scheduled content.
- Resumes normal content after high-priority playback.
- Allows manual override for urgent announcements.

### 2.4 Content Expiration
- Automatically removes expired content from the playlist.
- Validates content expiration dates before playback.

### 2.5 Event-Based Scheduling
- Supports event-based triggers (e.g., external API calls, WebSocket messages).
- Allows real-time updates to the playlist based on external events.
- Enables dynamic content changes based on user interactions or system events.

## 3. Remote Management

### 3.1 Content Syncing
- Fetches and updates content at regular intervals (e.g., every 10 minutes) or via WebSockets.
- Validates content integrity using checksums.
- Caches media assets locally for offline playback.
- Switch schedule only after fully caching the new playlist.

### 3.2 Device Management
- Remote cache clearing and forced reload capability.
- Screenshot capture and upload for remote monitoring.
- Reports on device status (e.g., memory usage, uptime).
- Logs and reports playback history.

## 4. Offline Playback

### 4.1 Caching
- Stores media files (images, videos, HTML) locally.
- Preloads all assets.
- Prevents cache overflow by limiting storage used by cached content.

### 4.2 Offline Mode
- Enters offline mode when network access is lost.
- Continues playing cached content without interruption.
- Automatically syncs with server and updates content upon reconnection.

## 5. Playback Synchronization
- Synchronizes playback across multiple devices in a network.
- Playback is synchronized by time and content.
- Supports both local and remote synchronization methods.

## 6. JavaScript API

### 6.1 API Overview
- Provides a JavaScript API for developers to interact with the player.
- API methods are accessible globally (e.g., `window.screenlite`).
- Enables API access from embedded HTML5 content.

### 6.2 API Events
- `onEnded`: Triggered when a media item completes playback.
- `onError`: Triggered when a playback error occurs.