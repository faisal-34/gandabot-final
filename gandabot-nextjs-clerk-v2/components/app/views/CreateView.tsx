"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Clip {
  id: number;
  user_id: string;
  username: string;
  caption: string;
  category: string;
  video_url: string;
  audio_url: string | null;
  thumbnail: string | null;
  likes: number;
  views: number;
  duration: number;
  created_at: string;
}

type Tab = "feed" | "upload" | "record";

const CATEGORIES = ["culture", "language", "music", "food", "travel", "humor"];

// ─── Smooth Video Player ─────────────────────────────────────────────────────
// Fixes: smooth rendering, proper audio, no mute issues

function GandaPlayer({
  clip,
  active,
  onLike,
  liked,
  currentUserId,
}: {
  clip: Clip;
  active: boolean;
  onLike: (id: number) => void;
  liked: boolean;
  currentUserId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayAudioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCaption, setShowCaption] = useState(true);

  // Play/pause based on whether this card is the active one in the feed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      // Use play() promise to handle autoplay policy gracefully
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked — set muted and retry (browser requirement)
          video.muted = true;
          setMuted(true);
          video.play().catch(() => {});
        });
      }
      // Sync overlay audio
      if (overlayAudioRef.current) {
        overlayAudioRef.current.currentTime = video.currentTime;
        overlayAudioRef.current.play().catch(() => {});
      }
    } else {
      video.pause();
      if (overlayAudioRef.current) overlayAudioRef.current.pause();
    }
  }, [active]);

  // Sync overlay audio mute state with video
  useEffect(() => {
    if (overlayAudioRef.current) {
      overlayAudioRef.current.muted = muted;
    }
  }, [muted]);

  // Set up overlay audio element when audio_url changes
  useEffect(() => {
    // Tear down any existing audio first
    if (overlayAudioRef.current) {
      overlayAudioRef.current.pause();
      overlayAudioRef.current.currentTime = 0;
      overlayAudioRef.current = null;
    }
    if (!clip.audio_url) return;
    const audio = new Audio(clip.audio_url);
    audio.loop = true;
    audio.muted = muted;
    overlayAudioRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      overlayAudioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip.audio_url]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
    // Keep overlay audio in sync (drift correction)
    if (overlayAudioRef.current && Math.abs(overlayAudioRef.current.currentTime - video.currentTime) > 0.3) {
      overlayAudioRef.current.currentTime = video.currentTime;
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
  }

  function scrub(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
    if (overlayAudioRef.current) overlayAudioRef.current.currentTime = video.currentTime;
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none" style={{ willChange: "transform" }}>
      {/* Video — NOT muted by default, playsInline for mobile */}
      <video
        ref={videoRef}
        src={clip.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        preload="metadata"
        muted={muted}
        onTimeUpdate={handleTimeUpdate}
        // GPU-accelerated smooth rendering
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      />

      {/* Overlay for taps */}
      <div className="absolute inset-0 z-10" onClick={() => setShowCaption((v) => !v)} />

      {/* Category tag */}
      <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
        style={{ background: "rgba(33,144,121,0.75)", color: "#fff" }}>
        #{clip.category}
      </div>

      {/* Mute button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm text-lg"
        style={{ background: "rgba(0,0,0,0.4)" }}
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* Bottom info + actions */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end gap-4 p-4"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}>

        {/* Left — caption + username */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm mb-0.5" style={{ color: "var(--teal-light)" }}>
            @{clip.username}
          </p>
          {showCaption && clip.caption && (
            <p className="text-sm leading-relaxed text-white line-clamp-2">{clip.caption}</p>
          )}
          {clip.audio_url && (
            <p className="text-xs mt-1 opacity-60 text-white flex items-center gap-1">
              <span style={{ color: "var(--orange)" }}>♪</span> Audio overlay active
            </p>
          )}
        </div>

        {/* Right — action buttons */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); onLike(clip.id); }}
            className="flex flex-col items-center gap-1 transition-transform active:scale-90"
          >
            <span className="text-2xl" style={{ filter: liked ? "drop-shadow(0 0 6px #f47b20)" : "none" }}>
              {liked ? "❤️" : "🤍"}
            </span>
            <span className="text-xs text-white font-medium">{clip.likes}</span>
          </button>

          {/* Views */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">👁</span>
            <span className="text-xs text-white font-medium">{clip.views}</span>
          </div>
        </div>
      </div>

      {/* Scrub bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 h-0.5 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.2)" }}
        onClick={scrub}
      >
        <div
          className="h-full transition-none"
          style={{ width: `${progress}%`, background: "var(--teal)" }}
        />
      </div>
    </div>
  );
}

// ─── Feed ────────────────────────────────────────────────────────────────────

function FeedTab({
  currentUserId,
  savedUsername,
}: {
  currentUserId?: string;
  savedUsername: string;
}) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [category, setCategory] = useState("all");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  async function loadClips() {
    setLoading(true);
    try {
      const q = category !== "all" ? `?category=${category}` : "";
      const res = await fetch(`/api/create/videos${q}`);
      const data = await res.json();
      setClips(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { loadClips(); }, [category]);

  // IntersectionObserver: detect which video is in view → play it, pause others
  // Reset itemRefs when clips array changes so stale DOM refs don't linger
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, clips.length);
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = itemRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { threshold: 0.6 }
    );
    itemRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [clips]);

  async function handleLike(clipId: number) {
    try {
      const res = await fetch(`/api/create/videos/${clipId}/like`, { method: "POST" });
      const data = await res.json();
      setLikedIds((prev) => {
        const next = new Set(prev);
        data.liked ? next.add(clipId) : next.delete(clipId);
        return next;
      });
      setClips((prev) =>
        prev.map((c) => (c.id === clipId ? { ...c, likes: data.likes } : c))
      );
    } catch { /* silent */ }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category filter */}
      <div className="shrink-0 flex gap-2 px-3 py-2 overflow-x-auto border-b border-white/10"
        style={{ background: "rgba(12,31,23,0.95)" }}>
        {["all", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={{
              borderColor: category === c ? "var(--teal)" : "rgba(255,255,255,0.2)",
              background: category === c ? "rgba(33,144,121,0.2)" : "transparent",
              color: category === c ? "var(--teal-light)" : "var(--cream)",
            }}
          >
            #{c}
          </button>
        ))}
      </div>

      {/* Video feed — vertical snap scroll */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center opacity-40" style={{ color: "var(--cream)" }}>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent mx-auto mb-3 animate-spin"
              style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }} />
            <p className="text-sm">Loading GandaFeed…</p>
          </div>
        </div>
      ) : clips.length === 0 ? (
        <div className="flex-1 flex items-center justify-center opacity-40" style={{ color: "var(--cream)" }}>
          <div className="text-center px-6">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-sm font-medium mb-1">No clips yet</p>
            <p className="text-xs">Be the first to upload a GandaClip!</p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto snap-y snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          {clips.map((clip, idx) => (
            <div
              key={clip.id}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="snap-start snap-always"
              style={{ height: "calc(100vh - 120px)", minHeight: "400px" }}
            >
              <GandaPlayer
                clip={clip}
                active={activeIdx === idx}
                onLike={handleLike}
                liked={likedIds.has(clip.id)}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

function UploadTab({ username }: { username: string }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("culture");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  function handleVideoSelect(file: File) {
    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }
    setVideoFile(file);
    setError("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleVideoSelect(file);
  }

  async function submit() {
    if (!videoFile) return;
    setUploading(true);
    setError("");
    try {
      // Step 1: Upload files — multipart/form-data preserves audio track
      const form = new FormData();
      form.append("video", videoFile);
      if (audioFile) form.append("audio", audioFile);

      const uploadRes = await fetch("/api/create/upload", { method: "POST", body: form });
      if (!uploadRes.ok) {
        const e = await uploadRes.json();
        throw new Error(e.error || "Upload failed");
      }
      const { videoUrl, audioUrl } = await uploadRes.json();

      // Step 2: Get video duration from preview element
      const duration = previewVideoRef.current?.duration ?? 0;

      // Step 3: Save clip metadata
      const saveRes = await fetch("/api/create/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, audioUrl, caption, category, duration, username }),
      });
      if (!saveRes.ok) throw new Error("Failed to save clip");

      setDone(true);
      setVideoFile(null);
      setAudioFile(null);
      setPreviewUrl(null);
      setCaption("");
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-black mb-2" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
            GandaClip uploaded!
          </h3>
          <p className="text-sm opacity-60 mb-6" style={{ color: "var(--cream)" }}>Your clip is now live on GandaFeed.</p>
          <button
            onClick={() => setDone(false)}
            className="gb-btn gb-btn-primary px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-xl mx-auto w-full">
      <h2 className="text-lg font-black mb-6" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
        Upload a GandaClip
      </h2>

      {/* Video drop zone */}
      {!previewUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => videoInputRef.current?.click()}
          className="mb-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors py-14"
          style={{
            borderColor: dragOver ? "var(--teal)" : "rgba(255,255,255,0.2)",
            background: dragOver ? "rgba(33,144,121,0.08)" : "rgba(255,255,255,0.03)",
          }}
        >
          <div className="text-4xl mb-3">📹</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--cream)" }}>Drop your video here</p>
          <p className="text-xs opacity-50" style={{ color: "var(--cream)" }}>MP4, WebM, MOV — up to 50MB</p>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoSelect(f); }}
          />
        </div>
      ) : (
        <div className="mb-5 rounded-2xl overflow-hidden relative" style={{ background: "#000" }}>
          {/* Preview video — NOT muted so user can verify audio */}
          <video
            ref={previewVideoRef}
            src={previewUrl}
            controls
            playsInline
            className="w-full max-h-72 object-contain"
            // Explicitly NOT muted — user must hear their video audio
          />
          <button
            onClick={() => { setVideoFile(null); setPreviewUrl(null); setAudioFile(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Audio overlay (optional) */}
      <div className="mb-5 p-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--cream)" }}>🎵 Add Audio Overlay</p>
            <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--cream)" }}>Optional — plays over your video</p>
          </div>
          {audioFile && (
            <button onClick={() => setAudioFile(null)} className="text-xs opacity-50 hover:opacity-100" style={{ color: "var(--orange)" }}>Remove</button>
          )}
        </div>
        {audioFile ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(33,144,121,0.12)" }}>
            <span style={{ color: "var(--teal-light)" }}>♪</span>
            <span className="text-xs truncate flex-1" style={{ color: "var(--cream)" }}>{audioFile.name}</span>
          </div>
        ) : (
          <button
            onClick={() => audioInputRef.current?.click()}
            className="w-full py-2 rounded-lg border border-dashed border-white/20 text-xs hover:border-teal-500 transition-colors"
            style={{ color: "var(--cream)" }}
          >
            Choose audio file (MP3, WAV, AAC…)
          </button>
        )}
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setAudioFile(f); }}
        />
      </div>

      {/* Caption */}
      <textarea
        rows={3}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption… (try a Luganda phrase 🇺🇬)"
        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none resize-none mb-4"
        style={{ color: "var(--cream)" }}
      />

      {/* Category */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-3 py-1.5 rounded-full text-xs border transition-colors"
            style={{
              borderColor: category === c ? "var(--teal)" : "rgba(255,255,255,0.2)",
              background: category === c ? "rgba(33,144,121,0.2)" : "transparent",
              color: category === c ? "var(--teal-light)" : "var(--cream)",
            }}
          >
            #{c}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs mb-4" style={{ color: "var(--orange)" }}>{error}</p>
      )}

      <button
        onClick={submit}
        disabled={!videoFile || uploading}
        className="gb-btn gb-btn-primary w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40"
        style={{ background: "var(--teal)", color: "var(--forest)" }}
      >
        {uploading ? "Uploading…" : "Post GandaClip"}
      </button>
    </div>
  );
}

// ─── Record Tab ───────────────────────────────────────────────────────────────

function RecordTab({ username }: { username: string }) {
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("culture");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startCamera() {
    try {
      // Request BOTH video AND audio — this is the fix for silent recordings
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        // Mute preview only — we don't want echo, but audio IS being captured
        liveRef.current.muted = true;
        liveRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setError("Camera/mic access denied. Please allow permissions and try again.");
    }
  }

  useEffect(() => {
    startCamera();

    // If stream tracks end unexpectedly (permission revoked, device disconnect),
    // restart the camera automatically
    const watchdog = setInterval(() => {
      if (streamRef.current) {
        const allEnded = streamRef.current.getTracks().every((t) => t.readyState === "ended");
        if (allEnded) startCamera();
      }
    }, 4000);

    return () => {
      clearInterval(watchdog);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startRecording() {
    if (!streamRef.current) return;
    setBlobUrl(null);
    chunksRef.current = [];
    setCountdown(3);

    // 3-2-1 countdown
    let c = 3;
    const cTimer = setInterval(() => {
      c--;
      setCountdown(c > 0 ? c : null);
      if (c <= 0) {
        clearInterval(cTimer);
        beginRecord();
      }
    }, 1000);
  }

  function beginRecord() {
    if (!streamRef.current) return;

    // Pick best supported codec — includes audio
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;
    setDuration(0);
    setRecording(true);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setBlobUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    recorder.start(100); // 100ms chunks for smooth recording

    // Duration timer
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function saveClip() {
    if (!blobUrl) return;
    setSaving(true);
    setError("");
    try {
      // Convert blob URL to File
      const res = await fetch(blobUrl);
      const blob = await res.blob();
      const file = new File([blob], "gandaclip.webm", { type: blob.type });

      const form = new FormData();
      form.append("video", file);

      const uploadRes = await fetch("/api/create/upload", { method: "POST", body: form });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { videoUrl } = await uploadRes.json();

      const saveRes = await fetch("/api/create/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, caption, category, duration, username }),
      });
      if (!saveRes.ok) throw new Error("Save failed");

      setDone(true);
      setBlobUrl(null);
    } catch (err: any) {
      setError(err.message || "Failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-black mb-2" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Clip posted!</h3>
          <button onClick={() => { setDone(false); setBlobUrl(null); setCaption(""); }} className="gb-btn gb-btn-primary px-6 py-3 rounded-xl text-sm font-semibold mt-4" style={{ background: "var(--teal)", color: "var(--forest)" }}>
            Record Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 overflow-y-auto">
      <h2 className="text-lg font-black mb-4 self-start" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
        Record a GandaClip
      </h2>

      {/* Camera viewfinder */}
      <div className="relative w-full max-w-xs rounded-2xl overflow-hidden bg-black mb-5" style={{ aspectRatio: "9/16" }}>
        {blobUrl ? (
          <video src={blobUrl} controls playsInline className="w-full h-full object-cover" />
        ) : (
          <>
            <video ref={liveRef} playsInline autoPlay muted className="w-full h-full object-cover" />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <span className="text-8xl font-black text-white" style={{ fontFamily: "Fraunces, serif", textShadow: "0 0 30px rgba(33,144,121,0.8)" }}>
                  {countdown}
                </span>
              </div>
            )}
            {recording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full z-20" style={{ background: "rgba(0,0,0,0.6)" }}>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-medium">{duration}s</span>
              </div>
            )}
          </>
        )}
      </div>

      {error && <p className="text-xs mb-3" style={{ color: "var(--orange)" }}>{error}</p>}

      {/* Record / Stop controls */}
      {!blobUrl && (
        <div className="flex items-center gap-6 mb-6">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={countdown !== null}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
            style={{
              background: recording ? "#E74C3C" : "var(--teal)",
              boxShadow: recording ? "0 0 0 4px rgba(231,76,60,0.3)" : "0 0 0 4px rgba(33,144,121,0.3)",
            }}
          >
            <span className="text-2xl">{recording ? "⏹" : "⏺"}</span>
          </button>
        </div>
      )}

      {/* Post form (after recording) */}
      {blobUrl && (
        <div className="w-full max-w-xs">
          <textarea
            rows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption your clip…"
            className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-sm outline-none resize-none mb-3"
            style={{ color: "var(--cream)" }}
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-2.5 py-1 rounded-full text-xs border transition-colors"
                style={{
                  borderColor: category === c ? "var(--teal)" : "rgba(255,255,255,0.2)",
                  background: category === c ? "rgba(33,144,121,0.2)" : "transparent",
                  color: category === c ? "var(--teal-light)" : "var(--cream)",
                }}>
                #{c}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setBlobUrl(null); }} className="flex-1 py-3 rounded-xl border border-white/20 text-sm" style={{ color: "var(--cream)" }}>
              Retake
            </button>
            <button onClick={saveClip} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: "var(--teal)", color: "var(--forest)" }}>
              {saving ? "Posting…" : "Post Clip"}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs opacity-30 mt-4 text-center" style={{ color: "var(--cream)" }}>
        Microphone is captured automatically with your video
      </p>
    </div>
  );
}

// ─── Username Edit Modal ──────────────────────────────────────────────────────

function UsernameModal({
  current,
  onSave,
  onClose,
}: {
  current: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!value.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onSave(data.username);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#0C1F17", border: "1px solid rgba(255,255,255,0.12)" }}>
        <h3 className="font-black text-lg mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Edit username</h3>
        <p className="text-xs opacity-50 mb-5" style={{ color: "var(--cream)" }}>Letters, numbers, underscores only — max 32 chars</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm opacity-50" style={{ color: "var(--teal-light)" }}>@</span>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            maxLength={32}
            className="flex-1 px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm outline-none"
            style={{ color: "var(--cream)" }}
          />
        </div>
        {error && <p className="text-xs mb-3" style={{ color: "var(--orange)" }}>{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/20 text-sm" style={{ color: "var(--cream)" }}>Cancel</button>
          <button onClick={save} disabled={saving || !value.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--teal)", color: "var(--forest)" }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CreateView ──────────────────────────────────────────────────────────

export function CreateView() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("feed");
  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Derive initial username from Clerk user
  useEffect(() => {
    if (user) {
      setUsername(user.username || user.firstName || "GandaUser");
    }
  }, [user]);

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "feed", icon: "🏠", label: "GandaFeed" },
    { id: "upload", icon: "⬆️", label: "Upload" },
    { id: "record", icon: "🔴", label: "Record" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--forest)" }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10"
        style={{ background: "rgba(12,31,23,0.98)" }}>
        <div>
          <h1 className="font-black text-base leading-none" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
            GandaFeed
          </h1>
          <p className="text-[11px] opacity-40 mt-0.5" style={{ color: "var(--cream)" }}>Short cultural clips</p>
        </div>

        {/* Username + edit */}
        <button
          onClick={() => setShowUsernameModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 hover:border-teal-500 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <span className="text-xs" style={{ color: "var(--teal-light)" }}>@{username}</span>
          <span className="text-xs opacity-50" style={{ color: "var(--cream)" }}>✎</span>
        </button>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-b border-white/10" style={{ background: "rgba(12,31,23,0.95)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
            style={{
              color: tab === t.id ? "var(--teal-light)" : "var(--cream)",
              opacity: tab === t.id ? 1 : 0.5,
              borderBottom: tab === t.id ? "2px solid var(--teal)" : "2px solid transparent",
            }}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === "feed" && <FeedTab currentUserId={user?.id} savedUsername={username} />}
        {tab === "upload" && <UploadTab username={username} />}
        {tab === "record" && <RecordTab username={username} />}
      </div>

      {/* Username edit modal */}
      {showUsernameModal && (
        <UsernameModal
          current={username}
          onSave={(name) => setUsername(name)}
          onClose={() => setShowUsernameModal(false)}
        />
      )}
    </div>
  );
}
