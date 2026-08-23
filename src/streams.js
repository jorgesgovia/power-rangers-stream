import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ytdlp from "yt-dlp-exec";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inventoryPath = path.join(
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
      Number(x.season) === Number(season)
  );

  if (!s) return null;

  return s.episodes.find(
    x =>
      Number(x.episode) === Number(episode)
  );
}


async function resolveYoutube(videoId) {

  console.log(
    `🎬 Resolviendo YouTube → ${videoId}`
  );


  const result = await ytdlp(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      extractorArgs:
        "youtube:player_client=android",
      getUrl: true,
      format: "18"
    }
  );


  return result.trim();
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
      "⚠️ Episodio no encontrado"
    );

    return [];
  }


  try {

    const directUrl =
      await resolveYoutube(
        episode.videoId
      );


    console.log(
      "✅ URL DIRECTA OBTENIDA"
    );


    return [
      {
        name:
          "Power Rangers Stream",

        title:
          `${series.name} — ${episode.name}`,

        url:
          directUrl,

        behaviorHints:
        {
          bingeGroup:
            `power-rangers-${series.slug}`
        }
      }
    ];


  } catch(error) {

    console.log(
      "❌ ERROR YOUTUBE",
      error.message
    );

    return [];
  }
}



export function getInventory() {

  return loadInventory();

}
