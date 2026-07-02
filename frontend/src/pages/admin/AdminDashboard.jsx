import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Upload, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { fetchVideos, selectVideos, selectVideoLoading } from "../../features/video/videoSlice";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const videos   = useSelector(selectVideos);
  const loading  = useSelector(selectVideoLoading);

  useEffect(() => {
    dispatch(fetchVideos({ page: 1, limit: 100 }));
  }, [dispatch]);

  const stats = {
    total:       videos.length,
    ready:       videos.filter((v) => v.status === "ready").length,
    processing:  videos.filter((v) => ["queued", "transcoding", "pending"].includes(v.status)).length,
    failed:      videos.filter((v) => v.status === "failed").length,
    youtube:     videos.filter((v) => v.source === "youtube").length,
    uploaded:    videos.filter((v) => v.source !== "youtube").length,
  };

  const STAT_CARDS = [
    { label: "Total Videos", value: stats.total, icon: Film, color: "text-prime-accent", bg: "bg-prime-accent/10" },
    { label: "Ready", value: stats.ready, icon: CheckCircle2, color: "text-prime-success", bg: "bg-prime-success/10" },
    { label: "Processing", value: stats.processing, icon: Clock, color: "text-prime-warning", bg: "bg-prime-warning/10" },
    { label: "Failed", value: stats.failed, icon: AlertCircle, color: "text-prime-danger", bg: "bg-prime-danger/10" },
  ];

  const recent = [...videos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-prime-text">Dashboard</h1>
        <p className="text-prime-muted text-sm mt-1">Platform overview aur recent activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {STAT_CARDS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-prime-surface border border-prime-border rounded-prime p-4"
          >
            <div className={`w-9 h-9 ${stat.bg} rounded-prime flex items-center justify-center mb-3`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-prime-text">
              {loading ? "—" : stat.value}
            </p>
            <p className="text-prime-muted text-xs mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Source breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-prime-surface border border-prime-border rounded-prime p-4">
          <p className="text-sm font-semibold text-prime-text mb-1">Uploaded Videos</p>
          <p className="text-3xl font-bold text-prime-accent">{stats.uploaded}</p>
          <p className="text-prime-muted text-xs mt-1">Direct upload via B2 storage</p>
        </div>
        <div className="bg-prime-surface border border-prime-border rounded-prime p-4">
          <p className="text-sm font-semibold text-prime-text mb-1">YouTube Videos</p>
          <p className="text-3xl font-bold text-red-400">{stats.youtube}</p>
          <p className="text-prime-muted text-xs mt-1">Embedded from YouTube</p>
        </div>
      </div>

      {/* Recent videos */}
      <div className="bg-prime-surface border border-prime-border rounded-prime overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-prime-border">
          <h2 className="text-sm font-semibold text-prime-text">Recently Added</h2>
          <Link to="/admin/content" className="text-xs text-prime-accent hover:text-prime-accentLight flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-prime-border text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-prime-muted uppercase tracking-wide">Title</th>
                <th className="px-4 py-2.5 text-xs font-medium text-prime-muted uppercase tracking-wide">Type</th>
                <th className="px-4 py-2.5 text-xs font-medium text-prime-muted uppercase tracking-wide">Source</th>
                <th className="px-4 py-2.5 text-xs font-medium text-prime-muted uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-prime-border/50">
                      <td className="px-4 py-3 colspan-4">
                        <div className="h-4 skeleton rounded w-48" />
                      </td>
                    </tr>
                  ))
                : recent.map((video) => (
                    <tr key={video._id} className="border-b border-prime-border/50 last:border-0 hover:bg-prime-elevated/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={video.source === "youtube" && video.videoId
                              ? `https://img.youtube.com/vi/${video.videoId}/default.jpg`
                              : video.thumbnail || ""}
                            alt=""
                            className="w-12 h-8 object-cover rounded flex-shrink-0 bg-prime-elevated"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <span className="text-prime-text font-medium truncate max-w-[160px]">{video.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-prime-muted capitalize">{video.type}</td>
                      <td className="px-4 py-3 text-prime-muted capitalize">{video.source || "upload"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-sm capitalize ${
                          video.status === "ready"       ? "bg-prime-success/15 text-prime-success" :
                          video.status === "failed"      ? "bg-prime-danger/15 text-prime-danger" :
                          video.status === "transcoding" ? "bg-prime-warning/15 text-prime-warning" :
                                                          "bg-prime-elevated text-prime-muted"
                        }`}>
                          {video.status}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
