import { List, ListItem, ListItemAvatar, ListItemText, Typography, TextField, Box } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useChat } from '../../context/ChatContext'
import ContactItem from './ContactItem'
import { useState } from 'react';

function ContactList() {
  const { contacts, currentChat, loadChat } = useChat()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box width={320} borderRight="1px solid" borderColor="divider" bgcolor="background.paper">
      <Box p={2}>
        <TextField
          fullWidth
          placeholder="Search contacts"
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <List>
        {filteredContacts.map(contact => (
          <ContactItem
            key={contact._id}
            contact={contact}
            selected={currentChat?._id === contact._id}
            onClick={() => loadChat(contact._id)}
          />
        ))}
      </List>
    </Box>
  )
}

export default ContactList