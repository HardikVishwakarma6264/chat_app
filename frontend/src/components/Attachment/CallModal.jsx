// CallModal.jsx
import React, { useRef, useEffect, useCallback } from "react";
import { PhoneOff, User } from "lucide-react";

const CallModal = ({
  type,
  onEnd,
  socket,
  peerId,
  currentUserId,
  onCallStart,
}) => {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerSocketIdRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  // ✅ 1. Stable End Call Function (useCallback/useRef is key here)
  const endCall = useCallback(() => {
    const pcToClose = pcRef.current;
    const streamToStop = localStreamRef.current;

    // 1. Stop local tracks
    if (streamToStop) {
      streamToStop.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // 2. Close peer connection
    if (pcToClose && pcToClose.signalingState !== "closed") {
      pcToClose.close();
      pcRef.current = null;
    }

    // 3. Close Modal UI
    onEnd?.();
  }, [onEnd]); // onEnd को dependency में रखना ज़रूरी है

  // ✅ Handle manual end call
  const handleEndCall = () => {
    socket.emit("end-call", { to: peerId });
    endCall();
  };

  useEffect(() => {
    // 1. ✅ Create Peer Connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;
    // Parent component को pc वापस भेजें
    onCallStart(pc);

    // 2. 🧊 ICE Candidate Event
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (pcRef.current && pcRef.current.signalingState !== "closed") {
          socket.emit("ice-candidate", {
            to: peerSocketIdRef.current, // socket.id of the other person
            candidate: event.candidate,
          });
        }
      }
    };

    // 3. ✅ Get Media
    const constraints =
      type === "video" ? { video: true, audio: true } : { audio: true };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(async (stream) => {
        localStreamRef.current = stream;

        if (localRef.current && type === "video")
          localRef.current.srcObject = stream;

        // Add tracks
        stream.getTracks().forEach((track) => {
          // Add track only if PC is not closed
          if (pcRef.current && pcRef.current.signalingState !== "closed") {
            pcRef.current.addTrack(track, stream);
          }
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteRef.current) {
            remoteRef.current.srcObject = event.streams[0];
          }
        };

        // 💡 CRITICAL FIX: Check if PC was closed during async operation (like media access)
        // यह वह लाइन है जो आपके कंसोल एरर को रोकेगी।
        if (!pcRef.current || pcRef.current.signalingState === "closed") {
          console.warn("PC closed after media access, aborting createOffer.");
          // Stream को stop करना जरूरी है क्योंकि media access सफल हो गया था
          stream.getTracks().forEach((track) => track.stop());
          endCall(); // Cleanup UI
          return;
        }

        // 4. Create & send offer (now safe to execute)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call-user", {
          to: peerSocketIdRef.current,
          offer,
          callerSocket: socket.id, // THIS MUST BE SOCKET ID
          callType: type,
        });
      })
      .catch((err) => {
        console.error(
          "Media Error: Failed to get local media or createOffer:",
          err
        );
        // Media access failed or createOffer failed
        endCall();
        socket.emit("end-call", { to: peerId });
      });

    // 5. ✅ When remote ends call
    const onRemoteCallEnd = () => {
      console.log("Remote user ended call.");
      endCall();
    };
    // 🟢 1. Caller receives ANSWER from callee
    socket.on("call-accepted", ({ answer }) => {
      console.log("ANSWER RECEIVED:", answer);
      if (pcRef.current) {
        pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // 🟢 2. Caller receives ICE candidates
    socket.on("ice-candidate", ({ candidate }) => {
      console.log("ICE RECEIVED ON CALLER:", candidate);
      try {
        if (pcRef.current && candidate) {
          pcRef.current.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error("Add ICE error:", err);
      }
    });

    socket.on("call-ended", onRemoteCallEnd);

    // 6. ✅ Cleanup on unmount (useEffect return function)
    return () => {
      console.log("CallModal Cleanup triggered.");
      endCall(); // Cleanup logic inside stable function
      socket.off("call-ended", onRemoteCallEnd);
    };
    // Dependencies list is now clean and correct
  }, [peerId, type, socket, currentUserId, onCallStart, endCall]);

  // ... (JSX code remains the same as before)
  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      {type === "video" ? (
        <>
          {/* Remote Video Stream */}
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-[80%] h-[60%] rounded-lg object-cover bg-gray-900"
          />
          {/* Local Video Stream */}
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className="w-[200px] h-[150px] absolute bottom-6 right-6 rounded-lg border border-gray-500 object-cover"
          />
        </>
      ) : (
        <>
          <User size={100} className="text-white mb-6" />
          <p className="text-white text-lg">Audio Call in Progress...</p>
        </>
      )}

      <button
        onClick={handleEndCall}
        className="p-4 bg-red-600 rounded-full mt-6 hover:bg-red-700 transition-all"
      >
        <PhoneOff size={28} className="text-white" />
      </button>
    </div>
  );
};

export default CallModal;
