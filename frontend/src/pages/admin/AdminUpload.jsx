import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Youtube, Film, X, Check, AlertCircle, Loader2, Link as LinkIcon, Image } from "lucide-react";
import api from "../../services/api";
import { API, GENRES, RATINGS } from "../../constants";

const STAGE = {
  IDLE:"idle", REQUESTING:"requesting", UPLOADING:"uploading",
  QUEUING:"queuing", TRANSCODING:"transcoding", READY:"ready", FAILED:"failed",
};

export default function AdminUpload() {
  const [tab, setTab] = useState("upload");

  return (
    <div className="pb-12 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Upload Content</h1>
        <p className="text-prime-muted text-sm mt-1">Add a new video or YouTube link</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-prime-surface border border-prime-border rounded p-1 gap-1 mb-6 w-fit">
        {[{key:"upload",label:"Upload Video",Icon:UploadCloud},{key:"youtube",label:"YouTube Link",Icon:Youtube}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
              tab===t.key ? "bg-prime-elevated text-white" : "text-prime-muted hover:text-white"}`}>
            <t.Icon size={15}/>{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "upload"
          ? <motion.div key="upload" initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:10}}><UploadForm/></motion.div>
          : <motion.div key="yt" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}><YouTubeForm/></motion.div>
        }
      </AnimatePresence>
    </div>
  );
}

function UploadForm() {
  const [form, setForm] = useState({
    title:"", description:"", thumbnail:"", type:"movie",
    genres:[], year:new Date().getFullYear(), rating:"U/A"
  });
  const [videoFile, setVideoFile] = useState(null);
  const [progress, setProgress]   = useState(0);
  const [stage, setStage]         = useState(STAGE.IDLE);
  const [errorMsg, setErrorMsg]   = useState("");
  const [videoId, setVideoId]     = useState(null);
  const videoInputRef = useRef(null);
  const xhrRef  = useRef(null);
  const pollRef = useRef(null);
  const isUploading = ![STAGE.IDLE,STAGE.READY,STAGE.FAILED].includes(stage);

  const toggleGenre = g => setForm(f=>({...f,genres:f.genres.includes(g)?f.genres.filter(x=>x!==g):[...f.genres,g]}));

  const validate = () => {
    if (!form.title.trim())       return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.thumbnail.trim())   return "Thumbnail URL is required";
    if (!videoFile)               return "Please select a video file";
    return null;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const err = validate();
  if (err) { setErrorMsg(err); return; }
  setErrorMsg(""); setProgress(0);

  try {
    setStage(STAGE.UPLOADING);

    // FormData banao — multipart/form-data
    const formData = new FormData();
    formData.append("video",        videoFile);
    formData.append("title",        form.title);
    formData.append("description",  form.description);
    formData.append("thumbnail",    form.thumbnail);
    formData.append("type",         form.type);
    formData.append("genres",       JSON.stringify(form.genres));
    formData.append("year",         form.year);
    formData.append("rating",       form.rating);

    // Axios se upload — onUploadProgress se real progress milega
    const res = await api.post("/api/upload/direct", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      },
    });

    const { videoId: newId } = res.data;
    setVideoId(newId);

    // Poll for status
    setStage(STAGE.TRANSCODING);
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get(API.VIDEO_STATUS(newId));
        if (r.data.status === "ready") {
          clearInterval(pollRef.current);
          setStage(STAGE.READY);
        } else if (r.data.status === "failed") {
          clearInterval(pollRef.current);
          setStage(STAGE.FAILED);
          setErrorMsg("Transcoding failed. Please try again.");
        }
      } catch(_) {}
    }, 4000);

  } catch(err) {
    setStage(STAGE.FAILED);
    setErrorMsg(err.response?.data?.message || err.message || "Upload failed");
  }
};

  useEffect(()=>()=>clearInterval(pollRef.current), []);

  const stageLabel = {
    [STAGE.REQUESTING]:  "Starting upload...",
    [STAGE.UPLOADING]:   `Uploading... ${progress}%`,
    [STAGE.QUEUING]:     "Adding to queue...",
    [STAGE.TRANSCODING]: "Transcoding is running (in background)...",
  }[stage] || "";

  const stagePct = {
    [STAGE.REQUESTING]:  5,
    [STAGE.UPLOADING]:   progress,
    [STAGE.QUEUING]:     100,
    [STAGE.TRANSCODING]: 100,
  }[stage] || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type */}
      <div className="flex gap-2">
        {["movie","series"].map(t=>(
          <button key={t} type="button" onClick={()=>setForm(f=>({...f,type:t}))}
            className={`flex-1 py-2.5 rounded text-sm font-semibold border capitalize transition-all ${
              form.type===t ? "text-white border-prime-accent" : "border-prime-border text-prime-muted hover:border-prime-muted"}`}
            style={form.type===t?{background:"#00A8E1"}:{}}>
            {t==="movie"?"Movie":"Web Series"}
          </button>
        ))}
      </div>

      <Field label="Title *" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="e.g. Dune: Part Two" />
      <Field label="Description *" multiline value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Video ka short description..." />
      <Field label="Thumbnail URL *" value={form.thumbnail} onChange={v=>setForm(f=>({...f,thumbnail:v}))} placeholder="https://example.com/poster.jpg" icon={<Image size={15}/>} />

      {/* Thumbnail preview */}
      {form.thumbnail && (
        <div className="w-32 h-20 rounded overflow-hidden border border-prime-border">
          <img src={form.thumbnail} alt="thumb preview" className="w-full h-full object-cover"
            onError={e=>e.target.style.display="none"} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Year" type="number" value={form.year} onChange={v=>setForm(f=>({...f,year:v}))} />
        <div>
          <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-1.5">Rating</label>
          <select value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))}
            className="w-full bg-prime-elevated border border-prime-border rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-prime-accent">
            {RATINGS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Genres */}
      <div>
        <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-2">Genres</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g=>(
            <button key={g} type="button" onClick={()=>toggleGenre(g)}
              className={`flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium border transition-all ${
                form.genres.includes(g) ? "text-prime-accent border-prime-accent" : "border-prime-border text-prime-muted hover:border-prime-muted"}`}
              style={form.genres.includes(g)?{background:"rgba(0,168,225,0.1)"}:{}}>
              {form.genres.includes(g) && <Check size={11}/>} {g}
            </button>
          ))}
        </div>
      </div>

      {/* Video file */}
      <div>
        <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-2">Video File *</label>
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
          onChange={e=>setVideoFile(e.target.files?.[0]||null)} />
        {videoFile ? (
          <div className="flex items-center gap-3 bg-prime-elevated border border-prime-border rounded px-3 py-2.5">
            <Film size={16} className="text-prime-accent flex-shrink-0"/>
            <span className="text-white text-sm truncate flex-1">{videoFile.name}</span>
            <span className="text-prime-muted text-xs">{(videoFile.size/1024/1024).toFixed(1)} MB</span>
            <button type="button" onClick={()=>setVideoFile(null)} className="text-prime-muted hover:text-red-400 transition-colors"><X size={14}/></button>
          </div>
        ) : (
          <button type="button" onClick={()=>videoInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-prime-border rounded py-8 text-prime-muted hover:border-prime-accent hover:text-prime-accent transition-all">
            <UploadCloud size={28}/>
            <span className="text-sm font-medium">Click to select video</span>
            <span className="text-xs text-prime-subtle">MP4 recommended</span>
          </button>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded px-3 py-2.5">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0"/>
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Progress */}
      {isUploading && (
        <div>
          <div className="flex items-center justify-between text-xs text-prime-muted mb-1.5">
            <span className="flex items-center gap-1.5"><Loader2 size={11} className="animate-spin"/>{stageLabel}</span>
            {stage===STAGE.UPLOADING && <span>{progress}%</span>}
          </div>
          <div className="h-1.5 bg-prime-elevated rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{background:"#00A8E1"}}
              initial={{width:0}} animate={{width:`${stagePct}%`}} transition={{duration:0.3}}/>
          </div>
          {stage===STAGE.TRANSCODING && (
            <p className="text-xs text-prime-muted mt-2">
              File uploaded successfully — processing in background. You can check the status in the dashboard.
            </p>
          )}
        </div>
      )}

      {stage===STAGE.READY && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded px-3 py-2.5">
          <Check size={15} className="text-green-400"/>
          <p className="text-green-400 text-sm">Video successfully published!</p>
        </div>
      )}

      <button type="submit" disabled={isUploading||stage===STAGE.READY}
        className="w-full py-3 rounded font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{background:stage===STAGE.READY?"#2ECC71":"#00A8E1"}}>
        {isUploading ? "Processing..." : stage===STAGE.READY ? "Published ✓" : "Publish Content"}
      </button>
    </form>
  );
}

function YouTubeForm() {
  const [url, setUrl]     = useState("");
  const [preview, setPrev]= useState(null);
  const [form, setForm]   = useState({title:"",description:"",type:"movie",genres:[],year:new Date().getFullYear(),rating:"U/A"});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const extractId = u => {
    try {
      if (u.includes("youtube.com/watch")) return new URL(u).searchParams.get("v");
      if (u.includes("youtu.be/"))         return u.split("youtu.be/")[1]?.split("?")[0];
      if (u.includes("/shorts/"))           return u.split("/shorts/")[1]?.split("?")[0];
    } catch {} return null;
  };

  const handlePreview = () => {
    const id = extractId(url);
    if (!id) { setError("Please enter a valid YouTube URL"); return; }
    setError("");
    setPrev({ videoId:id, thumbnail:`https://img.youtube.com/vi/${id}/maxresdefault.jpg` });
  };

  const toggleGenre = g => setForm(f=>({...f,genres:f.genres.includes(g)?f.genres.filter(x=>x!==g):[...f.genres,g]}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!preview || !form.title.trim() || !form.description.trim()) {
      setError("Title and description are required"); return;
    }
    setLoading(true); setError("");
    try {
      await api.post(API.UPLOAD_YOUTUBE, { url, ...form, year:Number(form.year) });
      setSuccess(true);
    } catch(err) {
      setError(err.response?.data?.message || "Could not add YouTube video");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-1.5">YouTube URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-prime-muted"/>
            <input value={url} onChange={e=>setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-prime-elevated border border-prime-border rounded pl-9 pr-3 py-2.5 text-white placeholder:text-prime-subtle text-sm focus:outline-none focus:border-prime-accent"/>
          </div>
          <button type="button" onClick={handlePreview}
            className="px-4 py-2.5 bg-prime-elevated border border-prime-border text-white text-sm rounded hover:border-prime-accent transition-colors flex-shrink-0">
            Preview
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      </div>

      {preview && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="border border-prime-border rounded overflow-hidden">
          <div className="relative aspect-video">
            <img src={preview.thumbnail} alt="thumb" className="w-full h-full object-cover"
              onError={e=>{e.target.src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600";}}/>
            <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.3)"}}>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Youtube size={24} className="text-white"/>
              </div>
            </div>
          </div>
          <div className="p-3 bg-prime-elevated">
            <p className="text-prime-muted text-xs">Video ID: <span className="text-prime-accent font-mono">{preview.videoId}</span></p>
          </div>
        </motion.div>
      )}

      {preview && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title *" required value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Video ka title" />
          <Field label="Description *" required multiline value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Short description..." />

          <div className="flex gap-2">
            {["movie","series"].map(t=>(
              <button key={t} type="button" onClick={()=>setForm(f=>({...f,type:t}))}
                className={`flex-1 py-2 rounded text-sm font-medium border capitalize transition-all ${
                  form.type===t?"text-white border-prime-accent":"border-prime-border text-prime-muted"}`}
                style={form.type===t?{background:"#00A8E1"}:{}}>{t}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year" type="number" value={form.year} onChange={v=>setForm(f=>({...f,year:v}))}/>
            <div>
              <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-1.5">Rating</label>
              <select value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))}
                className="w-full bg-prime-elevated border border-prime-border rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-prime-accent">
                {RATINGS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {GENRES.map(g=>(
              <button key={g} type="button" onClick={()=>toggleGenre(g)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs border transition-all ${
                  form.genres.includes(g)?"text-prime-accent border-prime-accent":"border-prime-border text-prime-muted"}`}
                style={form.genres.includes(g)?{background:"rgba(0,168,225,0.1)"}:{}}>
                {form.genres.includes(g)&&<Check size={10}/>} {g}
              </button>
            ))}
          </div>

          {success ? (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded px-3 py-2.5">
              <Check size={15} className="text-green-400"/>
              <p className="text-green-400 text-sm">YouTube video successfully added!</p>
            </div>
          ) : (
            <button type="submit" disabled={loading||!form.title}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded text-sm transition-colors">
              {loading ? <><Loader2 size={15} className="animate-spin"/>Adding...</> : <><Youtube size={16}/>Add YouTube Video</>}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

function Field({label,value,onChange,placeholder,required,type="text",multiline,icon}) {
  const cls = "w-full bg-prime-elevated border border-prime-border rounded px-3 py-2.5 text-white placeholder:text-prime-subtle text-sm focus:outline-none focus:border-prime-accent transition-colors";
  return (
    <div>
      <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-1.5">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-none`}/>
        : <div className="relative">
            {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-prime-muted">{icon}</span>}
            <input type={type} required={required} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
              className={`${cls}${icon?" pl-9":""}`}/>
          </div>
      }
    </div>
  );
}
