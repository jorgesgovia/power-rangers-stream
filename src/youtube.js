/**
 * POWER RANGERS STREAM
 * YouTube helpers
 */

export function youtubeUrl(videoId) {
  if (!videoId) {
    throw new Error("Falta YouTube videoId");
  }

  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}
