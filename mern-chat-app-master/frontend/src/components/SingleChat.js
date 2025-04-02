import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, Flex } from "@chakra-ui/layout";
import {useColorModeValue} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import "./styles.css";
import { IconButton, Spinner, useToast, Avatar, Tooltip } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const bgColor = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const chatBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if ((event.key === "Enter" || event.type === "click") && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id, // Make sure this is correct
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

 // In SingleChat.js
useEffect(() => {
  socket.on("message recieved", (newMessageRecieved) => {
    if (
      !selectedChatCompare ||
      selectedChatCompare._id !== newMessageRecieved.chat._id
    ) {
      // Check if notification already exists
      const isNotificationExists = notification.some(
        (n) => n._id === newMessageRecieved._id
      );
      
      if (!isNotificationExists) {
        setNotification([newMessageRecieved, ...notification]);
        setFetchAgain(!fetchAgain);
      }
    } else {
      setMessages([...messages, newMessageRecieved]);
    }
  });

  return () => {
    socket.off("message recieved");
  };
}, [messages, notification, fetchAgain]); // Add dependencies
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={3}
      bg={bgColor}
      width="100%"
      height="100%"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="md"
      position="relative"
    >
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <Flex
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            borderBottom="1px"
            borderColor={borderColor}
          >
            <Flex alignItems="center">
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
                mr={2}
                aria-label="Back to chats"
              />
              {!selectedChat.isGroupChat ? (
                <>
                  <Avatar
                    size="sm"
                    cursor="pointer"
                    name={getSender(user, selectedChat.users)}
                    src={getSenderFull(user, selectedChat.users)?.pic}
                    mr={2}
                  />
                  <Text fontWeight="bold" fontSize="lg">
                    {getSender(user, selectedChat.users)}
                  </Text>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  <Avatar
                    size="sm"
                    cursor="pointer"
                    name={selectedChat.chatName}
                    mr={2}
                  />
                  <Text fontWeight="bold" fontSize="lg">
                    {selectedChat.chatName.toUpperCase()}
                  </Text>
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              )}
            </Flex>
          </Flex>

          {/* Messages Container */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg={chatBg}
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
            position="relative"
          >
            {loading ? (
              <Flex justify="center" align="center" height="100%">
                <Spinner size="xl" thickness="4px" color="teal.500" />
              </Flex>
            ) : (
              <Box
                height="100%"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "teal",
                    borderRadius: "24px",
                  },
                }}
              >
                <ScrollableChat messages={messages} />
                <div ref={messagesEndRef} />
              </Box>
            )}

            {/* Typing Indicator */}
            {istyping && (
              <Box
                position="absolute"
                bottom="70px"
                left="10px"
                bg="white"
                p={1}
                borderRadius="md"
                boxShadow="sm"
              >
                <Lottie
                  options={defaultOptions}
                  width={50}
                  style={{ margin:0}}
                />
              </Box>
            )}

            {/* Message Input */}
            <FormControl
              onKeyDown={sendMessage}
              id="message-input"
              mt={3}
              display="flex"
              alignItems="center"
            >
              <Tooltip label="Attach file" hasArrow placement="top">
                <IconButton
                  aria-label="Attach file"
                  icon={<AttachmentIcon />}
                  mr={2}
                  variant="ghost"
                  colorScheme="teal"
                />
              </Tooltip>
              <Input
                variant="filled"
                bg={inputBg}
                placeholder="Type a message..."
                value={newMessage}
                onChange={typingHandler}
                borderRadius="full"
                flex="1"
                _focus={{
                  bg: inputBg,
                  borderColor: "teal.500",
                }}
              />
              <Button
                ml={2}
                colorScheme="teal"
                onClick={sendMessage}
                disabled={!newMessage}
                borderRadius="full"
                px={6}
              >
                Send
              </Button>
            </FormControl>
          </Box>
        </>
      ) : (
        <Flex
          height="100%"
          width="100%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          textAlign="center"
        >
          <Box
            bg={chatBg}
            p={8}
            borderRadius="lg"
            boxShadow="md"
            maxWidth="400px"
          >
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Welcome to your messages
            </Text>
            <Text color="gray.500" mb={6}>
              Select a chat from your conversations or start a new one to begin messaging
            </Text>
            <Avatar
              size="xl"
              name={user.name}
              src={user.pic}
              mb={4}
              mx="auto"
            />
            <Text fontSize="lg" fontWeight="semibold">
              {user.name}
            </Text>
            <Text color="gray.500" fontSize="sm">
              {user.email}
            </Text>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default SingleChat;
