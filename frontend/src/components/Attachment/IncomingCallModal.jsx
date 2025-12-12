// IncomingCallModal.jsx
import React, { useEffect, useRef, useCallback } from "react";
import { PhoneOff, Phone, Video } from "lucide-react";

const IncomingCallModal = ({ data, socket, onAccept, onReject }) => {
  const { fromSocketId, offer, callerId, callType } = data || {};
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const localStreamRef = useRef(null);

  // ✅ Centralized and Stable Cleanup
  const cleanupCall = useCallback(() => {
    try {
      const pcToClose = pcRef.current;
      const streamToStop = localStreamRef.current;

      if (pcToClose && pcToClose.signalingState !== "closed") pcToClose.close();

      if (streamToStop) streamToStop.getTracks().forEach((t) => t.stop());

      pcRef.current = null;
      localStreamRef.current = null;
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }, []);

  // 🟢 Callee receives ICE candidate from caller
  useEffect(() => {
    socket.on("ice-candidate", ({ candidate }) => {
      console.log("ICE RECEIVED ON CALLEE:", candidate);
      try {
        if (pcRef.current && candidate) {
          pcRef.current.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error("Add ICE error:", err);
      }
    });

    return () => {
      socket.off("ice-candidate");
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [cleanupCall]); // cleanupCall dependency

  // ✅ Handle call accept
  const handleAccept = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // 🧊 ICE Candidate Listener (Send to Caller)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Double check before emitting
          if (pcRef.current && pcRef.current.signalingState !== "closed") {
            socket.emit("ice-candidate", {
              to: fromSocketId,

              candidate: event.candidate,
            });
          }
        }
      };

      // ✅ Handle remote stream
      pc.ontrack = (ev) => {
        if (remoteRef.current) {
          remoteRef.current.srcObject = ev.streams[0];
        }
      };

      // ✅ Get local media
      const constraints =
        callType === "video" ? { video: true, audio: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localRef.current && callType === "video") {
        localRef.current.srcObject = stream;
      }

      // 💡 CRITICAL CHECK: PC बंद तो नहीं हो गया?
      if (!pcRef.current || pcRef.current.signalingState === "closed") {
        console.warn(
          "PC closed after media access in IncomingCallModal, stopping media."
        );
        stream.getTracks().forEach((t) => t.stop()); // Stop stream as media access succeeded
        // Cleanup will happen on modal unmount
        return;
      }

      // ✅ Add tracks safely
      stream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, stream);
        } catch (err) {
          console.warn("AddTrack failed:", err);
        }
      });

      // ✅ Set remote offer, create & send answer
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer back to the Caller's socket
      socket.emit("answer-call", { to: fromSocketId, answer });

      // ✅ Notify parent about accepted call
      onAccept?.(pc);
    } catch (err) {
      console.error("Accept call error:", err);
      // Clean up local resources before rejecting/closing modal
      cleanupCall();
      // Reject signal to the caller (internal=false by default, so it emits end-call)
      handleReject();
    }
  };

  // ✅ Handle reject
  const handleReject = (internal = false) => {
    if (fromSocketId && !internal) {
      // Reject signal to the caller
      socket.emit("end-call", { to: fromSocketId });
    }
    // Cleanup will run on modal unmount via useEffect
    onReject?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f1720] rounded-xl shadow-lg p-6 w-[360px] text-center border border-gray-700">
        <div className="text-white font-semibold mb-2 text-lg">
          Incoming {callType === "video" ? "Video" : "Audio"} Call
        </div>
        <div className="text-gray-300 mb-4 text-sm">
          Caller: **{callerId || "Unknown"}**
        </div>

        {callType === "video" && (
          <div className="relative mb-4">
            <Video
              size={80}
              className="text-gray-400 w-full h-48 bg-black rounded-md object-cover p-8 mx-auto"
            />
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => handleReject()}
            className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-700 transition-all"
          >
            <PhoneOff size={16} /> Reject
          </button>

          <button
            onClick={handleAccept}
            className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-green-700 transition-all"
          >
            {callType === "video" ? (
              <>
                <Video size={16} /> Accept
              </>
            ) : (
              <>
                <Phone size={16} /> Accept
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
