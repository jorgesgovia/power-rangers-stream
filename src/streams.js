import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const inventoryPath =
  path.join(
    __dirname,
    "..",
    "data",
    "inventory.json"
  );

let inventory = null;

function loadInventory() {
  if (!inventory) {
    inventory = JSON.parse(
      fs.readFileSync(
        inventoryPath,
        "utf8"
      )
    );
  }

  return inventory;
}

function findSeriesByImdb(imdbId) {
  const data =
    loadInventory();

  return data.series.find(
    series =>
      String(series.imdbId).trim() ===
      String(imdbId).trim()
  );
}

function findEpisode(
  series,
  seasonNumber,
  episodeNumber
) {
  if (!series) {
    return null;
  }

  const season =
    series.seasons?.find(
      item =>
        Number(item.season) ===
        Number(seasonNumber)
    );

  if (!season) {
    return null;
  }

  return season.episodes?.find(
    episode =>
      Number(episode.episode) ===
      Number(episodeNumber)
  );
}

export function getStream(
  imdbId,
  seasonNumber,
  episodeNumber
) {
  const series =
    findSeriesByImdb(imdbId);

  if (!series) {
    console.log(
      `⚠️ IMDb no encontrado → ${imdbId}`
    );

    return [];
  }

  console.log(
    `🎯 IMDb → ${imdbId} = ${series.name} (${series.slug})`
  );

  const episode =
    findEpisode(
      series,
      seasonNumber,
      episodeNumber
    );

  if (!episode) {
    console.log(
      `⚠️ Episodio no encontrado → S${seasonNumber} E${episodeNumber}`
    );

    return [];
  }

  if (!episode.videoId) {
    console.log(
      `⚠️ E${episodeNumber} no tiene YouTube videoId`
    );

    return [];
  }

  const stream = {
    name: "Power Rangers Stream",

    title:
      `${series.name} — ${episode.name}`,

    type: "http",

    url:
      `https://www.youtube.com/watch?v=${encodeURIComponent(
        episode.videoId
      )}`,

    behaviorHints: {
      bingeGroup:
        `power-rangers-${series.slug}`
    }
  };

  console.log(
    `✅ STREAM → ${series.slug} S${String(seasonNumber).padStart(2, "0")} E${String(episodeNumber).padStart(2, "0")}`
  );

  console.log(
    `   IMDb → ${imdbId}`
  );

  console.log(
    `   YouTube → ${episode.videoId}`
  );

  return [stream];
}

export function getInventory() {
  return loadInventory();
}
