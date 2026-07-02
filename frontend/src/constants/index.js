export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
export const APP_NAME = "Vyooh";

// Exact backend routes
export const API = {
  // Auth
  LOGIN:    "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT:   "/api/auth/logout",
  REFRESH:  "/api/auth/refresh",
  ME:       "/api/auth/getMe",

  // Videos — exact routes from video.routes.js
  VIDEOS:        "/api/video/videos",
  VIDEO_DETAIL:  (id) => `/api/video/${id}`,
  VIDEO_STATUS:  (id) => `/api/video/${id}/status`,
  VIDEO_STREAM:  (id) => `/api/video/${id}/stream`,
  VIDEO_EDIT:    (id) => `/api/video/edit/${id}`,
  VIDEO_DELETE:  (id) => `/api/video/delete/${id}`,

  // Upload — exact routes from upload.routes.js
  PRESIGNED_URL:   "/api/upload/presigned-url",
  UPLOAD_COMPLETE: "/api/upload/complete",
  UPLOAD_YOUTUBE:  "/api/upload/upload-ytvideo",

  // Watch History — exact routes (/api/watchistory — backend has a typo)
  HISTORY_SAVE:    "/api/watchistory/save",
  HISTORY_GET:     "/api/watchistory/history",
  HISTORY_CONTINUE:"/api/watchistory/continue",
  HISTORY_REMOVE:  (id) => `/api/watchistory/${id}`,
  HISTORY_CLEAR:   "/api/watchistory",
};

export const GENRES = [
  "Action","Drama","Comedy","Thriller","Romance",
  "Sci-Fi","Crime","Documentary","Horror","Animation",
];

export const CONTENT_TYPES = [
  { value: "all",    label: "All" },
  { value: "movie",  label: "Movies" },
  { value: "series", label: "Series" },
];

export const RATINGS = ["U", "U/A", "13+", "16+", "A"];
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

