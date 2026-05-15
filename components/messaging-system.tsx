"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { MessageCircle, Send, Search, MoreVertical, Phone, Video, Info, Archive, Trash2, Circle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  created_at: string
  updated_at: string
  other_user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  read_at: string | null
  created_at: string
}

export function MessagingSystem() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
      markMessagesAsRead(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          messages (
            content,
            created_at,
            sender_id
          )
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching conversations:", error)
        return
      }

      if (data) {
        // Get other participants' profiles
        const otherUserIds = data.map((conv) =>
          conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1,
        )

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", otherUserIds)

        const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

        const conversationsWithProfiles = data.map((conv) => {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1
          const lastMessage = conv.messages?.[conv.messages.length - 1]

          return {
            ...conv,
            other_user: profilesMap.get(otherUserId) || {
              id: otherUserId,
              username: "Unknown User",
              full_name: "Unknown User",
              avatar_url: "/placeholder.svg",
            },
            last_message: lastMessage,
            unread_count: 0, // Would need to calculate based on read_at
          }
        })

        setConversations(conversationsWithProfiles)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }

    setLoading(false)
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return

    try {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .is("read_at", null)
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: "text",
      })

      if (error) {
        console.error("Error sending message:", error)
        return
      }

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConversation)

      setNewMessage("")
      fetchMessages(selectedConversation)
      fetchConversations()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const startConversation = async (otherUserId: string) => {
    if (!user) return

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`,
        )
        .single()

      if (existing) {
        setSelectedConversation(existing.id)
        return
      }

      // Create new conversation
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating conversation:", error)
        return
      }

      setSelectedConversation(data.id)
      fetchConversations()
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Sign in to access messages</h3>
          <p className="text-muted-foreground">Connect with community members through direct messages</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-muted/20">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-3">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation === conversation.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.other_user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{conversation.other_user.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      {conversation.unread_count > 0 && (
                        <Circle className="absolute -top-1 -right-1 h-3 w-3 fill-primary text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {conversation.other_user.full_name || conversation.other_user.username}
                        </p>
                        {conversation.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>

                      {conversation.last_message && (
                        <p className="text-xs text-muted-foreground truncate">{conversation.last_message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedConv.other_user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{selectedConv.other_user.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConv.other_user.full_name || selectedConv.other_user.username}</p>
                  <p className="text-xs text-muted-foreground">@{selectedConv.other_user.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Info className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
