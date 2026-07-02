import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { API } from "../../constants";

// GET /api/video/videos → { message, data: [...], totalVideos }
export const fetchVideos = createAsyncThunk("video/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get(API.VIDEOS, { params });
    return res.data;
  } catch (err) {
    // 400 "Not Videos Found" — treat as empty, not error
    if (err.response?.status === 400) return { data: [], totalVideos: 0 };
    return rejectWithValue(err.response?.data?.message || "Videos load nahi hue");
  }
});

// GET /api/video/:id → { message, data: video }
export const fetchVideoById = createAsyncThunk("video/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(API.VIDEO_DETAIL(id));
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Video nahi mili");
  }
});

// DELETE /api/video/delete/:id
export const deleteVideo = createAsyncThunk("video/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(API.VIDEO_DELETE(id));
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Delete fail hua");
  }
});

const videoSlice = createSlice({
  name: "video",
  initialState: {
    videos:       [],
    currentVideo: null,
    total:        0,
    loading:      false,
    error:        null,
  },
  reducers: {
    clearCurrentVideo: (s) => { s.currentVideo = null; },
    clearError:        (s) => { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchVideos.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchVideos.fulfilled, (s, a) => {
        s.loading = false;
        s.videos  = a.payload.data || [];
        s.total   = a.payload.totalVideos || 0;
      })
      .addCase(fetchVideoById.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchVideoById.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchVideoById.fulfilled, (s, a) => { s.loading = false; s.currentVideo = a.payload; })
      .addCase(deleteVideo.fulfilled, (s, a) => {
        s.videos = s.videos.filter((v) => v._id !== a.payload);
      });
  },
});

export const { clearCurrentVideo, clearError } = videoSlice.actions;
export const selectVideos       = (s) => s.video.videos;
export const selectCurrentVideo = (s) => s.video.currentVideo;
export const selectVideoLoading = (s) => s.video.loading;
export const selectVideoError   = (s) => s.video.error;
export default videoSlice.reducer;
