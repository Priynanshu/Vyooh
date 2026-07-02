import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Edit2, X, Youtube, AlertCircle } from "lucide-react";
import { fetchVideos, deleteVideo, selectVideos, selectVideoLoading } from "../../features/video/videoSlice";

export default function AdminContent() {
  const dispatch = useDispatch();
  const videos   = useSelector(selectVideos);
  const loading  = useSelector(selectVideoLoading);
  const [query, setQuery]           = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    dispatch(fetchVideos({ page: 1, limit: 100 }));
  }, [dispatch]);

  const filtered = videos.filter((v) =>
    v.title?.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await dispatch(deleteVideo(deleteTarget._id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-prime-text">Manage Content</h1>
          <p className="text-prime-muted text-sm mt-1">{videos.length} total videos</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-prime-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles..."
            className="bg-prime-surface border border-prime-border rounded-prime pl-9 pr-4 py-2 text-sm text-prime-text placeholder:text-prime-subtle focus:outline-none focus:border-prime-accent w-full sm:w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-prime-surface border border-prime-border rounded-prime overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-prime-border text-left">
                {["Title", "Type", "Source", "Genres", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-prime-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-prime-border/50">
                      <td className="px-4 py-3" colSpan={6}>
                        <div className="h-4 skeleton rounded w-48" />
                      </td>
                    </tr>
                  ))
                : filtered.map((video) => (
                    <motion.tr
                      key={video._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-prime-border/50 last:border-0 hover:bg-prime-elevated/30 transition-colors"
                    >
                      {/* Title */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              video.source === "youtube" && video.videoId
                                ? `https://img.youtube.com/vi/${video.videoId}/default.jpg`
                                : video.thumbnail || ""
                            }
                            alt=""
                            className="w-14 h-9 object-cover rounded flex-shrink-0 bg-prime-elevated"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <span className="text-prime-text font-medium truncate max-w-[160px]">
                            {video.title}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 text-prime-muted capitalize">{video.type}</td>

                      {/* Source */}
                      <td className="px-4 py-3">
                        {video.source === "youtube" ? (
                          <div className="flex items-center gap-1.5 text-red-400">
                            <Youtube size={13} /> YouTube
                          </div>
                        ) : (
                          <span className="text-prime-muted">Upload</span>
                        )}
                      </td>

                      {/* Genres */}
                      <td className="px-4 py-3 text-prime-muted">
                        {video.genres?.slice(0, 2).join(", ") || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-sm capitalize ${
                          video.status === "ready"       ? "bg-prime-success/15 text-prime-success" :
                          video.status === "failed"      ? "bg-prime-danger/15 text-prime-danger" :
                          video.status === "transcoding" ? "bg-prime-warning/15 text-prime-warning" :
                                                          "bg-prime-elevated text-prime-muted"
                        }`}>
                          {video.status || "published"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded text-prime-muted hover:text-prime-accent hover:bg-prime-elevated transition-colors"
                            aria-label="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(video)}
                            className="w-7 h-7 flex items-center justify-center rounded text-prime-muted hover:text-prime-danger hover:bg-prime-danger/10 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-prime-muted text-sm">No videos found.</p>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-prime-surface border border-prime-border rounded-prime p-6 w-full max-w-sm shadow-card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-prime-danger flex-shrink-0" />
                  <h2 className="text-prime-text font-semibold">Delete Video?</h2>
                </div>
                <button onClick={() => setDeleteTarget(null)} className="text-prime-muted hover:text-prime-text">
                  <X size={18} />
                </button>
              </div>

              <p className="text-prime-muted text-sm mb-5 pl-6">
                <span className="text-prime-text font-medium">"{deleteTarget.title}"</span>{" "}
                will be permanently deleted, including from B2 storage. This action cannot be undone.
              </p>

              <div className="flex gap-3 pl-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 border border-prime-border rounded-prime text-prime-muted hover:bg-prime-elevated text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-prime-danger hover:bg-red-400 disabled:opacity-60 text-white text-sm font-semibold rounded-prime transition-colors"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
