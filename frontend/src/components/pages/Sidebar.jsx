import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  MoreVertical,
  CircleUser,
  File,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import {
  getotherfriend,
  sendFriendRequestAPI,
} from "../services/operation/authapi";
import { useDispatch, useSelector } from "react-redux";
import { setOutgoingStatus } from "../slices/friendSlice";
import Popup from "./Popup";
import { resetUnread } from "../slices/chatSlice";

const ChatListItem = ({ chat, isSelected, onSelect, highlight }) => {
  const formatSidebarTime = (date) => {
    const d = new Date(date);
    const today = new Date();

    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isToday)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString([], { day: "2-digit", month: "short" });
  };
  const renderLastMessage = () => {
    if (!chat.lastMessage)
      return <span className="text-gray-500 text-sm">No messages yet</span>;

    if (chat.lastMessage.includes("Image"))
      return (
        <span className="flex items-center text-sm text-gray-400 truncate">
          <ImageIcon size={14} className="mr-1" /> Image
        </span>
      );

    if (chat.lastMessage.includes("Pinned"))
      return (
        <span className="flex items-center text-sm text-cyan-300 truncate">
          📌 Pinned Message
        </span>
      );

    if (chat.lastMessage.includes("⭐")) {
      return (
        <span className="flex items-center text-sm text-yellow-400 truncate">
          ⭐ Starred Message
        </span>
      );
    }

    if (chat.lastMessage.includes("File"))
      return (
        <span className="flex items-center text-sm text-gray-400 truncate">
          <File size={14} className="mr-1" /> {chat.lastMessage}
        </span>
      );

    return (
      <span className="text-sm text-gray-400 truncate">{chat.lastMessage}</span>
    );
  };

  return (
    <div
      onClick={() => onSelect(chat.id)}
      className={`flex items-center p-4 cursor-pointer   transition-colors rounded-2xl
  ${
    isSelected
      ? "bg-gray-300 dark:bg-gray-800"
      : "hover:bg-gray-200 dark:hover:bg-gray-700"
  }
  ${highlight ? "bg-cyan-800" : ""}  // <<--- Highlight color
`}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex items-center justify-center">
        {chat.image ? (
          <img
            src={chat.image}
            alt={chat.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <CircleUser size={28} className="text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold truncate">{chat.name}</p>

          {chat.time && (
            <p className="text-xs ">{formatSidebarTime(chat.time)}</p>
          )}
        </div>

        <div className="flex justify-between items-centre mt-0.5">
          {/* {renderLastMessage()} */}
          {chat.isTyping ? (
            <span className="text-cyan-400 text-sm">typing...</span>
          ) : (
            renderLastMessage()
          )}

          {chat.unread > 0 && (
            <span className="text-xs bg-whatsapp-teal text-black rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  chats,
  selectedChatId,
  onSelectChat,
  socket,
  isMobile,
  setLeftMenuOpen,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [otherUsers, setOtherUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("friends");

  const dispatch = useDispatch();
  const outgoing = useSelector((s) => s.friend.outgoing || {});
  const incoming = useSelector((s) => s.friend.incoming || []);
  const acceptedMap = useSelector((s) => s.friend.accepted || {});
  const [firstTimePopup, setFirstTimePopup] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarChats, setSidebarChats] = useState(chats);
  const [showThreeDotGuide, setShowThreeDotGuide] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
  // Sirf laptop / desktop par autofocus
  if (window.innerWidth > 768) {
    inputRef.current?.focus();
  }
}, []);


  useEffect(() => {
    const hasSeenThreeDot = localStorage.getItem("seenThreeDotHint");

    // ✔️ Sirf mobile par hi show karo
    const isMobileScreen = window.innerWidth <= 768;

    if (!hasSeenThreeDot && isMobileScreen) {
      setShowThreeDotGuide(true);
    }
  }, []);

  // Sync sidebar chats with Redux chats
  useEffect(() => {
    setSidebarChats(chats);
  }, [chats]);

  // 🔥 TYPING INDICATOR SOCKET LISTENERS
  useEffect(() => {
    if (!socket) return;

    // user is typing...
    socket.on("typing", ({ senderId }) => {
      setSidebarChats((prev) =>
        prev.map((chat) =>
          chat.id === senderId ? { ...chat, isTyping: true } : chat
        )
      );
    });

    socket.on("stopTyping", ({ senderId }) => {
      setSidebarChats((prev) =>
        prev.map((chat) =>
          chat.id === senderId ? { ...chat, isTyping: false } : chat
        )
      );
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket]);

  const acceptedFriendChats = chats.filter(
    (c) => acceptedMap[c.id] // only accepted friends
  );

  {
    acceptedFriendChats.map((c) => (
      <ChatListItem
        key={c.id}
        chat={c}
        isSelected={c.id === selectedChatId}
        onSelect={onSelectChat}
      />
    ));
  }

  const handleSelectChat = (chatId) => {
    dispatch(resetUnread(chatId)); // unread reset
    onSelectChat(chatId);

    if (isMobile) setLeftMenuOpen(false);
    // chat open
  };

  // Fetch users
  useEffect(() => {
    if (showPopup) {
      fetchOtherUsers();
      setActiveTab("friends");
    }
  }, [showPopup]);

  useEffect(() => {
    const hasSeen = localStorage.getItem("seenAddFriendHint");
    if (!hasSeen) {
      setFirstTimePopup(true);
    }
  }, []);

  const handleGotIt = () => {
    localStorage.setItem("seenAddFriendHint", "true");
    setFirstTimePopup(false);
  };

  // Update UI when redux changes
  useEffect(() => {
    setOtherUsers((prev) =>
      prev.map((u) => ({
        ...u,
        status: outgoing[u.id] || (acceptedMap[u.id] ? "accepted" : null),
      }))
    );
  }, [outgoing, acceptedMap]);

  async function fetchOtherUsers() {
    const users = await getotherfriend();
    if (users) {
      const mapped = users.map((u) => ({
        ...u,
        status: outgoing[u.id] || (acceptedMap[u.id] ? "accepted" : null),
      }));
      setOtherUsers(mapped);
    }
  }

  // 🟢 FRIEND TAB → Only users with no status
  const friendsList = otherUsers.filter(
    (u) =>
      !outgoing[u.id] &&
      !incoming.some((req) => req.senderId === u.id) &&
      !acceptedMap[u.id]
  );

  // 🟡 REQUEST TAB → Incoming + Outgoing(pending)
  const outgoingPending = Object.entries(outgoing)
    .filter(([_, st]) => st === "pending")
    .map(([uid]) => {
      const u = otherUsers.find((x) => x.id === uid);
      return u ? { ...u, requestType: "outgoing" } : null;
    })
    .filter(Boolean);

  const requestsList = [
    ...incoming.map((r) => ({ ...r, requestType: "incoming" })),
    ...outgoingPending,
  ];

  // 🟢 ACCEPTED TAB
  const acceptedList = Object.values(acceptedMap);

  async function handleSendRequest(userId) {
    try {
      if (outgoing[userId] === "pending" || outgoing[userId] === "accepted")
        return;

      const res = await sendFriendRequestAPI(userId);
      if (res?.success) {
        dispatch(setOutgoingStatus({ userId, status: "pending" }));

        setOtherUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "pending" } : u))
        );

        if (socket) {
          socket.emit("send-friend-request", {
            toUserId: userId,
            request: {
              id: res.request._id,
              senderId: res.request.sender._id,
              name: `${res.request.sender.firstname} ${res.request.sender.lastname}`,
              image: res.request.sender.image,
              status: res.request.status,
              createdAt: res.request.createdAt,
            },
          });
        }
      }
    } catch (e) {
      console.log("Send error:", e);
    }
  }

  // let filteredChats = acceptedFriendChats;
  let filteredChats = sidebarChats;

  if (isSearching) {
    const searchLower = searchText.toLowerCase();

    filteredChats = [
      // TOP: Chat name matches
      ...acceptedFriendChats.filter((c) =>
        c.name.toLowerCase().includes(searchLower)
      ),

      // BELOW: Non-matching chats
      ...acceptedFriendChats.filter(
        (c) => !c.name.toLowerCase().includes(searchLower)
      ),
    ];
  }

  return (
    <div className="relative h-full flex overflow-hidden flex-col shadow-xl ">
      {/* FIRST TIME POPUP */}
      {firstTimePopup && (
        <div className="absolute bottom-24 right-4 bg-white text-black p-4 rounded-lg shadow-xl w-52  z-50">
          <p className="text-sm font-semibold">
            Click the <span className="text-cyan-600 text-lg">+</span> button to
            add friends and start chatting.
          </p>

          <button
            onClick={handleGotIt}
            className="mt-3 w-full bg-cyan-600 text-white py-1 rounded-md"
          >
            Got it
          </button>

          {/* Arrow pointing to + button */}
          <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white rotate-45"></div>
        </div>
      )}

      {/* {showThreeDotGuide && ( */}
      {showThreeDotGuide && window.innerWidth <= 768 && (
        <div className="absolute top-[50px] right-1 bg-white text-black p-4 rounded-lg shadow-xl w-64 z-50">
          <p className="text-sm font-semibold">
            Manage your account settings & advanced features from this menu.
          </p>

          <button
            onClick={() => {
              localStorage.setItem("seenThreeDotHint", "true");
              setShowThreeDotGuide(false);
            }}
            className="mt-3 w-full bg-cyan-600 text-white py-1 rounded-md"
          >
            Got it
          </button>
          {/* Arrow below popup */}
          <div className="absolute -top-2 right-3 w-3 h-3 bg-white rotate-45"></div>
        </div>
      )}

      {/* Header */}
      {/* <div className="flex items-center justify-between p-3    min-h-[55px]">
        <h2 className="text-2xl font-semibold ">Chats</h2>

        <MoreVertical
          size={20}
          className=" cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            if (showThreeDotGuide) return;

            if (isMobile) {
              setLeftMenuOpen((prev) => !prev);
            } else {
              // 👉 LAPTOP/TABLET: normal popup open karo
              setShowPopup(true);
            }
          }}
        />
      </div> */}

      {/* HEADER — ONLY DESKTOP */}
{!isMobile && (
  <div className="flex items-center justify-between p-3 min-h-[55px]">
    <h2 className="text-2xl font-semibold">Chats</h2>

    <MoreVertical
      size={20}
      className="cursor-pointer hover:scale-105 transition-transform"
      onClick={() => setShowPopup(true)}
    />
  </div>
)}


      {/* Search */}
      <div className="relative">
        <input
          type="text"
          ref={inputRef}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsSearching(e.target.value.length > 0);
          }}
          placeholder="Search or start a new chat"
          className="
      w-full 
      py-3 
      pl-10 
      pr-10
      rounded-2xl 
       dark:bg-black
      text-sm
      dark:text-white
      outline-none
      border-b 
      border-black
      dark:border-white
      focus:border-cyan-500
      transition-all
      duration-200
    "
        />

        <Search
          size={16}
          className="absolute left-3 text-black top-1/2 -translate-y-1/2 "
        />

        {isSearching && (
          <button
            onClick={() => {
              setSearchText("");
              setIsSearching(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2  hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto flex-1 overscroll-none ">
        {filteredChats.length > 0 ? (
          filteredChats.map((c) => {
            const isMatch =
              isSearching &&
              c.name.toLowerCase().includes(searchText.toLowerCase());

            return (
              <ChatListItem
                key={c.id}
                chat={c}
                isSelected={c.id === selectedChatId}
                onSelect={handleSelectChat}
                highlight={isMatch} // <<--- highlight added
              />
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full  text-sm">
            Loading chats...
          </div>
        )}
      </div>

      {/* Add Friend Button */}
      <button
        onClick={() => setShowPopup(true)}
        className="absolute bottom-10 right-6 w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg"
      >
        <Plus size={26} className="text-white" />
      </button>

      {/* POPUP */}
      {showPopup && (
        <Popup
          friendsList={friendsList}
          requestsList={requestsList}
          acceptedList={acceptedList}
          handleSendRequest={handleSendRequest}
          setShowPopup={setShowPopup}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
};

export default Sidebar;
