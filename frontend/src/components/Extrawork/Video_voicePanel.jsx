import React, { useEffect, useRef, useState } from "react";
import { Camera, Mic, Volume2 } from "lucide-react";

const Video_voicePanel = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [devices, setDevices] = useState({
    cameras: [],
    microphones: [],
    speakers: [],
  });

  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("default");
  const [selectedSpeaker, setSelectedSpeaker] = useState("default");

  // ✅ Fetch all devices once
  useEffect(() => {
    async function fetchDevices() {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const cameras = allDevices.filter((d) => d.kind === "videoinput");
        const microphones = allDevices.filter((d) => d.kind === "audioinput");
        const speakers = allDevices.filter((d) => d.kind === "audiooutput");

        setDevices({ cameras, microphones, speakers });

        if (cameras.length > 0 && !selectedCamera)
          setSelectedCamera(cameras[0].deviceId);
        if (microphones.length > 0 && selectedMic === "default")
          setSelectedMic(microphones[0].deviceId);
        if (speakers.length > 0 && selectedSpeaker === "default")
          setSelectedSpeaker(speakers[0].deviceId);
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    }
    fetchDevices();
  }, []);

  // ✅ Start camera stream
  useEffect(() => {
    let activeStream = null;
    let isMounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          },
          audio: false,
        });

        if (!isMounted) return;
        streamRef.current = stream;
        activeStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }

    startCamera();

    return () => {
      isMounted = false;

      // ✅ Instantly stop camera
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [selectedCamera]);

  return (
    <div className="p-4 text-black dark:text-white space-y-6">
      <h2 className="text-2xl font-semibold mb-2">Video & Voice</h2>

      {/* 🎥 Video Section */}
      <div>
        <p className=" text-base mb-2">Video</p>
        <div className="rounded-md p-2">
          <div className="flex items-center gap-2 mb-3 text-sm ">
            <Camera size={20} />
            <select
              className=" border border-black dark:text-black dark:border-gray-300 rounded px-2 py-1  outline-none"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              {devices.cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || "Camera"}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md overflow-hidden border border-[#3a3a3a]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>

      <p className="text-base font-semibold">
        Camera will Automatically off after 5 to 10 sec
      </p>

      {/* 🎙️ Microphone Section */}
      <div>
        <p className=" text-base mb-2">Microphone</p>
        <div className="rounded-md border-[#3a3a3a]">
          <div className="flex items-center gap-2 text-sm p-2">
            <Mic size={20} />
            <select
              className="border border-black dark:text-black dark:border-gray-300  rounded px-2 py-1  outline-none w-[60%] h-[35px]"
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
            >
              <option value="default">
                Microphone Array (Intel@Smart Sound Technology)
              </option>
              {devices.microphones.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || "Default Microphone"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 🔊 Speaker Section */}
      <div>
        <p className="t text-base mb-2">Speakers</p>
        <div className="rounded-md border-[#3a3a3a]">
          <div className="flex items-center gap-2 text-sm p-2">
            <Volume2 size={20} />
            <select
              className="border border-black dark:text-black dark:border-gray-300  rounded px-2 py-1  outline-none w-[60%] h-[35px]"
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
            >
              <option value="default">Default Device</option>
              {devices.speakers.map((speaker) => (
                <option key={speaker.deviceId} value={speaker.deviceId}>
                  {speaker.label || "Speaker (Realtek(R) Audio)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video_voicePanel;
