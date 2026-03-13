import express from "express";
import { getProfile, getGameDetail } from "./scraper.js";

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

  return app;
}