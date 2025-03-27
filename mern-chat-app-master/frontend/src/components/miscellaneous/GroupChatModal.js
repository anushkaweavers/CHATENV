import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Avatar,
  Text,
  Stack,
  InputGroup,
  InputLeftElement,
  Spinner,
  SlideFade,
  ScaleFade,
  IconButton,
  Tooltip,
  Badge
} from "@chakra-ui/react";
import { SearchIcon, AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useState, useEffect } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  useEffect(() => {
    if (!isOpen) {
      // Reset states when modal closes
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);
    }
  }, [isOpen]);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some(user => user._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
    setSearch("");
    setSearchResult([]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      // Filter out already selected users and current user
      const filteredData = data.filter(
        userResult => 
          !selectedUsers.some(u => u._id === userResult._id) && 
          userResult._id !== user._id
      );
      setSearchResult(filteredData);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName) {
      toast({
        title: "Please enter a group name",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (selectedUsers.length < 2) {
      toast({
        title: "Group must have at least 2 members",
        description: "Add more users to create a group",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setIsCreating(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        description: `"${groupChatName}" is ready for conversations`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response?.data || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Box onClick={onOpen} _hover={{ cursor: "pointer" }}>
        {children}
      </Box>

      <Modal 
        onClose={onClose} 
        isOpen={isOpen} 
        isCentered
        size={{ base: "sm", md: "md", lg: "lg" }}
        motionPreset="scale"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent 
          borderRadius="xl"
          boxShadow="xl"
          bg="whiteAlpha.900"
          _dark={{ bg: "gray.800" }}
        >
          <ModalHeader
            fontSize="2xl"
            fontWeight="bold"
            fontFamily="'Poppins', sans-serif"
            textAlign="center"
            py={4}
            borderBottomWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.700" }}
          >
            Create New Group
            <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
              Add members and set a group name
            </Text>
          </ModalHeader>
          <ModalCloseButton size="lg" />
          
          <ModalBody px={6} py={4}>
            <Stack spacing={4}>
              <FormControl>
                <Input
                  placeholder="Group name (e.g., Family Chat, Project Team)"
                  size="lg"
                  borderRadius="lg"
                  focusBorderColor="teal.400"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search users to add..."
                    borderRadius="lg"
                    focusBorderColor="teal.400"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <ScaleFade in={selectedUsers.length > 0}>
                  <Box>
                    <Text fontSize="sm" mb={2} color="gray.600" fontWeight="medium">
                      Selected Members ({selectedUsers.length})
                    </Text>
                    <Flex wrap="wrap" gap={2}>
                      {selectedUsers.map((u) => (
                        <Tag
                          key={u._id}
                          size="lg"
                          borderRadius="full"
                          variant="subtle"
                          colorScheme="teal"
                          px={3}
                          py={2}
                        >
                          <Avatar
                            src={u.pic}
                            size="xs"
                            name={u.name}
                            ml={-2}
                            mr={2}
                          />
                          <TagLabel>{u.name}</TagLabel>
                          <TagCloseButton onClick={() => handleDelete(u)} />
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                </ScaleFade>
              )}

              {/* Search Results */}
              <Box maxH="300px" overflowY="auto" px={1}>
                {loading ? (
                  <Flex justify="center" py={4}>
                    <Spinner size="lg" color="teal.500" />
                  </Flex>
                ) : searchResult.length > 0 ? (
                  <SlideFade in={searchResult.length > 0}>
                    <Stack spacing={3}>
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Search Results
                      </Text>
                      {searchResult.map((user) => (
                        <UserListItem
                          key={user._id}
                          user={user}
                          handleFunction={() => handleGroup(user)}
                          actionIcon={<AddIcon boxSize={3} />}
                          actionText="Add"
                        />
                      ))}
                    </Stack>
                  </SlideFade>
                ) : search ? (
                  <Text textAlign="center" py={4} color="gray.500">
                    No users found
                  </Text>
                ) : null}
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter 
            borderTopWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.700" }}
            px={6}
            py={4}
          >
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onClose}
              borderRadius="lg"
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              isLoading={isCreating}
              loadingText="Creating..."
              borderRadius="lg"
              px={6}
              rightIcon={
                <Badge 
                  ml={1} 
                  colorScheme="white" 
                  bg="teal.500" 
                  borderRadius="full"
                  fontSize="0.8em"
                >
                  {selectedUsers.length}
                </Badge>
              }
              isDisabled={!groupChatName || selectedUsers.length < 2}
            >
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;