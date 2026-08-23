import fs from "node:fs";
import https from "node:https";

const PLAYLIST_ID = "PLbt09tWqepBShiQ_Kyte8wlqZ5gOexnvj";

const SERIES = {
  imdbId: "tt0092379",
  slug: "mighty-morphin-power-rangers",
  name: "Mighty Morphin Power Rangers",
  season: 1
};

const PLAYLIST_URL =
  `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36",
          "Accept-Language":
            "en-US,en;q=0.9"
        }
      },
      response => {
        let data = "";

        response.on("data", chunk => {
          data += chunk;
        });

        response.on("end", () => {
          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            fetch(response.headers.location)
              .then(resolve)
              .catch(reject);

            return;
          }

          resolve(data);
        });

        response.on("error", reject);
      }
    ).on("error", reject);
  });
}

function extractInitialData(html) {
  const markers = [
    "var ytInitialData = ",
    "ytInitialData = "
  ];

  for (const marker of markers) {
    const start = html.indexOf(marker);

    if (start === -1) {
      continue;
    }

    const jsonStart = start + marker.length;

    const end = html.indexOf(
      ";</script>",
      jsonStart
    );

    if (end !== -1) {
      const raw = html.slice(
        jsonStart,
        end
      );

      try {
        return JSON.parse(raw);
      } catch {
        // Intentamos encontrar el JSON
        // mediante el siguiente método.
      }
    }
  }

  return null;
}

function extractVideoIds(html, initialData) {
  const source =
    initialData
      ? JSON.stringify(initialData)
      : html;

  const matches = source.matchAll(
    /"videoId"\s*:\s*"([A-Za-z0-9_-]{11})"/g
  );

  const ids = [];
  const seen = new Set();

  for (const match of matches) {
    const videoId = match[1];

    if (seen.has(videoId)) {
      continue;
    }

    seen.add(videoId);
    ids.push(videoId);
  }

  return ids;
}

function makeEpisodes(videoIds) {
  return videoIds.map(
    (videoId, index) => {
      const episodeNumber =
        index + 1;

      return {
        episode: episodeNumber,

        name:
          `Mighty Morphin Power Rangers E${String(
            episodeNumber
          ).padStart(2, "0")}`,

        videoId
      };
    }
  );
}

console.log(
  "============================================================"
);

console.log(
  "🎬 POWER RANGERS — BUILD INVENTORY"
);

console.log(
  "============================================================"
);

console.log(
  `PLAYLIST → ${PLAYLIST_ID}`
);

console.log(
  `URL → ${PLAYLIST_URL}`
);

console.log("");

const html =
  await fetch(PLAYLIST_URL);

console.log(
  `HTML → ${html.length} bytes`
);

if (!html.length) {
  throw new Error(
    "YouTube devolvió HTML vacío."
  );
}

const initialData =
  extractInitialData(html);

if (initialData) {
  console.log(
    "✅ ytInitialData encontrado"
  );
} else {
  console.log(
    "⚠️ ytInitialData no pudo parsearse."
  );

  console.log(
    "➡️ Usando HTML completo como respaldo."
  );
}

console.log("");

const videoIds =
  extractVideoIds(
    html,
    initialData
  );

console.log(
  `🎥 VIDEO IDs ENCONTRADOS → ${videoIds.length}`
);

console.log("");

if (!videoIds.length) {
  throw new Error(
    "YouTube no devolvió ningún videoId."
  );
}

const episodes =
  makeEpisodes(videoIds);

console.log(
  `📺 EPISODIOS GENERADOS → ${episodes.length}`
);

console.log("");

for (const episode of episodes) {
  console.log(
    `E${String(episode.episode).padStart(2, "0")} → ${episode.videoId}`
  );
}

console.log("");

const inventory = {
  series: [
    {
      imdbId: SERIES.imdbId,
      slug: SERIES.slug,
      name: SERIES.name,

      seasons: [
        {
          season: SERIES.season,
          episodes
        }
      ]
    }
  ]
};

fs.writeFileSync(
  "data/inventory.json",
  JSON.stringify(
    inventory,
    null,
    2
  ) + "\n"
);

console.log(
  "============================================================"
);

console.log(
  `✅ INVENTARIO GENERADO → ${episodes.length} episodios`
);

console.log(
  `🎯 IMDb → ${SERIES.imdbId}`
);

console.log(
  `📺 Serie → ${SERIES.name}`
);

console.log(
  `📁 Archivo → data/inventory.json`
);

console.log(
  "============================================================"
);

console.log(
  "🏁 FIN"
);

console.log(
  "============================================================"
);
