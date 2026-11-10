import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { syncCudaDaily } from "./sync_cuda_kazdego_dnia.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint dla formularza zgłoszeń wolontariatu CC Pomoc (/dlugi)
app.all("/api/wolontariat", async (req, res) => {
  try {
    const { handleVolunteerApiRequest } = await import("./services/cc-volunteer/volunteer-service.js");
    const fullUrl = `http://${req.headers.host || "localhost"}${req.url}`;
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers.set(k, v);
      else if (Array.isArray(v)) headers.set(k, v.join(", "));
    }
    const webReq = new Request(fullUrl, {
      method: req.method,
      headers,
      body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined
    });
    const webRes = await handleVolunteerApiRequest(webReq, process.env);
    res.status(webRes.status);
    webRes.headers.forEach((val, key) => res.setHeader(key, val));
    const data = await webRes.text();
    res.send(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// App version and update check endpoint
app.get("/api/version", (req, res) => {
  try {
    const versionPath = path.join(__dirname, "version.json");
    if (fs.existsSync(versionPath)) {
      const data = JSON.parse(fs.readFileSync(versionPath, "utf8"));
      return res.json({ success: true, ...data });
    }
    res.json({ success: true, version: "3.5.0", releaseName: "LUMINA 2026", changes: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint to trigger manual sync of Cuda Każdego Dnia
app.post("/api/sync-cuda", async (req, res) => {
  try {
    const result = await syncCudaDaily();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint to get the latest cached devotion
app.get("/api/cuda-today", (req, res) => {
  try {
    const dbPath = path.join(__dirname, "rozwazania_cuda_baza.json");
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      return res.json({ success: true, devotion: data.current || data });
    }
    res.json({ success: false, message: "No devotions found in local cache" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static files from workspace root
app.use(express.static(__dirname));

// Single Page Application (SPA) catch-all route: serve index.html for unknown non-file paths
app.get(/^[^\.]*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"), (err) => {
    if (err) {
      res.status(500).send("Error loading index.html");
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);

  // Initial sync after startup
  setTimeout(() => {
    syncCudaDaily().catch(err => console.error('[Server Sync Initial Error]', err));
  }, 10000);

  // Sync every 6 hours
  const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    console.log('[Server] Uruchamianie zaplanowanej synchronizacji Cuda Każdego Dnia...');
    syncCudaDaily().catch(err => console.error('[Server Interval Sync Error]', err));
  }, SYNC_INTERVAL_MS);
});