import express from "express";

import {
  getStream,
  getInventory
} from "./src/streams.js";

const app = express();

const PORT =
  process.env.PORT || 7070;

const PUBLIC_URL =
  process.env.PUBLIC_URL ||
  `http://localhost:${PORT}`;

const manifest = {
  id: "org.power.rangers.stream",
  version: "1.0.0",
  name: "Power Rangers Stream",
  description:
    "Power Rangers stream addon powered by YouTube.",
  resources: [
    {
      name: "stream",
      types: ["series"],
      idPrefixes: ["tt"]
    }
  ],
  types: [
    "series"
  ],
  catalogs: []
};

app.get(
  "/",
  (req, res) => {
    const inventory =
      getInventory();

    res.json({
      name: "Power Rangers Stream",
      version: "1.0.0",
      status: "online",
      series:
        inventory.series.length
    });
  }
);

app.get(
  "/manifest.json",
  (req, res) => {
    res.json(manifest);
  }
);

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
        "📡 STREAM REQUEST"
      );

      console.log(
        "============================================================"
      );

      console.log(
        `TYPE → ${type}`
      );

      console.log(
        `ID   → ${id}`
      );

      if (type !== "series") {
        return res.json({
          streams: []
        });
      }

      /*
       * Formato esperado:
       *
       * tt0092379:1:1
       *
       * IMDb
       * temporada
       * episodio
       */

      const parts =
        id.split(":");

      const imdbId =
        parts[0];

      let seasonNumber;
      let episodeNumber;

      if (parts.length >= 3) {
        seasonNumber =
          Number(parts[1]);

        episodeNumber =
          Number(parts[2]);

      } else if (parts.length === 2) {
        seasonNumber = 1;

        episodeNumber =
          Number(parts[1]);

      } else {
        return res.json({
          streams: []
        });
      }

      if (
        !seasonNumber ||
        !episodeNumber ||
        Number.isNaN(
          seasonNumber
        ) ||
        Number.isNaN(
          episodeNumber
        )
      ) {
        console.log(
          "⚠️ ID inválido"
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
        `📺 Streams → ${streams.length}`
      );

      console.log(
        "============================================================"
      );

      return res.json({
        streams
      });

    } catch (error) {

      console.error(
        "❌ STREAM ERROR:",
        error
      );

      return res.status(500).json({
        streams: []
      });
    }
  }
);

app.listen(
  PORT,
  () => {

    console.log(
      "============================================================"
    );

    console.log(
      "🚀 POWER RANGERS STREAM — SERVER"
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

    console.log("");
  }
);
