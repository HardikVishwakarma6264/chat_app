import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import chatReducer from "../slices/chatSlice";
import friendReducer from "../slices/friendSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  friend: friendReducer,
});

export default rootReducer;