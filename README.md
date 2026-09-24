# QRForge API

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Author](https://img.shields.io/badge/Author-adilabdullah15-orange)

A lightweight REST API that generates **customizable QR codes** as PNG or SVG images — with adjustable size, dark/light colors, and strict input validation.

## Features

- 🚀 Generate QR codes via a single `GET` request
- 🖼️ Output as **PNG** (`image/png`) or **SVG** (`image/svg+xml`)
- 🎨 Custom dark/light colors with hex validation
- 📐 Size control (128–2048 px, auto-clamped)
- ✅ Input validation with clear `400` JSON errors
- 🔌 CORS enabled — call it straight from any webpage
- 🩺 `/health` endpoint for uptime checks

## Quick Start

```bash
npm install
npm start
```

The API runs at `http://localhost:3000` by default. Set the `PORT` environment variable to change it:

```bash
PORT=8080 npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Reference

### `GET /health`

Returns service status.

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

### `GET /api/qr`

Generates a QR code image for the given text.

| Parameter | Type   | Required | Default   | Description                                     |
|-----------|--------|----------|-----------|-------------------------------------------------|
| `text`    | string | ✅ Yes   | —         | Content to encode (URL, text, Wi-Fi, etc.)      |
| `size`    | int    | No       | `512`     | Image size in px, clamped to **128–2048**       |
| `dark`    | string | No       | `#000000` | Dark module color, must be `#rrggbb` hex        |
| `light`   | string | No       | `#ffffff` | Background color, must be `#rrggbb` hex        |
| `format`  | string | No       | `png`     | Output format: `png` or `svg`                   |

Responses:
- Success → the image with `Content-Type: image/png` or `image/svg+xml`
- Invalid input → `400` with JSON `{ "error": "..." }`
- Unknown route → `404` with JSON `{ "error": "..." }`

#### Examples

**1. Download a PNG to a file**

```bash
curl "http://localhost:3000/api/qr?text=https%3A%2F%2Fgithub.com%2Fadilabdullah15&size=512" \
  --output qr.png
```

**2. Get an SVG**

```bash
curl "http://localhost:3000/api/qr?text=Hello%20QR&format=svg" \
  --output qr.svg
```

**3. Custom colors (URL-encode the `#` as `%23`)**

```bash
curl "http://localhost:3000/api/qr?text=Scan%20me&size=1024&dark=%23ff5733&light=%23f0f8ff" \
  --output qr-branded.png
```

**4. Error case — missing `text`**

```bash
curl "http://localhost:3000/api/qr"
# HTTP/1.1 400 Bad Request
# {"error":"Query parameter \"text\" is required and must not be empty."}
```

### Using the API in a webpage

Because CORS is enabled, you can embed QR codes directly with an `<img>` tag — no backend code needed:

```html
<img
  src="http://localhost:3000/api/qr?text=https%3A%2F%2Fgithub.com%2Fadilabdullah15&size=256&dark=%230a1a2f&light=%23ffffff"
  alt="QR code for my GitHub profile"
  width="256"
  height="256"
/>
```

## Project Structure

```
qrforge-api/
├── server.js        # Express app: routes, validation, error handling
├── package.json     # Dependencies and npm scripts
├── .gitignore       # node_modules, .env, logs
├── LICENSE          # MIT license
└── README.md        # This file
```

## Tech Stack

- **Node.js 18+** — runtime
- **Express 4** — HTTP server and routing
- **qrcode** — QR code generation (PNG buffers + SVG strings)
- **cors** — cross-origin support for browser clients

## Author

**Adil Abdullah Khan** — BS Information Technology, Thal University Bhakkar, Pakistan

- ✉️ Email: adilabdullahkhan35@gmail.com
- 🐙 GitHub: https://github.com/adilabdullah15

## License

MIT © 2026 Adil Abdullah Khan — see [LICENSE](LICENSE) for details.
