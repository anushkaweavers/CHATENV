import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/");
  }, [history]);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(ENDPOINT, {
        transports: ["websocket"],
        withCredentials: true,
      });

      setSocket(newSocket);

      // Setup event listeners
      newSocket.emit("setup", user);
      newSocket.on("connected", () => setSocketConnected(true));

      return () => {
        newSocket.disconnect();
        newSocket.off("connected");
      };
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        socket,
        socketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;