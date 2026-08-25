import express from "express";
import {
  getStream,
  getInventory
} from "./src/streams.js";

const app = express();

const PORT = process.env.PORT || 7070;

const PUBLIC_URL =
  process.env.PUBLIC_URL ||
  `http://localhost:${PORT}`;

/*
 * ============================================================
 * NUVIO / STREMIO MANIFEST
 * ============================================================
 *
 * IMPORTANT:
 *
 * Nuvio filters addons according to:
 *
 * resource → stream
 * type     → series
 * idPrefix → tt
 *
 * Therefore an IMDb episode such as:
 *
 * tt0106064:1:1
 *
 * matches this addon.
 *
 * ============================================================
 */

const manifest = {

  id:
    "org.power.rangers.youtube",

  version:
    "2.0.0",

  name:
    "Power Rangers YouTube",

  description:
    "Power Rangers episodes streamed through YouTube.",

  resources: [
    {
      name:
        "stream",

      types: [
        "series"
      ],

      idPrefixes: [
        "tt"
      ]
    }
  ],

  types: [
    "series"
  ],

  catalogs: []

};

/*
 * ============================================================
 * ROOT
 * ============================================================
 */

app.get("/", (req, res) => {

  const inventory =
    getInventory();

  res.json({

    name:
      "Power Rangers YouTube",

    version:
      "2.0.0",

    status:
      "online",

    series:
      inventory.series.length

  });

});

/*
 * ============================================================
 * MANIFEST
 * ============================================================
 */

app.get(
  "/manifest.json",
  (req, res) => {

    res.json(manifest);

  }
);

/*
 * ============================================================
 * STREAM
 * ============================================================
 *
 * Nuvio requests:
 *
 * /stream/series/tt0106064:1:1.json
 *
 * We return:
 *
 * {
 *   "streams": [
 *     {
 *       "name": "YouTube",
 *       "title": "...",
 *       "ytId": "Wj-q428tgFo"
 *     }
 *   ]
 * }
 *
 * NO PIPED.
 * NO yt-dlp.
 * NO MP4 URL.
 * NO iframe.
 *
 * Nuvio receives the YouTube ID directly.
 *
 * ============================================================
 */

app.get(
  "/stream/:type/:id.json",
  async (req, res) => {

    try {

      const {
        type,
        id
      } = req.params;

      console.log("");
      console.log(
        "============================================================"
      );

      console.log(
        "📡 NUVIO STREAM REQUEST"
      );

      console.log(
        "============================================================"
      );

      console.log(
        "TYPE →",
        type
      );

      console.log(
        "ID RAW →",
        id
      );

      console.log(
        "PARTES →",
        id.split(":")
      );

      if (type !== "series") {

        console.log(
          "⚠️ Tipo no soportado"
        );

        return res.json({
          streams: []
        });

      }

      /*
       * IMDb
       * Season
       * Episode
       */

      const parts =
        id.split(":");

      const imdbId =
        parts[0];

      const seasonNumber =
        Number(parts[1]);

      const episodeNumber =
        Number(parts[2]);

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

      if (
        !imdbId ||
        !imdbId.startsWith("tt") ||
        !seasonNumber ||
        !episodeNumber
      ) {

        console.log(
          "❌ ID inválido"
        );

        return res.json({
          streams: []
        });

      }

      const streams =
        await getStream(
          imdbId,
          seasonNumber,
          episodeNumber
        );

      console.log(
        "📺 Streams →",
        streams.length
      );

      console.log(
        "============================================================"
      );

      return res.json({
        streams
      });

    } catch (error) {

      console.error(
        "❌ STREAM ERROR"
      );

      console.error(
        error
      );

      return res.status(500).json({
        streams: []
      });

    }

  }
);

/*
 * ============================================================
 * START
 * ============================================================
 */

app.listen(
  PORT,
  () => {

    console.log(
      "============================================================"
    );

    console.log(
      "🚀 POWER RANGERS YOUTUBE — SERVER"
    );

    console.log(
      "============================================================"
    );

    console.log(
      `📡 Puerto → ${PORT}`
    );

    console.log(
      `🌐 ${PUBLIC_URL}`
    );

    console.log(
      `📋 ${PUBLIC_URL}/manifest.json`
    );

    console.log(
      "============================================================"
    );

  }
);
