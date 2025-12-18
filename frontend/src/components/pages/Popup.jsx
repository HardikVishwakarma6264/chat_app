import { useState } from "react";
import { Search } from "lucide-react";

const Popup = ({
  friendsList,
  requestsList,
  acceptedList,
  handleSendRequest,
  setShowPopup,
  activeTab,
  setActiveTab,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [userSearch, setUserSearch] = useState("");

  const filteredFriends = friendsList.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
      onClick={() => setShowPopup(false)}
    >
      <div
        className=" rounded-lg w-[310px] md:w-96 md:h-[50vh] h-[60vh] shadow-xl border border-white  flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER + TABS */}
        <div className="p-3 pb-2">
          <h3 className="text-xl md:text-2xl text-white dark:text-white font-semibold  mb-4 text-center">
            Add & Manage Friends
          </h3>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-3 py-1 rounded-full ${
                activeTab === "friends"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              All Users
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`px-3 py-1 rounded-full ${
                activeTab === "requests"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              Requests
            </button>

            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-3 py-1 rounded-full ${
                activeTab === "accepted"
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              Friends
            </button>
          </div>
        </div>

        {/* SCROLL CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-5 custom-scroll">
          {activeTab === "friends" && (
            <div className="space-y-3">
              {/* SEARCH BAR */}
              <div className="relative mb-4 mt-2">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="
          w-full py-2 pl-10 pr-4
          rounded-2xl
          dark:border-white
          dark:bg-black
          bg-white
          text-sm text-black
          dark:text-white
          placeholder-gray-800
          dark:placeholder-gray-400
          border-b border-black
          focus:border-cyan-400
          outline-none
        "
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white text-black"
                />
              </div>

              {/* FILTERED USERS */}
              {filteredFriends.length === 0 ? (
                <div className="text-xl md:text-2xl  text-center text-white ">
                  All users are friend
                </div>
              ) : (
                filteredFriends.map((u) => {
                  const isMatch =
                    userSearch.length > 0 &&
                    u.name.toLowerCase().includes(userSearch.toLowerCase());

                  return (
                    <div
                      key={u.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition 
        ${isMatch ? "bg-[#2e4a40]" : "bg-gray-700 hover:bg-gray-800"}`}
                    >
                      <img
                        src={u.image}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover border cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setPreviewImage(u.image);
                          setZoom(1);
                        }}
                      />

                      <div className="flex-1 text-gray-100">{u.name}</div>

                      <button
                        onClick={() => handleSendRequest(u.id)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          u.status === "pending"
                            ? "bg-yellow-400 text-black"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {u.status === "pending" ? "Pending" : "Add Friend"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <div className="space-y-3">
              {requestsList.length === 0 ? (
                <div className="text-2xl text-white mt-12 text-center">
                  No pending requests
                </div>
              ) : (
                requestsList.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-800 transition"
                  >
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-12 h-12 rounded-full object-cover border cursor-pointer hover:opacity-80"
                      onClick={() => {
                        setPreviewImage(r.image);
                        setZoom(1);
                      }}
                    />
                    <div className="flex-1 text-gray-100">{r.name}</div>
                    <button className="px-3 py-1 rounded-md text-sm bg-yellow-400 text-black cursor-not-allowed">
                      Pending
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ACCEPTED TAB */}
          {activeTab === "accepted" && (
            <div className="space-y-3">
              {acceptedList.length === 0 ? (
                <div className="text-base text-gray-300 text-center">
                  No accepted friends yet
                </div>
              ) : (
                acceptedList.map((a) => (
                  <div
                    key={a.userId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                  >
                    <img
                      src={a.image}
                      alt={a.name}
                      className="w-12 h-12 rounded-full object-cover border cursor-pointer hover:opacity-80"
                      onClick={() => {
                        setPreviewImage(a.image);
                        setZoom(1);
                      }}
                    />
                    <div className="flex-1 text-gray-100">{a.name}</div>
                    <button className="px-3 py-1 rounded-md text-sm bg-cyan-600 text-white cursor-not-allowed">
                      Friends
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* FIXED BOTTOM CLOSE BUTTON */}
        <div className="p-2 border-t rounded-2xl border-gray-800">
          <button
            onClick={() => setShowPopup(false)}
            className="w-full bg-gray-200 text-black py-2 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>

      {/* FULLSCREEN IMAGE PREVIEW */}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-[999]
               transition-opacity duration-300 ease-out"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="
        max-w-[80vw] max-h-[80vh]
        rounded-lg shadow-2xl
        transform scale-90 opacity-0
        animate-profileZoom
        transition-transform duration-300 ease-out
      "
            onWheel={(e) => {
              e.preventDefault();
              if (e.deltaY < 0 && zoom < 3) setZoom((z) => z + 0.1);
              if (e.deltaY > 0 && zoom > 1) setZoom((z) => z - 0.1);
            }}
            style={{
              transform: `scale(${zoom})`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Popup;
