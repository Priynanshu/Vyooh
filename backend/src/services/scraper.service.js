import axios from "axios"

export async function scrapeYouTube(url) {
  try {
    // Extract YouTube Video ID
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      return {
        url,
        thumbnail: "",
        videoId: "",
        type: "video",
        source: "youtube",
        scrapedAt: new Date(),
      };
    }

    // Use YouTube oEmbed API — free, no key needed
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const { data } = await axios.get(oEmbedUrl, { timeout: 8000 });

    // YouTube thumbnail URLs
    const thumbnail =
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return {
      url,
      videoId,
      thumbnail: thumbnail,
      source: "youtube",
      type: "video",
      scrapedAt: new Date(),
    };

  } catch (error) {
    console.error("YouTube scrape error:", error.message);

    // If oEmbed fails — fallback
    const videoId = extractYouTubeId(url);
    return {
      url,
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "",
      source: "youtube",
      type: "video",
      scrapedAt: new Date(),
    };
  }
};

// ── Extract YouTube Video ID ──────────────────────────
const extractYouTubeId = (url) => {
  try {
    // youtube.com/watch?v=VIDEO_ID
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v");
    }

    // youtu.be/VIDEO_ID
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      return parts[1]?.split("?")[0];
    }

    // youtube.com/shorts/VIDEO_ID
    if (url.includes("/shorts/")) {
      const parts = url.split("/shorts/");
      return parts[1]?.split("?")[0];
    }

    return null;
  } catch {
    return null;
  }
};