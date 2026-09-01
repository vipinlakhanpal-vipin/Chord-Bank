"use client";

import { useEffect, useRef, useState } from "react";

interface MicOption {
  deviceId: string;
  label: string;
}

export default function RecordPage() {
  const [mics, setMics] = useState<MicOption[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGain, setAutoGain] = useState(true);
  const [recording, setRecording] = useState(false);
  const [permissionState, setPermissionState] = useState<"idle" | "granted" | "denied">("idle");
  const [recordings, setRecordings] = useState<{ url: string; name: string }[]>([]);
  const [levels, setLevels] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>();

  const refreshDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices
      .filter((d) => d.kind === "audioinput")
      .map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone" }));
    setMics(inputs);
    if (inputs.length && !selectedMic) setSelectedMic(inputs[0].deviceId);
  };

  useEffect(() => {
    navigator.mediaDevices?.addEventListener?.("devicechange", refreshDevices);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", refreshDevices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl: autoGain,
          sampleRate: 48000,
          channelCount: 2,
        },
      });
      stream.getTracks().forEach((t) => t.stop()); // just to unlock labels
      await refreshDevices();
      setPermissionState("granted");
    } catch (e) {
      setPermissionState("denied");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: selectedMic ? { exact: selectedMic } : undefined,
        echoCancellation,
        noiseSuppression,
        autoGainControl: autoGain,
        sampleRate: 48000,
        channelCount: 2,
      },
    });
    streamRef.current = stream;

    // Live level meter
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setLevels(avg);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 256000 });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const name = `chord-bank-recording-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
      setRecordings((prev) => [{ url, name }, ...prev]);
      stream.getTracks().forEach((t) => t.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.close();
      setLevels(0);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Record Yourself</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Plug in an external mic (USB or interface) on Mac or phone and it will show up below — the browser
          picks it up automatically. Echo cancellation and noise suppression run on-device, powered by your
          system&apos;s audio drivers, before the recording is captured.
        </p>
      </div>

      <div className="card p-4 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Microphone</label>
          <select
            value={selectedMic}
            onChange={(e) => setSelectedMic(e.target.value)}
            className="w-full rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
          >
            {mics.length === 0 && <option>No microphone detected yet — click &quot;Enable microphone&quot;</option>}
            {mics.map((m) => (
              <option key={m.deviceId} value={m.deviceId}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={noiseSuppression} onChange={(e) => setNoiseSuppression(e.target.checked)} />
            Noise suppression
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={echoCancellation} onChange={(e) => setEchoCancellation(e.target.checked)} />
            Echo cancellation
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoGain} onChange={(e) => setAutoGain(e.target.checked)} />
            Auto gain
          </label>
        </div>

        {permissionState !== "granted" && (
          <button
            onClick={requestAccess}
            className="self-start px-4 py-2 rounded-xl bg-teal text-white text-sm font-medium"
          >
            Enable microphone
          </button>
        )}

        {permissionState === "denied" && (
          <p className="text-sm text-red-500">
            Microphone access was denied. Check your browser/system privacy settings and try again.
          </p>
        )}

        <div className="flex items-center gap-3">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={permissionState !== "granted"}
              className="px-5 py-2.5 rounded-xl bg-magenta text-white font-semibold disabled:opacity-40"
            >
              ● Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="px-5 py-2.5 rounded-xl bg-ink text-white font-semibold">
              ■ Stop
            </button>
          )}
          <div className="flex-1 h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-teal transition-all duration-75"
              style={{ width: `${Math.min(100, (levels / 128) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {recordings.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Your recordings (this session)</h2>
          <div className="flex flex-col gap-3">
            {recordings.map((r) => (
              <div key={r.url} className="flex items-center gap-3">
                <audio controls src={r.url} className="flex-1" />
                <a href={r.url} download={r.name} className="text-sm text-teal underline shrink-0">
                  Download
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink/50 dark:text-cream/50 mt-3">
            In the full build, saving a recording also uploads it to your Supabase storage bucket, tagged with
            the song and transposition you were practicing — see Settings.
          </p>
        </div>
      )}
    </div>
  );
}
