import { GoogleGenerativeAI } from "@google/generative-ai";

function formatWatchHistory(history) {
  return history
    .filter(item => item.video) // null video wali entries hata do
    .map(item => {
      const v = item.video;
      return `- ${v.title} (${v.type}, ${v.genres?.join(", ")}) — ${item.progress}% watched${item.completed ? ", completed" : ""}`;
    })
    .join("\n");
}

function formatCatalog(videos) {
  return videos.map(v =>
    `ID: ${v._id} | ${v.title} (${v.type}, ${v.genres?.join(", ")}, ${v.year})`
  ).join("\n");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getAIRecommendations(watchHistory, availableVideos) {
    console.log(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a video recommendation engine for a streaming platform.

User's watch history:
${formatWatchHistory(watchHistory)}

Available videos on platform (do not recommend videos not in this list):
${formatCatalog(availableVideos)}

Task: Recommend up to 6 DIFFERENT videos this user would enjoy most. 
IMPORTANT: Each videoId must appear only ONCE in your response — no duplicates.
If fewer than 6 unique videos are available, recommend fewer — do not repeat any video.

Respond ONLY with valid JSON, no markdown, no extra text, in this exact format:
[{"videoId": "...", "reason": "short reason in english, under 15 words"}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

  let recommendations = JSON.parse(cleaned);

  // Duplicate videoIds hata do
  const seen = new Set();
  recommendations = recommendations.filter(rec => {
    if (seen.has(rec.videoId)) return false;
    seen.add(rec.videoId);
    return true;
  });

  return recommendations;
}