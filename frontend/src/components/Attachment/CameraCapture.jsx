import React, { useRef, useState, useEffect } from "react";

const CameraCapture = ({ onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [stream, setStream] = useState(null);

  // 🔹 Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera access denied:", err);
      onClose(); // close popup only if camera fails
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // 🔹 Capture photo
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Draw current frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL("image/png");
    stopCamera(); // stop camera light
    setPhoto(imageUrl); // show preview
  };

  // 🔹 Retake (discard and reopen camera)
  const handleDiscard = () => {
    setPhoto(null);
    startCamera(); // reopen camera
  };

  // 🔹 Send to parent
  const handleSend = async () => {
    if (!photo) return;
    const res = await fetch(photo);
    const blob = await res.blob();
    const file = new File([blob], `photo_${Date.now()}.png`, {
      type: "image/png",
    });
    console.log("📤 CameraCapture: sending file to parent =>", file); // ⭐ ADD THIS

    onCapture(file); // send to parent
    stopCamera();
    onClose();
  };

  // 🔹 Cancel completely
  const handleCancel = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className="bg-[#202c33] rounded-xl p-4 w-[400px] relative shadow-xl"
        onClick={(e) => e.stopPropagation()} // ★ prevents closing on capture click
      >
        {!photo ? (
          <>
            {/* 🎥 Live Camera View */}
            <video
              ref={videoRef}
              autoPlay
              className="w-full rounded-xl border border-gray-700"
            />
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                className="bg-cyan-700 text-white px-4 py-2 rounded-full text-sm hover:bg-cyan-600 transition"
              >
                Capture
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 🖼️ Captured Photo Preview */}
            <div className="flex flex-col items-center">
              <img
                src={photo}
                alt="Captured"
                className="rounded-xl max-h-72 border border-gray-700"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleDiscard}
                  className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-500 transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleSend}
                  className="bg-cyan-700 text-white px-4 py-2 rounded-full text-sm hover:bg-cyan-600 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;
