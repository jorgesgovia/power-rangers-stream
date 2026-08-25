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

/*
 * ============================================================
 * INVENTORY
 * ============================================================
 */

function loadInventory() {

  if (!inventory) {

    inventory =
      JSON.parse(
        fs.readFileSync(
          inventoryPath,
          "utf8"
        )
      );

  }

  return inventory;
}

/*
 * ============================================================
 * FIND SERIES
 * ============================================================
 */

function findSeriesByImdb(
  imdbId
) {

  const data =
    loadInventory();

  return data.series.find(
    series =>
      String(
        series.imdbId
      ).trim() ===
      String(
        imdbId
      ).trim()
  );

}

/*
 * ============================================================
 * FIND EPISODE
 * ============================================================
 */

function findEpisode(
  series,
  seasonNumber,
  episodeNumber
) {

  const season =
    series.seasons.find(
      item =>
        Number(
          item.season
        ) ===
        Number(
          seasonNumber
        )
    );

  if (!season) {
    return null;
  }

  return season.episodes.find(
    episode =>
      Number(
        episode.episode
      ) ===
      Number(
        episodeNumber
      )
  );

}

/*
 * ============================================================
 * GET STREAM
 * ============================================================
 */

export async function getStream(
  imdbId,
  seasonNumber,
  episodeNumber
) {

  console.log("");
  console.log(
    "============================================================"
  );

  console.log(
    "📡 YOUTUBE STREAM REQUEST"
  );

  console.log(
    "============================================================"
  );

  console.log(
    "IMDb →",
    imdbId
  );

  console.log(
    "Temporada →",
    seasonNumber
  );

  console.log(
    "Episodio →",
    episodeNumber
  );

  /*
   * Find series.
   */

  const series =
    findSeriesByImdb(
      imdbId
    );

  if (!series) {

    console.log(
      "❌ SERIE NO ENCONTRADA"
    );

    return [];

  }

  console.log(
    "✅ SERIE ENCONTRADA →",
    series.name
  );

  /*
   * Find episode.
   */

  const episode =
    findEpisode(
      series,
      seasonNumber,
      episodeNumber
    );

  if (!episode) {

    console.log(
      "❌ EPISODIO NO ENCONTRADO"
    );

    return [];

  }

  console.log(
    "✅ EPISODIO ENCONTRADO →",
    episode.name
  );

  /*
   * YouTube ID.
   */

  const videoId =
    String(
      episode.videoId || ""
    ).trim();

  if (!videoId) {

    console.log(
      "❌ EPISODIO SIN YouTube ID"
    );

    return [];

  }

  console.log(
    "🎬 YouTube ID →",
    videoId
  );

  /*
   * ==========================================================
   * NUVIO STREAM
   * ==========================================================
   *
   * This is intentionally minimal.
   *
   * Nuvio's StreamDto explicitly contains:
   *
   * name
   * title
   * ytId
   *
   * so we let Nuvio resolve the YouTube playback path itself.
   *
   * ==========================================================
   */

  const stream = {

    name:
      "YouTube",

    title:
      `${series.name} — ${episode.name}`,

    ytId:
      videoId

  };

  console.log(
    "============================================================"
  );

  console.log(
    "🎉 YOUTUBE STREAM GENERADO"
  );

  console.log(
    "============================================================"
  );

  console.log(
    "📺 Nombre →",
    stream.name
  );

  console.log(
    "🎬 Título →",
    stream.title
  );

  console.log(
    "🆔 ytId →",
    stream.ytId
  );

  console.log(
    "============================================================"
  );

  return [
    stream
  ];

}

/*
 * ============================================================
 * INVENTORY EXPORT
 * ============================================================
 */

export function getInventory() {

  return loadInventory();

}
