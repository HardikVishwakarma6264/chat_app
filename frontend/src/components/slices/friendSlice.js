
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  incoming: [], // { id, senderId, name, image, status, createdAt }
  outgoing: {}, // { [userId]: 'pending' | 'accepted' | 'rejected' }
  accepted: {}, // { [userId]: { userId, name, image } }  -> quick lookup for accepted friends
  unreadCount: 0,
};

const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    // set incoming requests (initial load)
    setIncomingRequests(state, action) {
      state.incoming = action.payload;
      state.unreadCount = state.incoming.filter((r) => r.status === "pending").length;
    },

    // push a new incoming request (socket)
    addIncomingRequest(state, action) {
      state.incoming.unshift(action.payload);
      state.unreadCount = state.incoming.filter((r) => r.status === "pending").length;
    },

    // remove an incoming request (when accepted/rejected)
    removeIncomingRequest(state, action) {
      const id = action.payload;
      state.incoming = state.incoming.filter((r) => r.id !== id);
      state.unreadCount = state.incoming.filter((r) => r.status === "pending").length;
    },

    // update request status for an incoming request (called when receiver accepts/rejects)
    updateRequestStatus(state, action) {
      const { requestId, status } = action.payload;
      const found = state.incoming.find((r) => r.id === requestId);
      if (found) {
        found.status = status;
        // if accepted, move to accepted map
        if (status === "accepted") {
          state.accepted[found.senderId] = {
            userId: found.senderId,
            name: found.name,
            image: found.image,
          };
          // remove from incoming (we'll keep accepted list)
      
          state.incoming = state.incoming.filter((r) => r.id !== requestId);
        } else if (status === "rejected") {
          // rejected -> remove incoming
          state.incoming = state.incoming.filter((r) => r.id !== requestId);
        }
      }
      state.unreadCount = state.incoming.filter((r) => r.status === "pending").length;
    },

    // set outgoing statuses on load
    setOutgoingStatus(state, action) {
      const { userId, status } = action.payload;
      state.outgoing[userId] = status;
      if (status === "accepted") {
        // put into accepted map too
        state.accepted[userId] = {
          userId,
          name: state.accepted[userId]?.name || null,
          image: state.accepted[userId]?.image || null,
        };
      }
    },

    


    // set outgoing multiple (for initial load)
    setOutgoingBulk(state, action) {
      const arr = action.payload || [];
      arr.forEach((o) => {
        state.outgoing[o.userId] = o.status;
        if (o.status === "accepted") {
          state.accepted[o.userId] = {
            userId: o.userId,
            name: o.name,
            image: o.image,
          };
        }
      });
    },

    // explicit add accepted (useful when receiver accepts and server notifies)
    addAccepted(state, action) {
      const { userId, name, image } = action.payload;
      state.accepted[userId] = { userId, name, image };
      // ensure outgoing marked accepted if present
      state.outgoing[userId] = "accepted";
      // remove pending incoming/outgoing where applicable
      state.incoming = state.incoming.filter((r) => r.senderId !== userId);
      state.unreadCount = state.incoming.filter((r) => r.status === "pending").length;
    },
  },
});

export const {
  setIncomingRequests,
  addIncomingRequest,
  removeIncomingRequest,
  updateRequestStatus,
  setOutgoingStatus,
  setOutgoingBulk,
  addAccepted,
  
} = friendSlice.actions;

export default friendSlice.reducer;
