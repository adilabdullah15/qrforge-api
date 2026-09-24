// qrforge-api — server.js
// Minimal Express API that generates customizable QR codes (PNG or SVG).
//   GET /health        -> { "status": "ok" }
//   GET /api/qr        -> QR image for the given query params (see README).

const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();

// Port is configurable for hosting providers (Render, Railway, etc.).
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());          // allow browser-based clients from any origin
app.use(express.json());  // parse JSON request bodies (currently unused but kept for future POST routes)

// ---------------------------------------------------------------------------
// Constants / validation helpers
// ---------------------------------------------------------------------------
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const MIN_SIZE = 128;
const MAX_SIZE = 2048;
const DEFAULT_SIZE = 512;
const DEFAULT_DARK = "#000000";
const DEFAULT_LIGHT = "#ffffff";
const ALLOWED_FORMATS = ["png", "svg"];

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check used by uptime monitors / load balancers.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/qr?text=<string>&size=512&dark=%23000000&light=%23ffffff&format=png|svg
// Returns the QR code as an image with the correct Content-Type.
app.get("/api/qr", async (req, res, next) => {
  try {
    // --- text: required, must not be empty after trimming ---
    const text = typeof req.query.text === "string" ? req.query.text.trim() : "";
    if (!text) {
      return badRequest(res, 'Query parameter "text" is required and must not be empty.');
    }

    // --- size: integer, clamped to 128–2048, defaults to 512 ---
    let size = parseInt(req.query.size, 10);
    if (Number.isNaN(size)) size = DEFAULT_SIZE;
    size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));

    // --- dark / light: must be valid #rrggbb hex colors ---
    const dark = req.query.dark || DEFAULT_DARK;
    if (!HEX_COLOR_REGEX.test(dark)) {
      return badRequest(res, 'Query parameter "dark" must be a valid hex color like "#000000".');
    }
    const light = req.query.light || DEFAULT_LIGHT;
    if (!HEX_COLOR_REGEX.test(light)) {
      return badRequest(res, 'Query parameter "light" must be a valid hex color like "#ffffff".');
    }

    // --- format: only "png" or "svg" allowed ---
    const format = (req.query.format || "png").toLowerCase();
    if (!ALLOWED_FORMATS.includes(format)) {
      return badRequest(res, 'Query parameter "format" must be either "png" or "svg".');
    }

    // Shared rendering options for the qrcode library.
    const options = {
      width: size,
      color: { dark, light },
      margin: 2,               // quiet zone around the code (modules)
      errorCorrectionLevel: "M",
    };

    if (format === "svg") {
      // toString with type "svg" yields the raw <svg> markup.
      const svg = await QRCode.toString(text, { ...options, type: "svg" });
      res.type("image/svg+xml").send(svg);
    } else {
      // toBuffer yields a PNG image buffer.
      const png = await QRCode.toBuffer(text, options);
      res.type("image/png").send(png);
    }
  } catch (err) {
    // Unexpected rendering failures (e.g. data too long) → global error handler.
    next(err);
  }
});

// 404 for anything not matched above.
app.use((req, res) => {
  res.status(404).json({ error: "Not found. See GET /health and GET /api/qr." });
});

// ---------------------------------------------------------------------------
// Global error handler — always responds with JSON, never leaks stack traces.
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error while generating the QR code." });
});

app.listen(PORT, () => {
  console.log(`qrforge-api listening on http://localhost:${PORT}`);
});
