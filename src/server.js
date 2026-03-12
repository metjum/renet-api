import express from "express";
import { getProfile, getGameDetail, searchUsers } from "./scraper.js";

export function createServer() {
  const app = express();

  app.get("/profile/:userId", async (req, res) => {
    try {
      res.json({ ok: true, data: await getProfile(req.params.userId) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/game/:userId/:slug/:platform", async (req, res) => {
    try {
      const { userId, slug, platform } = req.params;
      res.json({ ok: true, data: await getGameDetail(userId, slug, platform) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/search", async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ ok: false, error: "Missing ?q= param" });
    try {
      res.json({ ok: true, results: await searchUsers(q) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/lookup", async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ ok: false, error: "Missing ?username= param" });
    try {
      const results = await searchUsers(username);
      if (!results.length) return res.status(404).json({ ok: false, error: "User not found" });
      res.json({ ok: true, data: await getProfile(results[0].userId) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return app;
}