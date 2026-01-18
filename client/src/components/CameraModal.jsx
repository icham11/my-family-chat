import React, { useRef, useState, useEffect } from "react";

const CameraModal = ({ onClose, onCapture }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState("photo"); // photo | video
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t >= 45) {
            stopRecording();
            return 45;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera/microphone");
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      setPhotoBlob(blob);
      stopCamera();
    }, "image/jpeg");
  };

  const startRecording = () => {
    setTimer(0);
    chunksRef.current = [];
    const options = { mimeType: "video/webm" };
    try {
      mediaRecorderRef.current = new MediaRecorder(stream, options);
    } catch (e) {
      console.error("Exception while creating MediaRecorder:", e);
      return;
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setVideoBlob(blob);
      stopCamera();
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (photoBlob) {
      const file = new File([photoBlob], "photo.jpg", { type: "image/jpeg" });
      onCapture(file, "image");
    } else if (videoBlob) {
      const file = new File([videoBlob], "video.webm", { type: "video/webm" });
      onCapture(file, "video");
    }
    onClose();
  };

  const handleRetake = () => {
    setPhotoBlob(null);
    setVideoBlob(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col items-center">
        {/* Header */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Viewport */}
        <div className="w-full relative bg-black aspect-video flex items-center justify-center">
          {!photoBlob && !videoBlob && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}

          {photoBlob && (
            <img
              src={URL.createObjectURL(photoBlob)}
              className="w-full h-full object-contain"
              alt="Preview"
            />
          )}

          {videoBlob && (
            <video
              src={URL.createObjectURL(videoBlob)}
              controls
              className="w-full h-full object-contain"
            />
          )}

          {/* Recording Timer */}
          {isRecording && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600/80 px-4 py-1 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white font-mono font-bold">
                00:{timer.toString().padStart(2, "0")} / 00:45
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full p-6 flex flex-col items-center gap-4 bg-bg-secondary">
          {/* Mode Switcher */}
          {!photoBlob && !videoBlob && !isRecording && (
            <div className="flex bg-black/30 rounded-full p-1 border border-white/5">
              <button
                onClick={() => setMode("photo")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  mode === "photo"
                    ? "bg-white text-black shadow-lg"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => setMode("video")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  mode === "video"
                    ? "bg-white text-black shadow-lg"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Video
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-8">
            {photoBlob || videoBlob ? (
              <>
                <button
                  onClick={handleRetake}
                  className="px-6 py-2 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={handleSend}
                  className="btn btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                >
                  <span>Send {photoBlob ? "Photo" : "Video"}</span>
                  <svg
                    className="w-5 h-5 -rotate-45"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </>
            ) : (
              // Capture Button
              <button
                onClick={
                  mode === "photo"
                    ? takePhoto
                    : isRecording
                      ? stopRecording
                      : startRecording
                }
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all transform active:scale-95 ${
                  mode === "video" && isRecording
                    ? "border-red-500 bg-red-500"
                    : "border-white hover:bg-white/20"
                }`}
              >
                <div
                  className={`rounded-full transition-all ${
                    isRecording
                      ? "w-6 h-6 bg-white rounded-sm"
                      : "w-14 h-14 bg-white"
                  }`}
                ></div>
              </button>
            )}
          </div>

          <p className="text-xs text-text-secondary opacity-60">
            {isRecording
              ? "Tap button to stop"
              : mode === "video"
                ? "Tap button to start recording (Max 45s)"
                : "Tap button to take photo"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
