import * as cheerio from "cheerio";

export const PLATFORM_MAP = {
  ps5: "playstation5",
  ps4: "playstation4",
  ps3: "playstation3",
  steam: "windows",
  xseries: "xbox-series",
  xone: "xbox-one",
  x360: "xbox360",
  nsw: "nsw",
  nsw2: "nsw2",
  epic: "epic",
  wiiu: "wiiu",
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

async function get(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export async function getProfile(userId) {
  const url = `https://game.capcom.com/residentevil/en/p${userId}.html`;
  const html = await get(url);
  const $ = cheerio.load(html);

  const username = $(".other__profile dl dt").text().trim();
  const bio = $(".other__profile dl dd").text().trim();
  const avatar = $(".other__profile .icon_area img").attr("src") || null;
  const ambassadorImg = $(".other__card.regis img").attr("src") || null;
  const mainEl = $("main#portal-mypage");
  const capcomId = mainEl.attr("data-cid") || null;
  const ambassadorId = mainEl.attr("data-ambaid") || null;

  const games = [];
  $(".titleArea .title").each((_, el) => {
    const gameEl = $(el);
    const classes = (gameEl.attr("class") || "").split(" ");
    const slug = classes.find(c => c !== "title") || "";
    const platform = (gameEl.find("p.img").attr("class") || "").replace("img", "").trim();
    const name = gameEl.find("p.name").text().trim();
    const link = gameEl.find("a").attr("href") || "";
    const stats = {};
    gameEl.find("dl").each((_, dl) => {
      const label = $(dl).find("dt").text().trim();
      const value = $(dl).find("dd").text().trim();
      if (label) stats[label] = value;
    });
    if (name) games.push({ slug, name, platform, link, stats });
  });

  return { userId, profileUrl: url, username, bio, avatar, ambassadorImg, capcomId, ambassadorId, games };
}

export async function getGameDetail(userId, slug, platform) {
  const ptfSegment = PLATFORM_MAP[platform] || platform;
  const url = `https://game.capcom.com/residentevil/${slug}/en/${ptfSegment}/o${userId}.html`;
  const html = await get(url);
  const $ = cheerio.load(html);

  const username = $("#contents__profile .name a").first().text().trim();
  const avatar = $("#contents__profile img").first().attr("src") || null;
  const storyPercent = $(".progress__number").first().text().trim();
  const playTime = $(".progress__time").first().text().trim().replace(/\s+/g, " ");

  const difficulties = [];
  $(".progress__check li").each((_, el) => {
    const label = $(el).find("img").attr("alt") || "";
    const completed = $(el).find(".check").length > 0;
    if (label) difficulties.push({ difficulty: label, completed });
  });

  const modeProgress = [];
  $(".progress__mode li").each((_, el) => {
    const mode = $(el).find(".mode").text().trim();
    const progress = $(el).find(".progress").text().trim();
    if (mode) modeProgress.push({ mode, progress });
  });

  const bestTimes = [];
  $(".result__progress .time li").each((_, el) => {
    bestTimes.push($(el).text().trim().replace(/\s+/g, ""));
  });

  const challenges = [];
  $(".items .item").each((_, el) => {
    const itemEl = $(el);
    const name = itemEl.find(".name .text").text().trim();
    const completed = itemEl.find(".name").hasClass("check");
    const mission = itemEl.find(".mission").text().trim();
    const percent = itemEl.find(".percent span").text().trim();
    const rewardName = itemEl.find(".reward .name").text().trim();
    const rewardImg = itemEl.find(".reward img").attr("src") || null;
    const rewardType = itemEl.find(".reward .type").text().trim();
    if (name) {
      challenges.push({
        name,
        completed,
        mission,
        globalCompletionPercent: percent ? parseFloat(percent) : null,
        reward: rewardName ? { name: rewardName, img: rewardImg, type: rewardType } : null,
      });
    }
  });

  return {
    userId, slug, platform, url, username, avatar,
    story: {
      overallPercent: storyPercent,
      totalPlayTime: playTime,
      difficulties,
      modeProgress,
      bestTimes,
    },
    challenges: {
      completed: parseInt($(".bar_chart dt .num").first().text()) || null,
      total: parseInt($(".bar_chart dt .total").first().text()) || null,
      list: challenges,
    },
  };
}

export async function searchUsers(query) {
  const url = `https://game.capcom.com/residentevil/en/search.html?search=${encodeURIComponent(query)}`;
  const html = await get(url);
  const $ = cheerio.load(html);

  const results = [];
  const seen = new Set();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(/p(\d+)\.html/);
    if (!match) return;
    const userId = match[1];
    const username = $(el).text().trim();
    if (username && userId && !seen.has(userId)) {
      seen.add(userId);
      results.push({ username, userId });
    }
  });

  return results;
}