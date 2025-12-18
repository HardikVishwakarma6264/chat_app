import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  Smile,
  Paperclip,
  Mic,
  Send,
  CircleUser,
  Loader2,
  XCircle,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { sendMessage, getMessages } from "../services/operation/authapi";

import AttachmentPopup from "../Attachment/AttachmentPopup";
import EmojiPicker from "emoji-picker-react";
import { useReactMediaRecorder } from "react-media-recorder";
import VoiceMessage from "../Attachment/VoiceMessage";
import { updateLastMessage } from "../slices/chatSlice";
import loo from "../images/logo-removebg-preview.png";
import { Video, Phone } from "lucide-react";
import CallModal from "../Attachment/CallModal";
import { resetUnread } from "../slices/chatSlice";
import toast from "react-hot-toast";

const ChatWindow = ({
  chat,
  wallpaperColor,
  socket,
  isMobile,
  setShowSidebar,
  theme,
}) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  // const [socket, setSocket] = useState(null);
  const [showAttachment, setShowAttachment] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profileFullImage, setProfileFullImage] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const popupRef = useRef(null);
  const [showReactionEmojiPicker, setShowReactionEmojiPicker] = useState(false);
  const reactionEmojiRef = useRef(null);
  const [toastMsg, setToastMsg] = useState("");
  const [hoverPopup, setHoverPopup] = useState(null);
  const [showPinDropdown, setShowPinDropdown] = useState(null);
  const [replyData, setReplyData] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  const messageRefs = useRef({});
  const peerSocketIdRef = useRef(null);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [peerSocketId, setPeerSocketId] = useState(null);
  const [callType, setCallType] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchRef = useRef({});
  const [otherTyping, setOtherTyping] = useState(false);
  let typingTimeout = null;

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat]);

  const selectedChatId = useSelector((state) => state.chat.selectedChatId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setActivePopup(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCall = (data) => {
      peerSocketIdRef.current = data.fromSocketId; // socket.id
      setIncomingCallData(data);
    };

    socket.on("incoming-call", handleCall);

    return () => socket.off("incoming-call", handleCall);
  }, [socket]);

  useEffect(() => {
    if (!toastMsg) return;

    const timer = setTimeout(() => setToastMsg(""), 1500);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  useEffect(() => {
    const handleReactionOutside = (e) => {
      if (
        reactionEmojiRef.current &&
        !reactionEmojiRef.current.contains(e.target)
      ) {
        setShowReactionEmojiPicker(false);
      }
    };

    document.addEventListener("click", handleReactionOutside);
    return () => document.removeEventListener("click", handleReactionOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    let matches = [];

    messages.forEach((msg) => {
      if (
        msg.message &&
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        matches.push(msg._id);
      }
    });

    setSearchMatches(matches);

    // Auto scroll to first match
    if (matches.length > 0) {
      scrollToMatch(0);
    }
  }, [searchQuery, messages]);

  const scrollToMatch = (index) => {
    const msgId = searchMatches[index];
    const element = messageRefs.current[msgId];

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      element.classList.add("reply-highlight");
      setTimeout(() => element.classList.remove("reply-highlight"), 1200);
    }
  };

  const emojiRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  // 🔥 FULLSCREEN IMAGE VIEW STATES
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  // 🎙️ Voice recording setup
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({ audio: true });

  useEffect(() => {
    if (!mediaBlobUrl) return;
    const convertAudio = async () => {
      const res = await fetch(mediaBlobUrl);
      const blob = await res.blob();
      const file = new File([blob], `voice_${Date.now()}.webm`, {
        type: "audio/webm",
      });
      setSelectedFile(file);
      setPreviewAudioUrl(mediaBlobUrl);
    };
    convertAudio();
  }, [mediaBlobUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target))
        setShowEmojiPicker(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket || !chat?.id) return;

    socket.emit("get-socket-id", chat.id);

    socket.on("socket-id-result", ({ userId, socketId }) => {
      if (userId === chat.id) {
        // console.log("✔ Receiver socket id:", socketId);
        peerSocketIdRef.current = socketId;
      }
    });

    return () => socket.off("socket-id-result");
  }, [socket, chat]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data) => {
      if (messages.some((m) => m._id === data._id)) return;
      setMessages((prev) => [...prev, data]);
      dispatch(
        updateLastMessage({
          chatId: data.senderId === user._id ? data.receiverId : data.senderId,
          message:
            data.message ||
            (data.fileType?.startsWith("image")
              ? "📷 Image"
              : data.fileType?.startsWith("video")
              ? "🎬 Video"
              : data.fileType?.startsWith("audio")
              ? "🎙️ Voice"
              : "📄 File"),
          time: data.createdAt,
        })
      );
    };
    socket.on("receiveMessage", handleReceive);
    return () => socket?.off("receiveMessage", handleReceive);
  }, [socket]);

  // ✔✔ TICK EVENT LISTENERS
  useEffect(() => {
    if (!socket) return;

    socket.on("messageDelivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, delivered: true } : m))
      );
    });

    socket.on("messageRead", () => {
      setMessages((prev) =>
        prev.map((m) => (m.senderId === user._id ? { ...m, read: true } : m))
      );
    });

    return () => {
      socket.off("messageDelivered");
      socket.off("messageRead");
    };
  }, [socket]);

  useEffect(() => {
    if (chat?.id) {
      dispatch(resetUnread(chat.id));
    }
  }, [chat]);

  useEffect(() => {
    if (!chat) return;
    (async () => {
      const res = await dispatch(getMessages(chat.id));
      if (res.success) setMessages(res.messages);
    })();
  }, [chat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveReaction", (data) => {
      const { messageId, emoji, userId } = data;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reaction: { emoji, userId } } : msg
        )
      );
    });

    return () => socket?.off("receiveReaction");
  }, [socket]);

  useEffect(() => {
    if (!socket || !chat) return;

    socket.on("typing", ({ senderId }) => {
      if (senderId === chat.id) setOtherTyping(true);
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === chat.id) setOtherTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (type, files) => {
    if (!files?.length) return;

    const file = files[0];
    console.log("📥 ChatWindow received file:", file);

    setSelectedFile(file);

    if (file.type.startsWith("image")) {
      setPreviewImage(URL.createObjectURL(file));
    }

    if (file.type.startsWith("video")) {
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const discardSelectedFile = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setPreviewVideo(null);
    setPreviewAudioUrl(null);
    clearBlobUrl();
  };

  const handleEmojiClick = (e) => setInput((p) => p + e.emoji);

  const handleSend = async () => {
    if (!chat) return;
    const receiverId = chat.id;

    if (selectedFile) {
      const tempId = Date.now();
      const tempMsg = {
        _id: tempId,
        senderId: user._id,
        message: "",
        fileType: selectedFile.type,
        mediaUrl: URL.createObjectURL(selectedFile),
        createdAt: new Date(),
        isPending: true,
      };
      setMessages((p) => [...p, tempMsg]);

      const currentFile = selectedFile;
      discardSelectedFile();
      try {
        const token = JSON.parse(localStorage.getItem("token"));
        const fd = new FormData();
        fd.append("file", currentFile);
        // fd.append("message", currentFile.name);
        fd.append("message", "");

        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/mess/send/${receiverId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          }
        );
        const data = await res.json();
        if (data.success) {
          setMessages((p) =>
            p.map((m) =>
              m._id === tempId ? { ...data.data, isPending: false } : m
            )
          );
          socket?.emit("sendMessage", { ...data.data, receiverId });
        }
      } catch {
        setMessages((p) =>
          p.map((m) =>
            m._id === tempId ? { ...m, isPending: false, isFailed: true } : m
          )
        );
      }
      return;
    }

    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    // const res = await dispatch(sendMessage(chat.id, text));
    const res = await dispatch(sendMessage(chat.id, text, replyData?.id));
    setReplyData(null);
    if (res.success) {
      setMessages((p) => [...p, res.data]);
      socket?.emit("sendMessage", { ...res.data, receiverId });
    }
  };

  const handleCopy = async (msg) => {
    try {
      // TEXT COPY
      if (!msg.mediaUrl) {
        await navigator.clipboard.writeText(msg.message);
        setToastMsg("Copied!");
        return;
      }

      // MEDIA COPY (image, audio, video)
      const response = await fetch(msg.mediaUrl);
      const blob = await response.blob();

      const clipboardItem = new ClipboardItem({
        [blob.type]: blob,
      });

      await navigator.clipboard.write([clipboardItem]);
      setToastMsg("Copied!");
    } catch (err) {
      console.error(err);
      setToastMsg("Copy not supported!");
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      const res = await fetch(
        // `http://localhost:4001/api/v1/mess/delete-for-me/${messageId}`,
        `${process.env.REACT_APP_API_BASE_URL}/mess/delete-for-me/${messageId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        setToastMsg("Deleted");
      }
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  const handleStar = async (messageId, receiverId) => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      const res = await fetch(
        // `http://localhost:4001/api/v1/mess/star/${messageId}`,
        `${process.env.REACT_APP_API_BASE_URL}/mess/star/${messageId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!data.success) return;

      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isStarred: data.data.isStarred } : m
        )
      );

      // ⭐ send via socket
      socket?.emit("sendStar", {
        messageId,
        isStarred: data.data.isStarred,
        receiverId,
        senderId: user._id,
      });
    } catch (e) {
      console.log("Star error:", e);
    }
  };

  const handlePin = async (msg) => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      const res = await fetch(
        // `http://localhost:4001/api/v1/mess/pin/${msg._id}`,
        `${process.env.REACT_APP_API_BASE_URL}/mess/pin/${msg._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!data.success) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msg._id
            ? {
                ...m,
                pinned: data.data.pinned,
                pinnedBy: data.data.pinnedBy, // ★ ADD THIS
              }
            : { ...m, pinned: false, pinnedBy: null }
        )
      );

      // socket
      socket?.emit("sendPin", {
        messageId: msg._id,
        pinned: data.data.pinned,
        receiverId: msg.senderId === user._id ? msg.receiverId : msg.senderId,
        senderId: user._id,
      });

      // Toast
      setToastMsg(data.data.pinned ? "Pinned" : "Unpinned");
    } catch (e) {
      console.log("Pin error:", e);
    }
  };

  const formatDateSeparator = (date) => {
    const msgDate = new Date(date);
    const today = new Date();

    const isToday =
      msgDate.getDate() === today.getDate() &&
      msgDate.getMonth() === today.getMonth() &&
      msgDate.getFullYear() === today.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
      msgDate.getDate() === yesterday.getDate() &&
      msgDate.getMonth() === yesterday.getMonth() &&
      msgDate.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return msgDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("receivePin", (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId
            ? { ...m, pinned: data.pinned, pinnedBy: data.pinnedBy }
            : { ...m, pinned: false, pinnedBy: null }
        )
      );

      const otherUserId =
        data.senderId === user._id ? data.receiverId : data.senderId;

      dispatch(
        updateLastMessage({
          chatId: otherUserId,
          message: data.lastMessage,
          time: data.lastMessageTime,
          noUnread: true,
        })
      );
    });

    return () => socket.off("receivePin");
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleStarReceive = (data) => {
      // 1) Update message
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, isStarred: data.isStarred } : m
        )
      );

      // 2) Find chatId to update in sidebar
      const otherUserId =
        data.senderId === user._id ? data.receiverId : data.senderId;

      // 3) Check if current user initiated
      const isOwn = data.senderId === user._id;

      dispatch(
        updateLastMessage({
          chatId: otherUserId,
          message: data.lastMessage,
          time: data.lastMessageTime,
          isOwnMessage: isOwn,
          isChatOpen: selectedChatId === otherUserId, // now no error
          noUnread: true,
        })
      );
    };

    socket.on("receiveStar", handleStarReceive);
    return () => socket.off("receiveStar", handleStarReceive);
  }, [socket]);

  const handleReaction = async (emoji, messageId, receiverId) => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      const res = await fetch(
        // `http://localhost:4001/api/v1/mess/reaction/${messageId}`,
        `${process.env.REACT_APP_API_BASE_URL}/mess/reaction/${messageId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emoji,
            userId: user._id,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // LIVE UPDATE
        socket?.emit("sendReaction", {
          messageId,
          emoji,
          userId: user._id,
          receiverId,
          senderId: user._id,
        });

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, reaction: data.data.reaction }
              : msg
          )
        );
      }
    } catch (e) {
      // console.log("Reaction error:", e);
    }
  };

  const closeFullImage = () => {
    setFullscreenImage(null);
    setZoom(1);
  };

  const zoomWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0 && zoom < 4) setZoom((z) => z + 0.1);
    if (e.deltaY > 0 && zoom > 1) setZoom((z) => z - 0.1);
  };

  if (!chat)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <img
          src={loo}
          alt="Samvaad Logo"
          className="h-52 w-52 mb-1 logo-spin-3d" // bigger + spacing
        />

        <p className="text-xl">Select a chat to start messaging</p>
      </div>
    );

  return (
    <div className="flex flex-col h-full ">
      {/* FULLSCREEN PROFILE IMAGE VIEW */}

      {showCallModal && (
        <CallModal
          type={callType}
          socket={socket}
          peerId={chat.id}
          currentUserId={user._id}
          onEnd={() => setShowCallModal(false)}
          onCallStart={(pc) => console.log("PC START:", pc)}
        />
      )}

      {profileFullImage && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center transition-opacity duration-300 ease-out"
          onClick={() => setProfileFullImage(null)}
        >
          <img
            src={profileFullImage}
            alt="Profile"
            onClick={(e) => e.stopPropagation()}
            className="
        max-w-[90vw] max-h-[90vh]
        rounded-xl shadow-2xl
        transform scale-90 opacity-0
        animate-profileZoom
        transition-all duration-300 ease-out
      "
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between  py-3  h-[58px]">
        <div className="flex items-center space-x-1">
          {isMobile && (
            <div
              className="mr-1 p-2 cursor-pointer text-xl  font-bold hover:bg-gray-700 rounded-lg"
              onClick={() => setShowSidebar(true)}
            >
              ←
            </div>
          )}
          {chat.image ? (
            <img
              src={chat.image}
              alt={chat.name}
              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80"
              onClick={() => setProfileFullImage(chat.image)}
            />
          ) : (
            <CircleUser size={40} className="text-gray-400" />
          )}
          <div className="flex flex-col">
            <p className="font-semibold text-base">{chat.name}</p>

            {otherTyping && (
              <p className="text-cyan-400 text-sm  ">typing...</p>
            )}
          </div>
        </div>

        <div className="flex space-x-1 ">
          <div
            className="p-2  rounded-full cursor-pointer  hover:scale-110 transition-all duration-200 shadow-md"
            onClick={() => {
              // console.log("OPENING CALL MODAL");
              // setCallType("video");

              // setShowCallModal(true);
              toast(" Video calling is coming soon . . . ", {
                icon: "⏳",
                style: {
                  borderRadius: "10px",
                  background: "#333",
                  color: "#fff",
                  fontSize: "15px",
                  padding: "14px 20px",
                },
              });
            }}
          >
            <Video size={20} />
          </div>

          <div
            className="p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 shadow-md"
            onClick={() => {
              // setCallType("audio");
              // setPeerSocketId(chat.id); // If chat.id = userId
              // setShowCallModal(true);
              toast(" Audio calling is coming soon... ", {
                icon: "⏳",
                style: {
                  borderRadius: "10px",
                  background: "#333",
                  color: "#fff",
                  fontSize: "15px",
                  padding: "14px 20px",
                },
              });
            }}
          >
            <Phone size={20} />
          </div>

          <div
            className="p-2   cursor-pointer  hover:scale-110 transition-all duration-200 shadow-md rounded-full"
            onClick={() => setShowSearchBar(true)}
          >
            <Search size={20} />
          </div>
        </div>
      </div>

      {showSearchBar && (
        <div className="absolute top-[117px] right-0 z-[9999]">
          {/* OUTER CONTAINER */}
          <div
            className="flex items-center gap-3  
      px-4 py-2 rounded-xl shadow-2xl border border-[#2f3b40]
      w-[340px] backdrop-blur-sm"
          >
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search within chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent  px-1 py-1 outline-none 
          placeholder-gray-800 border-b border-gray-800 
          focus:border-cyan-500 transition-all duration-300 rounded-md"
              />
            </div>

            {/* Up Arrow */}
            <div
              className="p-1.5 rounded-md cursor-pointer hover:scale-110 
        transition  text-sm"
              onClick={() => {
                if (searchMatches.length === 0) return;
                const newIndex =
                  (currentMatchIndex - 1 + searchMatches.length) %
                  searchMatches.length;
                setCurrentMatchIndex(newIndex);
                scrollToMatch(newIndex);
              }}
            >
              ▲
            </div>

            {/* Down Arrow */}
            <div
              className="p-1.5 rounded-md cursor-pointer 
        transition  text-sm"
              onClick={() => {
                if (searchMatches.length === 0) return;
                const newIndex = (currentMatchIndex + 1) % searchMatches.length;
                setCurrentMatchIndex(newIndex);
                scrollToMatch(newIndex);
              }}
            >
              ▼
            </div>

            {/* Close Button */}
            <div
              className="p-1.5 rounded-md cursor-pointer hover:scale-110
        transition text-bold"
              onClick={() => {
                setShowSearchBar(false);
                setSearchQuery("");
              }}
            >
              ✕
            </div>
          </div>
        </div>
      )}

      {/* 🔥 SHOW ALL PINNED MESSAGES LIKE WHATSAPP */}
      {messages
        .filter((m) => m.pinned)
        .map((pinnedMsg) => (
          <div
            key={pinnedMsg._id}
            className={`border rounded-xl px-4 py-3 mb-1 shadow-lg flex items-center gap-3 transition 
      ${showPinDropdown === pinnedMsg._id ? "bg-[#143d36]" : "bg-[#1f2a33]"} 
      border-gray-600`}
          >
            <span className="text-yellow-300 text-xl">📌</span>

            <div className="flex-1">
              <p className="text-white text-base truncate max-w-[240px]">
                {pinnedMsg.message}
              </p>
            </div>

            {pinnedMsg.pinnedBy === user._id && (
              <div className="relative">
                <div
                  className="cursor-pointer text-cyan-300 px-2 py-1 hover:bg-[#314149] rounded-md transition-all"
                  onClick={() =>
                    setShowPinDropdown(
                      showPinDropdown === pinnedMsg._id ? null : pinnedMsg._id
                    )
                  }
                >
                  {showPinDropdown === pinnedMsg._id ? "▲" : "▼"}
                </div>

                {showPinDropdown === pinnedMsg._id && (
                  <div className="absolute right-0 mt-1 bg-[#1c252b] border border-gray-700 rounded-md shadow-xl w-24 z-[9999]">
                    <p
                      className="px-3 py-2 text-red-300 hover:bg-[#2e3a3f] rounded-md cursor-pointer"
                      onClick={() => {
                        handlePin(pinnedMsg);
                        setShowPinDropdown(null);
                      }}
                    >
                      Unpin
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

      {/* Messages */}

      <div
        className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar"
        style={{
          background: wallpaperColor,
          backgroundSize: "400% 400%",
          animation: "gradientAnimation 10s ease infinite",
        }}
      >
        {/* ⭐ DATE-SEPARATED MESSAGE RENDERING ⭐ */}
        {(() => {
          let lastDate = null;

          return messages.map((msg) => {
            const currentDate = new Date(msg.createdAt).toDateString();
            const showDate = currentDate !== lastDate;
            lastDate = currentDate;

            return (
              <React.Fragment key={msg._id}>
                {/* 🔥 DATE SEPARATOR */}
                {showDate && (
                  <div className="flex justify-center my-3">
                    <span className="bg-[#243034] text-gray-300 px-3 py-1 rounded-full text-sm">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}

                {/* ⭐ ORIGINAL MESSAGE BUBBLE (NO CHANGE MADE) ⭐ */}

                <div
                  ref={(el) => (messageRefs.current[msg._id] = el)}
                  className={`flex mb-5 ${
                    msg.senderId === user._id ? "justify-end" : "justify-start"
                  }`}
                  onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
                  onTouchMove={(e) => {
                    if (!touchStart) return;

                    const currentX = e.touches[0].clientX;
                    const diff = currentX - touchStart;

                    // ⭐ RECEIVER MSG → swipe RIGHT
                    if (diff > 60 && msg.senderId !== user._id) {
                      setReplyData({
                        id: msg._id,
                        name: msg.senderId === user._id ? "You" : chat.name,
                        message: msg.message,
                        image: msg.fileType?.startsWith("image")
                          ? msg.mediaUrl
                          : null,
                        video: msg.fileType?.startsWith("video")
                          ? msg.mediaUrl
                          : null,
                        audio: msg.fileType?.startsWith("audio")
                          ? msg.mediaUrl
                          : null,
                      });

                      setTouchStart(null);
                    }

                    // ⭐ SENDER MSG → swipe LEFT
                    if (diff < -60 && msg.senderId === user._id) {
                      setReplyData({
                        id: msg._id,
                        name: msg.senderId === user._id ? "You" : chat.name,
                        message: msg.message,
                        image: msg.fileType?.startsWith("image")
                          ? msg.mediaUrl
                          : null,
                        video: msg.fileType?.startsWith("video")
                          ? msg.mediaUrl
                          : null,
                        audio: msg.fileType?.startsWith("audio")
                          ? msg.mediaUrl
                          : null,
                      });

                      setTouchStart(null);
                    }
                  }}
                  onTouchEnd={() => setTouchStart(null)}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactionEmojiPicker(false);

                      if (activePopup === msg._id) {
                        setActivePopup(null);
                      } else {
                        setActivePopup(msg._id);
                      }
                    }}
                    onMouseEnter={() => setHoverPopup(msg._id)}
                    onMouseLeave={(e) => {
                      const target = e.relatedTarget;

                      if (
                        target &&
                        target.nodeType === 1 && // ensure DOM element
                        target.closest(".hover-popup-menu")
                      ) {
                        return;
                      }

                      setHoverPopup(null);
                    }}
                    className={`relative max-w-[70%] px-4 py-4 pr-[60px] rounded-2xl shadow-md ${
                      msg.senderId === user._id
                        ? "bg-cyan-800 text-white rounded-br-none"
                        : "bg-[#1f2c33] text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.replyTo && (
                      <div
                        className="mb-2 p-2 rounded-lg bg-black/20 border-l-4 border-cyan-500 cursor-pointer"
                        onClick={() => {
                          const id = msg.replyTo?._id;
                          if (id && messageRefs.current[id]) {
                            messageRefs.current[id].scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });

                            // ⭐ highlight animation
                            const el = messageRefs.current[id];
                            el.classList.add("reply-highlight");
                            setTimeout(
                              () => el.classList.remove("reply-highlight"),
                              1200
                            );
                          }
                        }}
                      >
                        <p className="text-cyan-400 text-xs font-semibold">
                          {msg.replyTo.senderId === user._id
                            ? "You"
                            : chat.name}
                        </p>

                        <p className="text-gray-300 text-sm truncate">
                          {msg.replyTo.message ||
                            (msg.replyTo.fileType?.startsWith("image")
                              ? "Image"
                              : msg.replyTo.fileType?.startsWith("video")
                              ? "Video"
                              : msg.replyTo.fileType?.startsWith("audio")
                              ? "Audio"
                              : "Media")}
                        </p>
                      </div>
                    )}

                    {msg.mediaUrl ? (
                      msg.fileType?.startsWith("image") ? (
                        <div className="relative">
                          <img
                            src={msg.mediaUrl}
                            alt="img"
                            className="rounded-lg max-h-56 mb-2 cursor-pointer opacity-100"
                            onClick={() => setFullscreenImage(msg.mediaUrl)}
                          />

                          {msg.isPending && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                              <Loader2
                                size={28}
                                className="animate-spin text-white"
                              />
                            </div>
                          )}

                          {msg.isFailed && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                              <XCircle size={32} className="text-red-500" />
                            </div>
                          )}
                        </div>
                      ) : msg.fileType?.startsWith("video") ? (
                        <div className="relative">
                          <video
                            src={msg.mediaUrl}
                            className="rounded-lg max-h-56 mb-2"
                            controls
                          />

                          {msg.isPending && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                              <Loader2
                                size={28}
                                className="animate-spin text-white"
                              />
                            </div>
                          )}

                          {msg.isFailed && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                              <XCircle size={32} className="text-red-500" />
                            </div>
                          )}
                        </div>
                      ) : msg.fileType?.startsWith("audio") ? (
                        <div className="relative">
                          <VoiceMessage
                            src={msg.mediaUrl}
                            isSender={msg.senderId === user._id}
                          />

                          {msg.isPending && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                              <Loader2
                                size={28}
                                className="animate-spin text-white"
                              />
                            </div>
                          )}

                          {msg.isFailed && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                              <XCircle size={32} className="text-red-500" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          📄 {msg.message}
                        </a>
                      )
                    ) : (
                      // <p className="text-base break-words">{msg.message}</p>
                      <p
                        className="text-base break-words"
                        dangerouslySetInnerHTML={{
                          __html: msg.message.replace(
                            new RegExp(searchQuery, "gi"),
                            (match) =>
                              `<span class=" text-black bg-yellow-500  rounded">${match}</span>`
                          ),
                        }}
                      ></p>
                    )}

                    {msg.isStarred && (
                      <span className="absolute -top-3 right-2 text-yellow-300 text-lg drop-shadow-lg">
                        ⭐
                      </span>
                    )}

                    {activePopup === msg._id && (
                      <div
                        ref={popupRef}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute top-12 ${
                          msg.senderId === user._id
                            ? "left-0 ml-[-170px]"
                            : "right-0 mr-[-170px]"
                        } mt-[-10px] w-[220px] bg-[#1c252b] text-white rounded-xl shadow-2xl border border-gray-700 p-3 z-50 animate-fadeIn backdrop-blur-md`}
                      >
                        {/* REACTION ROW */}
                        <div className="flex items-center justify-between px-2 py-1 relative w-[195px] bg-[#263238] rounded-lg shadow-inner border border-[#334148]">
                          <div className="flex gap-2 text-xl">
                            {["👍", "❤️", "😂", "🙏"].map((emoji) => (
                              <span
                                key={emoji}
                                className="cursor-pointer hover:scale-125 transition-transform hover:bg-gray-700 rounded-2xl"
                                onClick={() =>
                                  handleReaction(
                                    emoji,
                                    msg._id,
                                    msg.senderId === user._id
                                      ? msg.receiverId
                                      : msg.senderId
                                  )
                                }
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>

                          <span
                            className="text-2xl cursor-pointer select-none flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:text-cyan-400 hover:shadow-lg transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowReactionEmojiPicker((p) => !p);
                            }}
                          >
                            +
                          </span>

                          {showReactionEmojiPicker && (
                            <div
                              ref={reactionEmojiRef}
                              className="absolute top-12 -right-[70px] z-[99999] bg-[#1f1f1f] rounded-xl shadow-2xl border border-gray-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <EmojiPicker
                                theme={
                                  document.documentElement.classList.contains(
                                    "dark"
                                  )
                                    ? "dark"
                                    : "light"
                                }
                                onEmojiClick={(e) => {
                                  setShowReactionEmojiPicker(false);
                                  handleReaction(
                                    e.emoji,
                                    msg._id,
                                    msg.senderId === user._id
                                      ? msg.receiverId
                                      : msg.senderId
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <hr className="border-gray-700 my-3" />

                        <p
                          className="py-2 px-3 hover:bg-[#2e3a3f] hover:text-cyan-400 rounded-lg cursor-pointer transition-all bg-gray-800 mb-1"
                          onClick={() => {
                            setReplyData({
                              id: msg._id,
                              name:
                                msg.senderId === user._id ? "You" : chat.name,
                              message: msg.message,
                              image: msg.fileType?.startsWith("image")
                                ? msg.mediaUrl
                                : null,
                              video: msg.fileType?.startsWith("video")
                                ? msg.mediaUrl
                                : null,
                              audio: msg.fileType?.startsWith("audio")
                                ? msg.mediaUrl
                                : null,
                            });

                            setActivePopup(null);
                          }}
                        >
                          Reply
                        </p>

                        <p
                          className="py-2 px-3 hover:bg-[#2e3a3f] hover:text-cyan-400 rounded-lg cursor-pointer transition-all bg-gray-800 mb-1 animate-fadeIn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(msg);
                            setActivePopup(null);
                          }}
                        >
                          Copy
                        </p>

                        <p
                          className="py-2 px-3 hover:bg-[#2e3a3f] hover:text-yellow-300 rounded-lg cursor-pointer transition-all bg-gray-800 mb-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStar(
                              msg._id,
                              msg.senderId === user._id
                                ? msg.receiverId
                                : msg.senderId
                            );
                            setActivePopup(null);
                          }}
                        >
                          Star
                        </p>

                        {(!msg.pinned || msg.pinnedBy === user._id) && (
                          <p
                            className="py-2 px-3 hover:bg-[#2e3a3f] hover:text-cyan-400 rounded-lg cursor-pointer transition-all bg-gray-800 mb-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePin(msg);
                              setActivePopup(null);
                            }}
                          >
                            {msg.pinned ? "Unpin" : "Pin"}
                          </p>
                        )}
                        {/* ★ Show 'Pin' when message is NOT pinned */}
                        {/* ⭐ If message is NOT pinned → show simple Pin */}

                        <p
                          className="py-2 px-3 text-red-400 hover:bg-[#2e3a3f] hover:text-red-300 rounded-lg cursor-pointer transition-all bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteForMe(msg._id);
                            setActivePopup(null);
                          }}
                        >
                          Delete for me
                        </p>
                      </div>
                    )}

                    {msg.reaction?.emoji && (
                      <div className="absolute -bottom-5 right-3 bg-gray-700 text-white px-2 py-0.5 rounded-full text-sm border border-gray-500 shadow-md">
                        {msg.reaction.emoji}
                      </div>
                    )}

                    {msg.pinned && (
                      <span className="absolute -top-3 left-2 text-yellow-300 text-xl">
                        📌
                      </span>
                    )}

                    {hoverPopup === msg._id && (
                      <div
                        className={`hover-popup-menu absolute top-1/2 -translate-y-1/2 flex items-center gap-2 
      ${msg.senderId === user._id ? "right-full mr-0" : "left-full ml-0"}
      bg-[#1e1e1e] px-3 py-1 rounded-full shadow-lg border border-gray-700
      z-[9999] animate-fadeIn
    `}
                        onMouseEnter={() => setHoverPopup(msg._id)} // popup par jao → open rakho
                        onMouseLeave={() => setHoverPopup(null)} // popup se niklo → band
                      >
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] cursor-pointer">
                          <span className="text-gray-300 text-xs">▼</span>
                        </div>

                        <div className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-500 hover:bg-[#3a3a3a] cursor-pointer">
                          <span className="text-lg">😊</span>
                        </div>
                      </div>
                    )}

                    {msg.senderId === user._id && (
                      <div className="absolute bottom-5 right-2 flex items-center gap-1 text-xs">
                        {/* ✔✔ READ → BLUE */}
                        {msg.read ? (
                          <span className="text-blue-500 font-bold">✔✔</span>
                        ) : /* ✔✔ DELIVERED → LIGHT GRAY */
                        msg.delivered ? (
                          <span className="text-gray-400 font-bold">✔✔</span>
                        ) : (
                          /* ✔ SENT → DARK GRAY */
                          <span className="text-gray-500 font-bold">✔</span>
                        )}
                      </div>
                    )}

                    <div className="absolute bottom-1 right-1 text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}

        <div ref={messagesEndRef} />
      </div>

      {/* FULLSCREEN IMAGE MODAL WITH SMOOTH FADE + ZOOM */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]
               transition-opacity duration-300 ease-out"
          onClick={closeFullImage}
        >
          <img
            src={fullscreenImage}
            alt="Full"
            onClick={(e) => e.stopPropagation()}
            onWheel={zoomWheel}
            style={{ transform: `scale(${zoom})` }}
            className="
        max-w-[90%] max-h-[90%]
        rounded-lg shadow-2xl cursor-zoom-in
        transform scale-90 opacity-0
        animate-profileZoom
        transition-all duration-300 ease-out
      "
          />
        </div>
      )}

      {/* Preview File UI */}
      {selectedFile && (
        <div className="absolute bottom-[80px] right-6 z-20">
          {selectedFile.type.startsWith("image") && (
            <img
              src={URL.createObjectURL(selectedFile)}
              className="rounded-xl max-h-44 border border-gray-600"
            />
          )}
          {selectedFile.type.startsWith("audio") && (
            <audio controls src={previewAudioUrl} className="w-[260px]" />
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={discardSelectedFile}
              className="bg-gray-600 text-white py-1 px-3 rounded-full text-sm"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              className="bg-cyan-700 text-white py-1 px-3 rounded-full text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {replyData && (
        <div
          className="
      w-full
      px-4
      py-3
      bg-[#1f2a33]
      border border-gray-600
      rounded-xl
      shadow-lg
      flex
      items-center
      justify-between
      z-50
    "
        >
          {/* <div className="flex-1"> */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              if (replyData?.id && messageRefs.current[replyData.id]) {
                messageRefs.current[replyData.id].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });

                // ⭐ highlight animation
                const el = messageRefs.current[replyData.id];
                el.classList.add("reply-highlight");
                setTimeout(() => el.classList.remove("reply-highlight"), 1200);
              }
            }}
          >
            <p className="text-cyan-300 text-sm font-semibold">
              {replyData.name}
            </p>
            <div className="flex items-center gap-2">
              {replyData.image && (
                <img
                  src={replyData.image}
                  className="h-10 w-10 rounded-md object-cover"
                />
              )}

              {replyData.video && (
                <p className="text-gray-300 text-sm">Video</p>
              )}

              {replyData.audio && (
                <p className="text-gray-300 text-sm">Audio</p>
              )}

              {!replyData.image && !replyData.video && !replyData.audio && (
                <p className="text-gray-300 text-sm truncate">
                  {replyData.message}
                </p>
              )}
            </div>
          </div>

          <XCircle
            size={24}
            className=" cursor-pointer hover:text-white ml-3"
            onClick={() => setReplyData(null)}
          />
        </div>
      )}

      {/* INPUT */}
      <div className="relative flex items-center gap-3 px-5 py-3  ">
        <div ref={emojiRef}>
          <Smile
            size={24}
            onClick={() => setShowEmojiPicker((p) => !p)}
            className=" cursor-pointer hover:scale-110"
          />
          {showEmojiPicker && (
            <div className="absolute bottom-[73px] left-0 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={
                  document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light"
                }
              />
            </div>
          )}
        </div>

        <Paperclip
          size={24}
          onClick={() => setShowAttachment((p) => !p)}
          className=" cursor-pointer hover:scale-110"
        />
        {showAttachment && (
          <AttachmentPopup
            onClose={() => setShowAttachment(false)}
            onSelect={handleFileSelect}
          />
        )}

        <input
          value={input}
          ref={inputRef}
          onChange={(e) => {
            setInput(e.target.value);

            socket.emit("typing", {
              senderId: user._id,
              receiverId: chat.id,
            });

            if (typingTimeout) clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
              socket.emit("stopTyping", {
                senderId: user._id,
                receiverId: chat.id,
              });
            }, 2500);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // New line ko rokta hai
              handleSend(); // ✅ Message send
            }
          }}
          placeholder="Type a message..."
          className="flex-1  rounded-full py-3 px-4 border-b border-black focus:outline-none dark:bg-black dark:text-white dark:border-b-white/50"
        />

        {input.trim() ? (
          <Send
            size={24}
            onClick={handleSend}
            className="text-cyan-600 cursor-pointer hover:scale-110 transition"
          />
        ) : status === "recording" ? (
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded-full text-xs"
          >
            Stop Recording
          </button>
        ) : (
          <Mic
            size={26}
            onClick={startRecording}
            className="cursor-pointer hover:scale-110 transition"
          />
        )}
      </div>
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#2f3b44] text-white px-4 py-2 rounded-lg shadow-xl z-[999999] animate-fadeIn">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
