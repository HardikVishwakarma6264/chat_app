import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOtherUsers,
  setSelectedChat,
  updateLastMessage,
  resetUnread,
} from "../slices/chatSlice";
import {
  setIncomingRequests,
  addIncomingRequest,
  updateRequestStatus,
  setOutgoingStatus,
  setOutgoingBulk,
  addAccepted,
  removeIncomingRequest,
} from "../slices/friendSlice";
import Sidebar from "../pages/Sidebar";
import ChatWindow from "../pages/ChatWindow";
import LeftNavBar from "../pages/LeftNavBar";
import {
  getUserConversations,
  getIncomingRequestsAPI,
  getOutgoingRequestsAPI,
  respondToRequestAPI,
  getAcceptedFriendsAPI,
  createOrFetchConversationAPI,
} from "../services/operation/authapi";
import { io } from "socket.io-client";
import loo from "../images/logo-removebg-preview.png";
import { Bell,MoreVertical } from "lucide-react";
import ArchivePanel from "../left_extra_work/ArchivePanel";
import CallsPanel from "../left_extra_work/CallsPanel";

function Home() {
  const dispatch = useDispatch();
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBellGuide, setShowBellGuide] = useState(false);

  const [activePanel, setActivePanel] = useState("chats");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState("chats");
  // ⭐ Fullscreen Image Viewer
  const [fullImage, setFullImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [lastDistance, setLastDistance] = useState(null);

  const [theme, setTheme] = useState(
    localStorage.getItem("appTheme") || "system"
  );

  // ⭐ APPLY THEME TO ENTIRE APP REAL-TIME
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === "light") {
      root.classList.remove("dark");
      body.classList.remove("dark");
    } else if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (prefersDark) {
        root.classList.add("dark");
        body.classList.add("dark");
      } else {
        root.classList.remove("dark");
        body.classList.remove("dark");
      }
    }

    localStorage.setItem("appTheme", theme);
  }, [theme]);

  const bellRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifications(false); // ⭐ CLOSE POPUP
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        // Laptop / Tablet → always show both
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [chatWallpaper, setChatWallpaper] = useState(
    localStorage.getItem("chatWallpaper") || "#060606"
  );

  useEffect(() => {
    // force re-render when wallpaper updates
  }, [chatWallpaper]);

  const handleSelectPanel = (panel) => {
    setActivePanel(panel); // chats / calls / archive / settings
  };

  // Conversations loaded from backend (existing conversations)
  const chats = useSelector((state) => state.chat.otherUsers || []);
  const friendIncoming = useSelector((state) => state.friend.incoming || []);
  const friendUnreadCount = useSelector(
    (state) => state.friend.unreadCount || 0
  );
  const { user } = useSelector((state) => state.auth || {});
  const acceptedMap = useSelector((state) => state.friend.accepted || {});

  //
  // --- NEW: merge accepted friends into chats so friends appear in sidebar
  //
  // acceptedMap structure: { [userId]: { userId, name, image } }
  const acceptedListFromMap = Object.values(acceptedMap || []);

  // Build list of accepted friends missing from chats
  const missingAcceptedAsChats = acceptedListFromMap
    .filter((a) => {
      // ensure we have userId and their id is not already in chats
      if (!a || !a.userId) return false;
      return !chats.some((c) => String(c.id) === String(a.userId));
    })
    .map((a) => ({
      id: String(a.userId),
      name: a.name || "Unknown",
      image: a.image || null,
      lastMessage: "No messages yet",
      time: null,
      conversationId: null,
      unread: 0,
    }));

  // Combined: existing conversations + missing accepted friends
  const combinedChats = [...chats, ...missingAcceptedAsChats];

  // Final: Only show users who are accepted friends (filter using acceptedMap)
  const filteredChats = combinedChats.filter(
    (c) => !!acceptedMap[String(c.id)]
  );

  // Always sort by latest message time (descending)
  const sortedFilteredChats = [...filteredChats].sort((a, b) => {
    const t1 = a.time ? new Date(a.time).getTime() : 0;
    const t2 = b.time ? new Date(b.time).getTime() : 0;
    return t2 - t1;
  });

  useEffect(() => {
    const seen = localStorage.getItem("seenBellHint");
    if (!seen) {
      setShowBellGuide(true);
    }
  }, []);

  const handleBellGotIt = () => {
    localStorage.setItem("seenBellHint", "true");
    setShowBellGuide(false);
  };

  // splash
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // load incoming friend requests
  useEffect(() => {
    async function loadIncoming() {
      const requests = await getIncomingRequestsAPI();
      dispatch(setIncomingRequests(requests || []));

      // If backend returned accepted ones in incoming list (rare), add to accepted map
      (requests || []).forEach((req) => {
        if (req.status === "accepted") {
          dispatch(
            addAccepted({
              userId: req.senderId,
              name: req.name,
              image: req.image,
            })
          );
        }
      });
    }
    loadIncoming();
  }, [dispatch]);

  // initial accepted friends load
  useEffect(() => {
    async function loadAccepted() {
      const friends = await getAcceptedFriendsAPI();
      (friends || []).forEach((f) => {
        dispatch(
          addAccepted({
            userId: f.userId,
            name: f.name,
            image: f.image,
          })
        );
      });
    }
    loadAccepted();
  }, [dispatch]);

  // load outgoing (so "pending/accepted" persists)
  useEffect(() => {
    async function loadOutgoing() {
      try {
        const outgoing = await getOutgoingRequestsAPI();

        dispatch(setOutgoingBulk(outgoing || []));
        // If any outgoing are accepted, add to accepted map
        (outgoing || []).forEach((req) => {
          if (req.status === "accepted") {
            dispatch(
              addAccepted({
                userId: req.userId,
                name: req.name,
                image: req.image,
              })
            );
          }
        });
      } catch (err) {
        console.error("Failed to load outgoing", err);
      }
    }
    loadOutgoing();
  }, [dispatch]);

  // socket init
  useEffect(() => {
    // const s = io("http://localhost:4001", { transports: ["websocket"] });
    // const s = io("http://localhost:4001", {
    const s = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

    setSocket(s);

    if (user?._id || user?.id) {
      s.emit("joinChat", user._id || user.id);
    }

    // new incoming friend request (for current user)
    s.on("friend-request", (req) => {
      dispatch(
        addIncomingRequest({
          id: req.requestId || req.id || req._id,
          senderId: req.senderId,
          name: req.name,
          image: req.image,
          status: req.status,
          createdAt: req.createdAt,
        })
      );
    });

    s.on("messages-read", ({ chatWith }) => {
      dispatch(resetUnread(String(chatWith)));
    });

    s.on("receiveReaction", (data) => {
      const { messageId, emoji, userId, receiverId, senderId } = data;

      const otherId = userId === (user._id || user.id) ? receiverId : senderId;

      dispatch(
        updateLastMessage({
          chatId: otherId,
          message: `Reacted ${emoji}`,
          time: new Date(),
          isOwnMessage: false,
          isChatOpen: selectedChatId === otherId,
        })
      );
    });

    // request updated (accepted/rejected) — server sends to both involved
    s.on("friend-request-updated", (payload) => {
      // If this user was receiver and sees update, update incoming
      if (payload.forReceiverId === (user._id || user.id)) {
        dispatch(
          updateRequestStatus({ requestId: payload.id, status: payload.status })
        );
      }

      // If payload indicates acceptance, add to accepted map (both sides may need it)
      if (payload.status === "accepted") {
        // If payload includes receiver info (receiver is friend now)
        if (payload.receiverId) {
          dispatch(
            addAccepted({
              userId: payload.receiverId,
              name: payload.receiverName,
              image: payload.receiverImage,
            })
          );
        }

        // If payload informs a sender about acceptance
        if (payload.forSenderId === (user._id || user.id)) {
          dispatch(
            setOutgoingStatus({
              userId: payload.receiverId,
              status: payload.status,
            })
          );
          dispatch(
            addAccepted({
              userId: payload.receiverId,
              name: payload.receiverName,
              image: payload.receiverImage,
            })
          );
        }
      }

      // Also handle case for sender side where forSenderId matches current user
      if (
        payload.forSenderId === (user._id || user.id) &&
        payload.status !== "accepted"
      ) {
        dispatch(
          setOutgoingStatus({
            userId: payload.receiverId,
            status: payload.status,
          })
        );
      }
    });

    s.on("messageUpdated", (data) => {
      const otherUserId =
        data.senderId === (user._id || user.id)
          ? data.receiverId
          : data.senderId;

      const isOwn = data.senderId === (user._id || user.id);

      // 🛑 If message is OWN → unread mat badhao, just update text
      dispatch(
        updateLastMessage({
          chatId: otherUserId,
          message: data.lastMessage,
          time: data.lastMessageTime,
          isOwnMessage: isOwn,
          isChatOpen: selectedChatId === otherUserId,
          noUnread: true, // <-- unread ko update mat karo
        })
      );
    });

    return () => s.disconnect();
  }, [dispatch, user, selectedChatId]);

  // load conversations
  useEffect(() => {
    async function loadConvos() {
      const convos = await getUserConversations();
      const mapped = (convos || []).map((c) => {
        const other = c.participants.find(
          (p) => p._id !== (user._id || user.id)
        );
        const fullName = `${other?.firstname || ""} ${
          other?.lastname || ""
        }`.trim();
        return {
          id: other?._id || other?.id,
          name: fullName || "Unknown",
          image: other?.image || null,
          lastMessage: c.lastMessage || "",
          time: c.lastMessageTime || c.updatedAt || null,
          conversationId: c._id,
          unread: c.unreadCount || 0,
        };
      });

      // store conversations in redux
      dispatch(setOtherUsers(mapped));
      setLoading(false);
    }
    loadConvos();
  }, [dispatch, user]);

  useEffect(() => {
    if (zoom === 1) {
      setOffsetX(0);
      setOffsetY(0);
    }
  }, [zoom]);

  useEffect(() => {
    if (zoom === 1) {
      setTimeout(() => {
        setOffsetX(0);
        setOffsetY(0);
      }, 50);
    }
  }, [zoom]);

  const handleSelectChat = async (id) => {
    setSelectedChatId(id);
    dispatch(setSelectedChat(id));
    dispatch(resetUnread(id));

    if (isMobile) setShowSidebar(false);

    // Create conversation if missing
    const res = await createOrFetchConversationAPI(id);

    if (socket) {
      socket.emit("mark-messages-read", {
        userId: user._id || user.id,
        otherUserId: id,
      });
    }

    if (res?.success) {
      const conv = res.conversation;

      // 1️⃣ Purana chat object dhoondo
      const existing = chats.find((c) => String(c.id) === String(conv.userId));

      // 2️⃣ Agar chat pehle se exist kare → lastMessage KI JAGAH KOI CHANGE NAHI KARNA
      const updatedChat = existing
        ? {
            ...existing,
            name: conv.name,
            image: conv.image,
            conversationId: conv.id,
          }
        : {
            // New chat — last message blank hi rakho but reset mat karo
            id: conv.userId,
            name: conv.name,
            image: conv.image,
            lastMessage: "",
            time: null,
            conversationId: conv.id,
            unread: 0,
          };

      // 3️⃣ Is chat ko list me sahi jagah insert karo
      const newList = chats.map((c) =>
        String(c.id) === String(conv.userId)
          ? {
              ...c,
              name: conv.name,
              image: conv.image,
              conversationId: conv.id,
            }
          : c
      );

      dispatch(setOtherUsers(newList));
    }
  };

  // selectedChat should come from combinedChats (convos + accepted friends)
  const selectedChat =
    combinedChats.find((c) => String(c.id) === String(selectedChatId)) || null;

  // handle accept/reject from notification dropdown (receiver side)
  async function handleRespond(requestId, action) {
    try {
      const res = await respondToRequestAPI(requestId, action);
      if (res?.success) {
        // update incoming
        dispatch(
          updateRequestStatus({ requestId, status: res.request.status })
        );

        // notify sender through socket
        if (socket) {
          socket.emit("friend-request-response", {
            toUserId: res.request.senderId,
            response: {
              id: requestId,
              status: res.request.status,
              forSenderId: res.request.senderId,
              name: res.request.name,
              image: res.request.image,
            },
          });
        }

        // if accepted, add accepted to map (the reducer also does this in updateRequestStatus but keep parity)
        if (res.request.status === "accepted") {
          dispatch(
            addAccepted({
              userId: res.request.senderId,
              name: res.request.name,
              image: res.request.image,
            })
          );
        }
      }
    } catch (err) {
      console.error("Respond error", err);
    }
  }

  if (showSplash)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#060606]">
        <img
          src={loo}
          alt="Samvaad Logo"
          className="h-[250px] w-[250px] animate-bounce"
        />
        <p className="text-gray-400 mt-4 text-lg tracking-wide animate-pulse">
          Loading Samvaad...
        </p>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#060606]">
        <img src={loo} alt="Loading..." className="h-[200px] w-[200px]" />
      </div>
    );

  return (
    <div
      className="flex flex-col h-[100dvh] overflow-hidden
    bg-white text-black
    dark:bg-[#0d0d0d] dark:text-white
    transition-colors duration-300"
    >
      {/* ⭐ FULLSCREEN IMAGE VIEWER ⭐ */}
      {/* ⭐ FULLSCREEN IMAGE VIEWER WITH FADE + ZOOM ANIMATION ⭐ */}
      {fullImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]
               transition-opacity duration-300 ease-out"
          onClick={() => setFullImage(null)}
        >
          {/* CLOSE BUTTON */}
          <button
            className="absolute top-5 right-5 text-3xl font-bold z-[10000]
                 bg-gray-800 bg-opacity-60 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => setFullImage(null)}
          >
            ✕
          </button>

          <img
            src={fullImage}
            className="
        select-none
        transform scale-90 opacity-0
        animate-profileZoom
        transition-all duration-300 ease-out
      "
            style={{
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              cursor: zoom > 1 ? "grab" : "zoom-in",
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()} // prevent close
            onWheel={(e) => {
              e.preventDefault();
              const scaleAmount = e.deltaY < 0 ? 0.15 : -0.15;
              const newZoom = Math.min(Math.max(zoom + scaleAmount, 1), 6);

              const rect = e.currentTarget.getBoundingClientRect();
              const mouseX = e.clientX - rect.left - rect.width / 2;
              const mouseY = e.clientY - rect.top - rect.height / 2;

              setOffsetX(offsetX - mouseX * scaleAmount);
              setOffsetY(offsetY - mouseY * scaleAmount);

              setZoom(newZoom);
            }}
            onMouseDown={(e) => {
              if (zoom === 1) return;
              setIsDragging(true);
              setStartX(e.clientX - offsetX);
              setStartY(e.clientY - offsetY);
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              setOffsetX(e.clientX - startX);
              setOffsetY(e.clientY - startY);
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                setLastDistance(Math.sqrt(dx * dx + dy * dy));
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1 && zoom > 1) {
                const touch = e.touches[0];
                setOffsetX(touch.clientX - startX);
                setOffsetY(touch.clientY - startY);
              }

              if (e.touches.length === 2) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastDistance) {
                  const zoomChange = (distance - lastDistance) / 200;
                  setZoom((z) => Math.min(Math.max(z + zoomChange, 1), 6));
                }

                setLastDistance(distance);
              }
            }}
            onTouchEnd={() => setLastDistance(null)}
          />
        </div>
      )}

      {/* FIRST TIME BELL GUIDE POPUP */}
      {showBellGuide && (
        <div className="absolute right-1 top-[52px] bg-white text-black p-3 rounded-lg shadow-xl w-64 z-50 ">
          <p className="text-sm font-semibold">
            Here you will receive{" "}
            <span className="text-cyan-600">friend requests </span>& other
            important notifications.
          </p>

          <button
            onClick={handleBellGotIt}
            className="mt-3 w-full bg-cyan-600 text-white py-1 rounded-md"
          >
            Got it
          </button>

          {/* Arrow */}
          <div className="absolute -top-2 right-6 w-3 h-3 bg-white rotate-45"></div>
        </div>
      )}

      {/* Top Bar */}
      <div
        className="flex-none w-full h-12 md:h-15 flex items-center justify-between
    bg-gray-100 text-black
    dark:bg-[#1d1c1c] dark:text-white
    transition-colors duration-300 "
      >
        <div className="flex items-center gap-1 ">
          <img
            src={loo}
            alt="Samvaad Logo"
            className=" h-9 w-9 md:h-[55px] md:w-[55px] mt-1  logo-glow"
          />
          <span className="text-lg  md:text-xl font-semibold">Samvaad</span>
        </div>

        {/* Bell Notification Button */}

        <div className="relative" ref={bellRef}>
          <button
            className="p-2 rounded-full hover:scale-105 hover:font-semibold transition relative"
            onClick={() => setShowNotifications((s) => !s)}
          >
            <Bell size={24} className=" mr-2" />
            {friendUnreadCount > 0 && (
              <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {friendUnreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}

          {showNotifications && (
            <div className="absolute right-0 mt-1 z-50">
              {/* ✅ OUTSIDE DIAMOND — ONLY THIS WILL SHOW */}
              <div
                className="absolute -top-2 right-6 w-4 h-4 
                 bg-white dark:bg-black 
                 border-l border-t border-black dark:border-white
                 rotate-45 z-50"
              ></div>

              {/* ✅ POPUP BOX — overflow-hidden so inside diamond is CUT */}
              <div
                className="w-80 bg-white text-black dark:bg-black dark:text-white 
                    rounded-md shadow-lg overflow-hidden
                    border border-black dark:border-white"
              >
                <div className="p-3 border-b border-black dark:border-white">
                  <h4 className="font-semibold flex items-center justify-center">
                    Friend Requests
                  </h4>
                </div>

                {friendIncoming.length === 0 ? (
                  <div className="p-3 text-sm flex items-center justify-center">
                    No requests
                  </div>
                ) : (
                  friendIncoming.map((req) => (
                    <div key={req.id} className="flex flex-col p-2 border-b">
                      <div className="flex items-center">
                        <div className="w-[30%]">
                          <img
                            src={req.image}
                            alt={req.name}
                            className="w-20 h-20 rounded-full object-cover shadow-2xl cursor-pointer"
                            onClick={() => {
                              setZoom(1);
                              setFullImage(req.image);
                            }}
                          />
                        </div>

                        <div className="flex flex-col w-[70%]">
                          <div className="font-semibold text-xl ml-6">
                            {req.name}
                          </div>

                          <div className="flex items-start gap-4 justify-center mt-2">
                            <button
                              onClick={() => handleRespond(req.id, "accept")}
                              className="px-5 py-1 hover:bg-cyan-400 bg-cyan-500 text-white rounded"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() => handleRespond(req.id, "reject")}
                              className="px-5 py-1 hover:bg-gray-300 bg-gray-400 text-black rounded"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

           {isMobile && (
    <button
      className="p-2 rounded-full hover:scale-105 transition"
      onClick={() => setLeftMenuOpen(true)}
    >
      <MoreVertical size={22} />
    </button>
  )}
        </div>








      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={` ${isMobile ? "hidden" : "flex-none h-full w-14"}`}>
          <LeftNavBar
            onSelectPanel={handleSelectPanel}
            setChatWallpaper={setChatWallpaper}
            isMenuOpen={leftMenuOpen}
            setIsMenuOpen={setLeftMenuOpen}
            isMobile={isMobile}
            setTheme={setTheme}
          />
        </div>

        {/* ⭐ MOBILE DRAWER VERSION */}
        {isMobile && leftMenuOpen && (
          <LeftNavBar
            onSelectPanel={handleSelectPanel}
            setChatWallpaper={setChatWallpaper}
            isMenuOpen={leftMenuOpen}
            setIsMenuOpen={setLeftMenuOpen}
            isMobile={isMobile}
            setTheme={setTheme}
          />
        )}

        <div className="flex flex-1 overflow-hidden ">
          {activePanel === "chats" && showSidebar && (
            // <div
            //   className={`flex-none ${
            //     isMobile
            //       ? "w-full"
            //       : "w-[30%] min-w-[300px] max-w-[420px] rounded-2xl shadow-xl"
            //   } flex flex-col  `}
            // >
            <div
  className={`
    flex-none
    ${isMobile ? "w-full h-full" : "w-[30%] min-w-[300px] max-w-[420px]"}
    flex flex-col rounded-2xl shadow-xl
    overflow-hidden   /* 🔥 VERY IMPORTANT */
  `}
>

              <Sidebar
                chats={sortedFilteredChats}
                acceptedMap={acceptedMap}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                socket={socket}
                isMobile={isMobile} // ⭐ ADD
                setLeftMenuOpen={setLeftMenuOpen} // ⭐ ADD
              />
            </div>
          )}

          {activePanel === "archive" && (
            <div
              className={`
       
      ${
        isMobile
          ? "w-full min-w-full max-w-full" // ⭐ MOBILE FULL WIDTH
          : "w-[30%] min-w-[300px] max-w-[420px]" // ⭐ DESKTOP FIXED LIKE CHAT SIDEBAR
      }
    `}
            >
              <ArchivePanel
                onBack={() => setLeftMenuOpen(true)}
                isMobile={isMobile}
              />
            </div>
          )}

          {activePanel === "calls" && (
            <div
              className={`
      
      ${
        isMobile
          ? "w-full min-w-full max-w-full" // ⭐ MOBILE FULL WIDTH
          : "w-[30%] min-w-[300px] max-w-[420px]" // ⭐ DESKTOP FIXED LIKE CHAT SIDEBAR
      }
    `}
            >
              <CallsPanel
                onBack={() => setLeftMenuOpen(true)}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Chat Window */}

          {(!isMobile || !showSidebar) && (
            <div className="flex-1 flex flex-col">
              <ChatWindow
                chat={selectedChat}
                wallpaperColor={chatWallpaper}
                socket={socket}
                isMobile={isMobile}
                setShowSidebar={setShowSidebar}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
