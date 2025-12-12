import { toast } from "react-hot-toast";
import { apiconnector } from "../apiconnector";
import { setToken, setSignupData, setUser } from "../../slices/authSlice";
import { sendotps } from "../apis";
import { signup } from "../apis";
import { login } from "../apis";
import { chat } from "../apis";
import { setOtherUsers } from "../../slices/chatSlice";
import { imageupdate } from "../apis";
import { usernameupdate } from "../apis";
import { getmessages } from "../apis";
import { sendmessage } from "../apis";
import { gettimeandmessage } from "../apis";
import { getfriend } from "../apis";
import { sendrequest } from "../apis";
import { getrequest } from "../apis";
import { responserequest } from "../apis";
import { getrequests } from "../apis";
import { getaccepted } from "../apis";
import { getaccepteded } from "../apis";

export function sendOtp(email, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending OTP...");
    try {
      const response = await apiconnector("POST", sendotps.SEND_OTP, { email });

      // console.log("SEND OTP RESPONSE:", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("OTP Sent Successfully!");
      navigate("/verifyemail");

      return true; // ✅ success return
    } catch (error) {
      // console.log("SEND OTP ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
      return false; // ✅ failure return
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function logout(navigate) {
  return (dispatch) => {
    // Clear Redux state
    dispatch(setToken(null));
    dispatch(setUser(null));

    // // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Show toast
    toast.success("Logged Out");

    // Redirect to home
    navigate("/");
  };
}

export function signupuser(
  firstname,
  lastname,
  email,
  password,
  confirmpassword,
  otp,
  navigate
) {
  return async (dispatch) => {
    const toastId = toast.loading("Signing up...");
    try {
      // Prepare payload for signup
      const payload = {
        firstname: firstname,
        lastname: lastname,
        email,
        password,
        confirmpassword: confirmpassword,
        otp,
      };

      // ✅ Signup API call
      const response = await apiconnector("POST", signup.SIGNUPJI, payload);
      // console.log("SIGNUP RESPONSE:", response);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Signup failed");
      }

      // toast.success("Signup Successful!");

      // ✅ Clear staged signup data
      dispatch(setSignupData(null));
      localStorage.removeItem("signupData");

      // ✅ Auto Login after Signup
      await dispatch(loginuser(email, password, navigate));
    } catch (error) {
      // console.log("SIGNUP ERROR:", error);
      toast.error(
        error?.response?.data?.message || error.message || "Signup Failed"
      );
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function loginuser(email, password, navigate) {
  return async (dispatch) => {
    // const toastId = toast.loading("Logging in...");

    try {
      const response = await apiconnector("POST", login.LOGINJI, {
        email,
        password,
      });

      // console.log("LOGIN API RESPONSE:", response);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Login failed");
      }

      // toast.success("Login Successful!");

      const token = response.data.token;
      const user = response.data.user;

      dispatch(setToken(token));

      const userImage = user?.image
        ? user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstname} ${user.lastname}`;

      dispatch(setUser({ ...user, image: userImage }));
      // console.log("setuser data->", user);

      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, image: userImage })
      );

      navigate("/home");
    } catch (error) {
      // console.error("LOGIN API ERROR:", error);
      toast.error(
        error?.response?.data?.message || error.message || "Login Failed"
      );
    } finally {
      // toast.dismiss(toastId);
    }
  };
}

export function getOtherUsers() {
  return async (dispatch) => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      const response = await apiconnector("GET", chat.OTHER_USERS, null, {
        Authorization: `Bearer ${token}`,
      });

      // console.log("OTHER USERS RESPONSE:", response);

      if (response?.data?.success) {
        const formattedChats = response.data.users.map((user) => ({
          id: user._id || user.id,
          name:
            user.name ||
            `${user.firstname || ""} ${user.lastname || ""}`.trim(),
          image:
            user.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || "User"
            )}&background=random`,
          lastMessage: "No messages yet",
          time: "",
          unread: 0,
          icon: null,
          messages: [],
        }));

        dispatch(setOtherUsers(formattedChats));
      }
    } catch (error) {
      // console.error("Error fetching other users:", error);
    }
  };
}

export function handleImageUpload(file) {
  return async (dispatch) => {
    const toastId = toast.loading("Uploading image...");
    try {
      if (!file) {
        toast.dismiss(toastId);
        return toast.error("Please select an image");
      }

      const token = JSON.parse(localStorage.getItem("token"));
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiconnector(
        "POST",
        imageupdate.IMAGE_UPDATE,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      );

      // console.log("IMAGE UPLOAD RESPONSE:", response);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Image upload failed");
      }

      const updatedUser = response.data.data;
      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.dismiss(toastId);
      toast.success("Image uploaded successfully ✅");
      return { success: true };
    } catch (error) {
      // console.error("IMAGE UPLOAD ERROR:", error);
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || "Image upload failed");
      return { success: false };
    }
  };
}

export const handleAboutUpdate = async (about, token, dispatch) => {
  try {
    // console.log("Token inside handleAboutUpdate:", token);
    const response = await apiconnector(
      "PUT",
      "http://localhost:4001/api/v1/auth/update-about",
      { about },
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    );

    const updatedUser = response.data.data;
    dispatch(setUser(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("About updated successfully!");
    return { success: true };
  } catch (error) {
    // console.error("ABOUT UPDATE ERROR:", error);
    toast.error("Failed to update about");
    return { success: false };
  }
};

export const handleContactUpdate = async (contactnumber, token, dispatch) => {
  try {
    const response = await apiconnector(
      "PUT",
      "http://localhost:4001/api/v1/auth/update-contact",
      { contactnumber },
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    );

    const updatedUser = response.data.data;
    dispatch(setUser(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("Contact number updated successfully!");
    return { success: true };
  } catch (error) {
    // console.error("CONTACT UPDATE ERROR:", error);
    toast.error("Failed to update contact number");
    return { success: false };
  }
};

export const logoutUser = (navigate) => {
  try {
    // 🧹 Remove token from localStorage
    localStorage.removeItem("token");

    // Optional: agar user data bhi store kar rahe ho
    localStorage.removeItem("user");

    // ✅ Redirect to login page
    toast.success("Logged out successfully");
    navigate("/");
  } catch (error) {
    // console.error("Logout Error:", error);
  }
};

export const updateUsername = async (username, token, dispatch) => {
  try {
    const response = await apiconnector(
      "PUT",
      usernameupdate.USERNAME_UPDATE,
      { username },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    // console.log("UPDATE USERNAME RESPONSE:", response);

    if (response.data.success) {
      const updatedUser = response.data.updatedUser;
      // ✅ Update Redux + localStorage
      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Username updated successfully");
    }

    return response.data;
  } catch (error) {
    // console.log("UPDATE USERNAME ERROR:", error);
    toast.error("Something went wrong while updating username");
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export function getMessages(receiverId) {
  return async () => {
    // const toastId = toast.loading("Fetching messages...");

    try {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) throw new Error("User not authenticated");

      const response = await apiconnector(
        "GET",
        `${getmessages.GET_MESSAGES}/${receiverId}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      // console.log("GET MESSAGES RESPONSE:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get messages");
      }

      // toast.success("Messages loaded ✅");
      return response.data; // { success, messages }
    } catch (error) {
      // console.error("GET MESSAGES ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to load messages"
      );
      return { success: false, messages: [] };
    } finally {
      // toast.dismiss(toastId);
    }
  };
}

export function sendMessage(receiverId, message, replyTo = null) {
  return async () => {
    // const toastId = toast.loading("Sending message...");

    try {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) throw new Error("User not authenticated");

      // 🔥 ADD replyTo inside request body
      const payload = { message };
      if (replyTo) payload.replyTo = replyTo;

      const response = await apiconnector(
        "POST",
        `${sendmessage.SEND_MESSAGE}/${receiverId}`,
        payload,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      // console.log("SEND MESSAGE RESPONSE:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send message");
      }

      // toast.success("Message sent ✅");
      return response.data; // { success, data: newMessage }
    } catch (error) {
      // console.error("SEND MESSAGE ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
      return { success: false };
    } finally {
      // toast.dismiss(toastId);
    }
  };
}

export async function getUserConversations() {
  try {
    const token = JSON.parse(localStorage.getItem("token"));
    const res = await apiconnector("GET", gettimeandmessage.GET_TIME, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!res.data.success) throw new Error("Failed to load conversations");
    return res.data.conversations;
  } catch (err) {
    // console.error("GET CONVERSATIONS ERROR:", err);
    return [];
  }
}

export async function getotherfriend() {
  try {
    const token = JSON.parse(localStorage.getItem("token"));
    const response = await apiconnector("GET", getfriend.GET_FRIEND, null, {
      Authorization: `Bearer ${token}`,
    });

    if (response?.data?.success) {
      return response.data.users; // ← IMPORTANT
    }
  } catch (error) {
    // console.error("Error fetching other users:", error);
    return [];
  }
}

export async function sendFriendRequestAPI(receiverId) {
  try {
    const token = JSON.parse(localStorage.getItem("token"));

    const response = await apiconnector(
      "POST",
      sendrequest.SEND_REQUEST,
      { receiverId },
      { Authorization: `Bearer ${token}` }
    );

    return response?.data;
  } catch (err) {
    // console.error("sendFriendRequestAPI error", err);
    throw err;
  }
}

export async function getIncomingRequestsAPI() {
  try {
    const token = JSON.parse(localStorage.getItem("token"));

    const response = await apiconnector("GET", getrequest.GET_REQUEST, null, {
      Authorization: `Bearer ${token}`,
    });

    return response?.data?.requests || [];
  } catch (err) {
    // console.error("getIncomingRequestsAPI error", err);
    return [];
  }
}

export async function respondToRequestAPI(requestId, action) {
  try {
    const token = JSON.parse(localStorage.getItem("token"));

    const response = await apiconnector(
      "POST",
      `${responserequest.SEND_RESPONSE}/${requestId}/respond`,
      { action },
      { Authorization: `Bearer ${token}` }
    );

    return response?.data;
  } catch (err) {
    // console.error("respondToRequestAPI error", err);
    throw err;
  }
}

export async function getOutgoingRequestsAPI() {
  const token = JSON.parse(localStorage.getItem("token"));
  const response = await apiconnector("GET", getrequests.GET_OUTGOING, null, {
    Authorization: `Bearer ${token}`,
  });

  return response?.data?.outgoing || [];
}

export async function getAcceptedFriendsAPI() {
  const token = JSON.parse(localStorage.getItem("token"));
  const response = await apiconnector("GET", getaccepted.GET_ACCEPTED, null, {
    Authorization: `Bearer ${token}`,
  });

  return response?.data?.friends || [];
}

export async function createOrFetchConversationAPI(receiverId) {
  const token = JSON.parse(localStorage.getItem("token"));

  const response = await apiconnector(
    "POST",
    getaccepteded.GET_ACCEPTEDED,
    { receiverId },
    {
      Authorization: `Bearer ${token}`,
    }
  );

  return response?.data;
}
