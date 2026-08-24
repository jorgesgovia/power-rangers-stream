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
      Number(x.season) === Number(season)
  );

  if (!s) return null;

  return s.episodes.find(
    x =>
      Number(x.episode) === Number(episode)
  );
}

/*
 * ============================================================
 * PIPED INSTANCES
 * ============================================================
 *
 * Piped exposes:
 *
 * GET /streams/:videoId
 *
 * and returns videoStreams[].url
 *
 * We try several public API instances in sequence.
 */

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.tokhmi.xyz",
  "https://pipedapi.moomoo.me",
  "https://pipedapi.syncpundit.io",
  "https://api-piped.mha.fi",
  "https://piped-api.garudalinux.org"
];

/*
 * ============================================================
 * RESOLVE YOUTUBE THROUGH PIPED
 * ============================================================
 */

async function resolveYoutube(videoId) {

  console.log("");
  console.log("🎬 Resolviendo YouTube →", videoId);
  console.log("🔄 Método → Piped API");

  for (const instance of PIPED_INSTANCES) {

    const apiUrl =
      `${instance}/streams/${encodeURIComponent(videoId)}`;

    console.log("");
    console.log("🌐 Piped →", instance);

    try {

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () => controller.abort(),
          15000
        );

      const response =
        await fetch(
          apiUrl,
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "User-Agent":
                "Power-Rangers-Stream/1.0"
            },
            signal: controller.signal
          }
        );

      clearTimeout(timeout);

      console.log(
        "📡 HTTP →",
        response.status
      );

      if (!response.ok) {

        console.log(
          "⚠️ Piped respondió HTTP",
          response.status
        );

        continue;
      }

      const data =
        await response.json();

      if (
        !data ||
        !Array.isArray(data.videoStreams)
      ) {

        console.log(
          "⚠️ Sin videoStreams"
        );

        continue;
      }

      /*
       * Preferimos MP4 con audio incluido.
       */

      const streams =
        data.videoStreams
          .filter(
            stream =>
              stream &&
              typeof stream.url === "string" &&
              stream.url.startsWith("http")
          )
          .sort(
            (a, b) => {

              const aAudio =
                a.videoOnly === false ? 1 : 0;

              const bAudio =
                b.videoOnly === false ? 1 : 0;

              if (aAudio !== bAudio) {
                return bAudio - aAudio;
              }

              const aHeight =
                Number(a.height || 0);

              const bHeight =
                Number(b.height || 0);

              return bHeight - aHeight;
            }
          );

      if (!streams.length) {

        console.log(
          "⚠️ Piped no devolvió streams utilizables"
        );

        continue;
      }

      /*
       * Primero intentamos un MP4 con audio.
       */

      const streamWithAudio =
        streams.find(
          stream =>
            stream.videoOnly === false &&
            (
              stream.mimeType === "video/mp4" ||
              stream.format === "MPEG_4"
            )
        );

      const selected =
        streamWithAudio ||
        streams.find(
          stream =>
            stream.videoOnly === false
        ) ||
        streams[0];

      console.log("");
      console.log(
        "✅ STREAM ENCONTRADO"
      );

      console.log(
        "📺 Calidad →",
        selected.quality ||
        selected.height ||
        "desconocida"
      );

      console.log(
        "🎞️ Formato →",
        selected.format ||
        selected.mimeType ||
        "desconocido"
      );

      console.log(
        "🔊 VideoOnly →",
        selected.videoOnly
      );

      console.log(
        "🔗 URL →",
        selected.url
      );

      return selected.url;

    } catch (error) {

      console.log(
        "❌ ERROR PIPED"
      );

      console.log(
        "MESSAGE →",
        error.message
      );

      continue;
    }
  }

  console.log("");
  console.log(
    "❌ TODAS LAS INSTANCIAS PIPED FALLARON"
  );

  return null;
}

/*
 * ============================================================
 * STREAM
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
    "📡 STREAM REQUEST"
  );

  console.log(
    "============================================================"
  );

  console.log(
    "TYPE → series"
  );

  console.log(
    "ID   →",
    `${imdbId}:${seasonNumber}:${episodeNumber}`
  );

  const series =
    findSeriesByImdb(imdbId);

  if (!series) {

    console.log(
      "⚠️ IMDb no encontrado →",
      imdbId
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

  console.log(
    "🎬 Episodio →",
    episode.name
  );

  console.log(
    "🆔 YouTube →",
    episode.videoId
  );

  try {

    const directUrl =
      await resolveYoutube(
        episode.videoId
      );

    if (!directUrl) {

      console.log(
        "❌ No se obtuvo URL"
      );

      console.log(
        "📺 Streams → 0"
      );

      return [];
    }

    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      "🎉 STREAM RESUELTO"
    );

    console.log(
      "=========================================="
    );

    console.log(
      "📺 Streams → 1"
    );

    console.log(
      "=========================================="
    );

    return [
      {
        name:
          "Power Rangers Stream",

        title:
          `${series.name} — ${episode.name}`,

        url:
          directUrl,

        behaviorHints: {
          bingeGroup:
            `power-rangers-${series.slug || series.imdbId}`
        }
      }
    ];

  } catch (error) {

    console.log(
      "❌ ERROR GENERAL"
    );

    console.log(
      "MESSAGE →",
      error.message
    );

    console.log(
      "📺 Streams → 0"
    );

    return [];
  }
}

export function getInventory() {
  return loadInventory();
}
