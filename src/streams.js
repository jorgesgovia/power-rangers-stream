import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inventoryPath = path.join(
  __dirname,
  "..",
  "data",
  "inventory.json"
);

const ytDlpPath = path.join(
  __dirname,
  "..",
  "yt-dlp"
);

let inventory = null;

function loadInventory() {
  if (!inventory) {
    inventory = JSON.parse(
      fs.readFileSync(inventoryPath, "utf8")
    );
  }

  return inventory;
}

function findSeriesByImdb(imdbId) {
  const data = loadInventory();

  return data.series.find(
    series =>
      String(series.imdbId).trim() ===
      String(imdbId).trim()
  );
}

function findEpisode(series, season, episode) {
  const s = series.seasons.find(
    x =>
      Number(x.season) ===
      Number(season)
  );

  if (!s) return null;

  return s.episodes.find(
    x =>
      Number(x.episode) ===
      Number(episode)
  );
}

async function resolveYoutube(videoId) {

  console.log(
    `🎬 Resolviendo YouTube → ${videoId}`
  );

  const youtubeUrl =
    `https://www.youtube.com/watch?v=${videoId}`;

  console.log(
    `🔗 URL → ${youtubeUrl}`
  );

  console.log(
    `⚙️ yt-dlp → ${ytDlpPath}`
  );

  try {

    const result = await execa(
      ytDlpPath,
      [
        "--no-update",
        "--no-warnings",
        "--extractor-args",
        "youtube:player_client=web,android",
        "--get-url",
        "-f",
        "best[ext=mp4]/best",
        youtubeUrl
      ],
      {
        reject: true
      }
    );

    console.log(
      "✅ yt-dlp terminó correctamente"
    );

    console.log(
      "📡 URL OBTENIDA →",
      result.stdout.trim()
    );

    return result.stdout.trim();

  } catch (error) {

    console.log(
      "❌ ERROR YOUTUBE"
    );

    console.log(
      "MESSAGE →",
      error.message
    );

    console.log(
      "EXIT CODE →",
      error.exitCode ?? "(desconocido)"
    );

    console.log(
      "STDOUT →",
      error.stdout || "(vacío)"
    );

    console.log(
      "STDERR →",
      error.stderr || "(vacío)"
    );

    return null;
  }
}

export async function getStream(
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

  const episode =
    findEpisode(
      series,
      seasonNumber,
      episodeNumber
    );

  if (!episode) {

    console.log(
      `⚠️ Episodio no encontrado → S${seasonNumber}E${episodeNumber}`
    );

    return [];
  }

  console.log(
    `🎬 Episodio → ${episode.name}`
  );

  console.log(
    `🆔 YouTube → ${episode.videoId}`
  );

  const directUrl =
    await resolveYoutube(
      episode.videoId
    );

  if (!directUrl) {

    console.log(
      "📺 Streams → 0"
    );

    return [];
  }

  console.log(
    "✅ URL DIRECTA OBTENIDA"
  );

  const stream = {
    name: "Power Rangers Stream",

    title:
      `${series.name} — ${episode.name}`,

    url: directUrl,

    behaviorHints: {
      bingeGroup:
        `power-rangers-${series.slug}`
    }
  };

  console.log(
    "📺 Streams → 1"
  );

  return [stream];
}

export function getInventory() {
  return loadInventory();
}
