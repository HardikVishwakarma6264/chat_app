import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  otherUsers: [], // { id, name, image, lastMessage, time, unread }
  selectedChat: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },

    // ✅ Update last message and unread logic
    updateLastMessage: (state, action) => {
      const { chatId, message, time, isOwnMessage, isChatOpen } =
        action.payload;
      const chat = state.otherUsers.find(
        (c) => c.id === chatId || c._id === chatId
      );

      if (chat) {
        chat.lastMessage = message;
        chat.time = time || new Date().toISOString();

        // ✅ unread logic
        // if (!isOwnMessage && !isChatOpen) {
        //   chat.unread = (chat.unread || 0) + 1;
        // }
        if (!action.payload.noUnread) {
          if (!isOwnMessage && !isChatOpen) {
            chat.unread = (chat.unread || 0) + 1;
          } else if (isChatOpen) {
            chat.unread = 0;
          }
        } else if (isChatOpen) {
          chat.unread = 0;
        }

        // move to top
        state.otherUsers = [
          chat,
          ...state.otherUsers.filter(
            (c) => c.id !== chatId && c._id !== chatId
          ),
        ];
      } else {
        state.otherUsers.unshift({
          id: chatId,
          name: "Unknown",
          image: null,
          lastMessage: message,
          time,
          unread: !isOwnMessage && !isChatOpen ? 1 : 0,
        });
      }
    },

    // ✅ reset unread when chat opened
    resetUnread: (state, action) => {
      const chatId = action.payload;
      const chat = state.otherUsers.find(
        (c) => c.id === chatId || c._id === chatId
      );
      if (chat) chat.unread = 0;
    },
  },
});

export const {
  setOtherUsers,
  setSelectedChat,
  updateLastMessage,
  resetUnread,
} = chatSlice.actions;

export default chatSlice.reducer;
