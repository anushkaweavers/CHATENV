import { useState } from 'react'
import { 
  Box, 
  IconButton, 
  TextField, 
  InputAdornment,
  Popover
} from '@mui/material'
import { 
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as EmojiIcon
} from '@mui/icons-material'
import { useChat } from '../../context/ChatContext'
//import EmojiPicker from '../common/EmojiPicker'
//import FileUpload from '../common/FileUpload'

function ChatInput() {
  const [message, setMessage] = useState('')
  const [emojiAnchor, setEmojiAnchor] = useState(null)
  const { sendMessage } = useChat()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      sendMessage(message)
      setMessage('')
    }
  }

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji.native)
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper'
      }}
    >
      <FileUpload onFileUpload={(file) => console.log('File uploaded:', file)}>
        <IconButton>
          <AttachFileIcon />
        </IconButton>
      </FileUpload>
      
      <IconButton onClick={(e) => setEmojiAnchor(e.currentTarget)}>
        <EmojiIcon />
      </IconButton>
      
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <EmojiPicker onSelect={handleEmojiClick} />
      </Popover>
      
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{
          mx: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 20,
            bgcolor: 'action.hover',
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                edge="end" 
                color="primary" 
                type="submit"
                disabled={!message.trim()}
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}

export default ChatInput