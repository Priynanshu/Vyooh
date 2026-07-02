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

  // Watch History — exact routes (/api/watchistory — backend mein typo hai)
  HISTORY_SAVE:    "/api/watchistory/save",
  HISTORY_GET:     "/api/watchistory/history",
  HISTORY_CONTINUE:"/api/watchistory/continue",
  HISTORY_REMOVE:  (id) => `/api/watchistory/${id}`,
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

export const DUMMY_RECOMMENDATIONS = [
  { _id:"rec1", title:"Dune: Part Two", thumbnail:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600", type:"movie", genres:["Sci-Fi","Action"], year:2024, reason:"Tumne Sci-Fi content zyada dekha hai" },
  { _id:"rec2", title:"The Bear", thumbnail:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600", type:"series", genres:["Drama"], year:2023, reason:"High-rated drama jo tumhare taste se match karta hai" },
  { _id:"rec3", title:"Oppenheimer", thumbnail:"https://images.unsplash.com/photo-1537747257588-27e20ccfe5bf?w=600", type:"movie", genres:["Drama","Thriller"], year:2023, reason:"Critically acclaimed — similar audience ne pasand kiya" },
  { _id:"rec4", title:"Dark", thumbnail:"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600", type:"series", genres:["Sci-Fi","Thriller"], year:2022, reason:"Crime aur Thriller genre se milta julta" },
  { _id:"rec5", title:"Shogun", thumbnail:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600", type:"series", genres:["Drama","Action"], year:2024, reason:"Trending — is week sabse zyada dekha gaya" },
  { _id:"rec6", title:"Killers of the Flower Moon", thumbnail:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", type:"movie", genres:["Crime","Drama"], year:2023, reason:"Crime drama jo tumhari history se match karta hai" },
];
