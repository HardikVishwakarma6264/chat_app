import { createSlice } from "@reduxjs/toolkit";

function safeJSONParse(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null") return null;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error parsing localStorage key "${key}":`, err);
    localStorage.removeItem(key);
    return null;
  }
}

const initialState = {
  signupData: null,
  token: safeJSONParse("token"),
  user: safeJSONParse("user"),
};

const authslice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSignupData: (state, action) => {
      state.signupData = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      if (action.payload) {
        state.user = {
          ...action.payload,
          accountType:
            action.payload.accountType || action.payload.accounttype,
        };
      } else {
        state.user = null;
      }
    },
  },
});

export const { setToken, setSignupData, setUser } = authslice.actions;
export default authslice.reducer;
