/*
 * YouTube helper.
 *
 * Nuvio receives ytId directly.
 *
 * We deliberately do NOT convert the ID
 * into a youtube.com webpage URL.
 */

export function youtubeId(
  videoId
) {

  if (!videoId) {
    throw new Error(
      "Falta YouTube videoId"
    );
  }

  return String(
    videoId
  ).trim();

}
