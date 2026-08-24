import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

function findEpisode(
  series,
  season,
  episode
) {

  const s = series.seasons.find(
    x =>
      Number(x.season) ===
      Number(season)
  );

  if (!s) {
    return null;
  }

  return s.episodes.find(
    x =>
      Number(x.episode) ===
      Number(episode)
  );
}


/*
 * ============================================================
 * YOUTUBE STREAM
 * ============================================================
 *
 * Nuvio reconoce la serie mediante IMDb:
 *
 * tt0106064:1:1
 *
 * y el episodio contiene:
 *
 * videoId → Wj-q428tgFo
 *
 * No resolvemos YouTube mediante Piped.
 *
 * Entregamos directamente el identificador de YouTube
 * al cliente mediante ytId.
 *
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
   * ----------------------------------------------------------
   * BUSCAR SERIE
   * ----------------------------------------------------------
   */

  const series =
    findSeriesByImdb(imdbId);

  if (!series) {

    console.log(
      "❌ SERIE NO ENCONTRADA"
    );

    console.log(
      "IMDb recibido →",
      imdbId
    );

    return [];

  }


  console.log(
    "✅ SERIE ENCONTRADA →",
    series.name
  );


  /*
   * ----------------------------------------------------------
   * BUSCAR EPISODIO
   * ----------------------------------------------------------
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
   * ----------------------------------------------------------
   * YOUTUBE ID
   * ----------------------------------------------------------
   */

  const videoId =
    String(
      episode.videoId || ""
    ).trim();


  if (!videoId) {

    console.log(
      "❌ EL EPISODIO NO TIENE YOUTUBE ID"
    );

    return [];

  }


  console.log(
    "🎬 YouTube ID →",
    videoId
  );


  /*
   * ----------------------------------------------------------
   * RESPUESTA PARA NUVIO
   * ----------------------------------------------------------
   *
   * IMPORTANTE:
   *
   * NO usamos:
   *
   * url:
   * https://youtube.com/watch?v=...
   *
   * porque eso sería una página web.
   *
   * Entregamos el identificador mediante ytId.
   *
   * ----------------------------------------------------------
   */

  const stream = {

    name:
      "YouTube",

    title:
      `${series.name} — ${episode.name}`,

    ytId:
      videoId,

    behaviorHints: {

      bingeGroup:
        `power-rangers-${
          series.slug ||
          series.imdbId
        }`

    }

  };


  console.log("");

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


export function getInventory() {

  return loadInventory();

}
