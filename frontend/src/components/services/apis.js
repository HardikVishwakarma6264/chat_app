// const BASE_URL= process.env.REACT_APP_BASE_URL

const BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const sendotps={
  SEND_OTP:BASE_URL+"/auth/sendotp"
}

export const signup={
  SIGNUPJI:BASE_URL+"/auth/signup"
}

export const login={
  LOGINJI:BASE_URL+"/auth/login"
}

export const chat = {
  OTHER_USERS: BASE_URL + "/auth/otherusers",
};

export const imageupdate={
  IMAGE_UPDATE:BASE_URL+"/auth/update-image"
}

export const aboutupdate={
  ABOUT_UPDATE:BASE_URL+"/auth/update-about"
}

export const usernameupdate={
  USERNAME_UPDATE:BASE_URL+"/auth/update-username"
}

export const getmessages={
  GET_MESSAGES:BASE_URL+"/mess/get"
}

export const sendmessage={
  SEND_MESSAGE:BASE_URL+"/mess/send"
}

export const gettimeandmessage={
  GET_TIME:BASE_URL+"/mess/conversations"
}

export const getfriend={
  GET_FRIEND:BASE_URL+"/friend/otherfriend"
}

export const sendrequest = {
  SEND_REQUEST: BASE_URL + "/friend/request",
};

export const getrequest = {
  GET_REQUEST: BASE_URL + "/friend/requests/incoming",
};

export const responserequest = {
  SEND_RESPONSE: BASE_URL + "/friend/requests",  // base, id append later
};

export const getrequests = {
  GET_OUTGOING: BASE_URL + "/friend/outgoing",
};

export const getaccepted = {
  GET_ACCEPTED: BASE_URL + "/friend/accepted",
};

export const getaccepteded = {
  GET_ACCEPTEDED: BASE_URL + "/mess/create-or-fetch",
};