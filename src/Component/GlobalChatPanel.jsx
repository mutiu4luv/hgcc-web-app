import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { io } from "socket.io-client";

const formatDayLabel = (value) => {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-GB");
};

const formatTimeLabel = (value) => {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const canEditMessage = (message) => {
  const createdAt = new Date(message?.createdAt || 0).getTime();
  if (!createdAt) return false;
  return Date.now() - createdAt <= 20 * 60 * 1000;
};

const getTwoNames = (rawName = "User") => {
  const parts = String(rawName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
  return parts[0] || "User";
};

const parseReplyText = (value = "") => {
  const text = String(value || "");
  const replyPrefix = "↪ ";
  if (!text.startsWith(replyPrefix)) return null;

  const firstBreak = text.indexOf("\n");
  if (firstBreak < 0) return null;

  const replyLine = text.slice(replyPrefix.length, firstBreak).trim();
  const body = text.slice(firstBreak + 1);
  const colonIndex = replyLine.indexOf(":");
  if (colonIndex < 0) return null;

  return {
    senderName: replyLine.slice(0, colonIndex).trim() || "User",
    preview: replyLine.slice(colonIndex + 1).trim(),
    body,
  };
};

const GlobalChatPanel = ({
  role = "student",
  token,
  baseUrl,
  onSeen,
  unreadSummary = null,
}) => {
  const storageKey = `group_chat_selected_channel_${role}`;
  const defaultChannel =
    role === "coach" || role === "owner" || role === "admin"
      ? "coaches"
      : "students";
  const [channel, setChannel] = useState(
    () => localStorage.getItem(storageKey) || defaultChannel
  );
  const [allowedChannels, setAllowedChannels] = useState([defaultChannel]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState("");
  const [editText, setEditText] = useState("");
  const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
  const [deleteMessageId, setDeleteMessageId] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const swipeStartXRef = useRef(0);
  const scrollBoxRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const hiddenMessagesKey = `group_chat_hidden_${role}_${channel}`;
  const lastSeenKey = `group_chat_last_seen_${role}_${channel}`;
  const [hiddenMessageIds, setHiddenMessageIds] = useState(() => {
    try {
      const raw = localStorage.getItem(hiddenMessagesKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(hiddenMessagesKey);
      setHiddenMessageIds(raw ? JSON.parse(raw) : []);
    } catch {
      setHiddenMessageIds([]);
    }
  }, [hiddenMessagesKey]);

  const [lastSeenAt, setLastSeenAt] = useState(() => {
    const raw = localStorage.getItem(lastSeenKey);
    return raw ? new Date(raw) : new Date(0);
  });

  useEffect(() => {
    const raw = localStorage.getItem(lastSeenKey);
    setLastSeenAt(raw ? new Date(raw) : new Date(0));
  }, [lastSeenKey]);

  const markChannelAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem(lastSeenKey, now);
    setLastSeenAt(new Date(now));
    if (typeof onSeen === "function") onSeen(channel);
  };

  const hideMessageOnlyForMe = (messageId) => {
    const next = Array.from(new Set([...hiddenMessageIds, String(messageId)]));
    setHiddenMessageIds(next);
    localStorage.setItem(hiddenMessagesKey, JSON.stringify(next));
  };

  const channelOptions = useMemo(() => {
    const map = {
      students: "All Students Chat",
      coaches: "Coaches Chat",
    };
    return allowedChannels.map((id) => ({
      value: id,
      label: map[id] || id,
    }));
  }, [allowedChannels]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const next =
      role === "coach" || role === "owner" || role === "admin"
        ? "coaches"
        : saved || defaultChannel;
    setChannel(next);
    localStorage.setItem(storageKey, next);
    setAllowedChannels([defaultChannel]);
  }, [defaultChannel, role, storageKey]);

  useEffect(() => {
    const loadChannels = async () => {
      if (!token || !baseUrl) return;
      try {
        const { data } = await axios.get(`${baseUrl}/api/group-chat/channels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawChannels = Array.isArray(data?.channels) ? data.channels : ["students"];
        const normalized = Array.from(
          new Set(
            rawChannels.map((ch) => (ch === "users" ? "students" : ch)).filter(Boolean)
          )
        );

        const channels =
          role === "coach"
            ? Array.from(new Set(["coaches", "students", ...normalized]))
            : normalized.length > 0
            ? normalized
            : ["students"];

        setAllowedChannels(channels);
        if (!channels.includes(channel)) {
          const fallback = channels.includes(defaultChannel)
            ? defaultChannel
            : channels[0] || defaultChannel;
          setChannel(fallback);
          localStorage.setItem(storageKey, fallback);
        }
      } catch {
        const fallback =
          role === "student"
            ? ["students"]
            : role === "coach"
            ? ["coaches", "students"]
            : ["coaches", "students"];
        setAllowedChannels(fallback);
        if (!fallback.includes(channel)) {
          const fb = fallback.includes(defaultChannel)
            ? defaultChannel
            : fallback[0];
          setChannel(fb);
          localStorage.setItem(storageKey, fb);
        }
      }
    };
    loadChannels();
  }, [token, baseUrl, role, storageKey, defaultChannel]);

  const callChatApiWithStudentsAlias = async (fn) => {
    if (channel !== "students") return fn(channel);
    try {
      // Primary students endpoint.
      return await fn("students");
    } catch (studentsErr) {
      try {
        // Legacy alias endpoint.
        return await fn("users");
      } catch {
        throw studentsErr;
      }
    }
  };

  useEffect(() => {
    if (!token || !baseUrl || !channel) return;
    let mounted = true;

    setPage(1);
    setMessages([]);

    const loadMessages = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const { data } = await callChatApiWithStudentsAlias((resolvedChannel) =>
          axios.get(
            `${baseUrl}/api/group-chat/${resolvedChannel}/messages?page=1&limit=30`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );
        if (mounted) {
          const incoming = Array.isArray(data?.messages) ? data.messages : [];
          if (silent) {
            setMessages((prev) => {
              const byId = new Map();
              [...prev, ...incoming].forEach((m) => byId.set(String(m._id), m));
              return Array.from(byId.values()).sort(
                (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
              );
            });
          } else {
            setMessages(
              incoming.sort(
                (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
              )
            );
          }
          setHasMore(Boolean(data?.hasMore));
        }
      } catch {
        if (mounted) setMessages([]);
      } finally {
        if (!silent && mounted) setLoading(false);
      }
    };

    loadMessages();
    const interval = setInterval(() => loadMessages(true), 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token, baseUrl, channel]);

  const loadOlderMessages = async () => {
    if (!hasMore || loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { data } = await callChatApiWithStudentsAlias((resolvedChannel) =>
        axios.get(
          `${baseUrl}/api/group-chat/${resolvedChannel}/messages?page=${nextPage}&limit=30`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      const older = Array.isArray(data?.messages) ? data.messages : [];
      setMessages((prev) => {
        const byId = new Map();
        [...older, ...prev].forEach((m) => byId.set(String(m._id), m));
        return Array.from(byId.values()).sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
      });
      setPage(nextPage);
      setHasMore(Boolean(data?.hasMore));
    } finally {
      setLoadingMore(false);
    }
  };

  const reactToMessage = async (messageId, reaction) => {
    try {
      const { data } = await callChatApiWithStudentsAlias((resolvedChannel) =>
        axios.patch(
          `${baseUrl}/api/group-chat/${resolvedChannel}/messages/${messageId}/reaction`,
          { reaction },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? {
                ...m,
                ...(data?.message || {}),
                likedBy: Array.isArray(data?.message?.likedBy)
                  ? data.message.likedBy
                  : Array.isArray(m.likedBy)
                  ? m.likedBy
                  : [],
                dislikedBy: Array.isArray(data?.message?.dislikedBy)
                  ? data.message.dislikedBy
                  : Array.isArray(m.dislikedBy)
                  ? m.dislikedBy
                  : [],
              }
            : m
        )
      );
    } catch {
      // no-op
    }
  };

  const saveEditedMessage = async (messageId) => {
    if (!editText.trim()) return;
    try {
      const { data } = await callChatApiWithStudentsAlias((resolvedChannel) =>
        axios.patch(
          `${baseUrl}/api/group-chat/${resolvedChannel}/messages/${messageId}`,
          { text: editText.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId) ? { ...m, ...(data?.message || {}) } : m
        )
      );
      setEditingMessageId("");
      setEditText("");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to edit message");
    }
  };

  const removeMessageForEveryone = async (messageId) => {
    try {
      await callChatApiWithStudentsAlias((resolvedChannel) =>
        axios.delete(`${baseUrl}/api/group-chat/${resolvedChannel}/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete message");
    }
  };

  const openDeleteMenu = (event, messageId) => {
    setDeleteAnchorEl(event.currentTarget);
    setDeleteMessageId(String(messageId));
  };

  const closeDeleteMenu = () => {
    setDeleteAnchorEl(null);
    setDeleteMessageId("");
  };

  useEffect(() => {
    if (typeof onSeen === "function") onSeen(channel);
  }, [messages.length, onSeen, channel]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const finalText = replyTarget
      ? `↪ ${replyTarget.senderName}: ${replyTarget.preview}\n${text.trim()}`
      : text.trim();
    try {
      setSending(true);
      const { data } = await callChatApiWithStudentsAlias((resolvedChannel) =>
        axios.post(
          `${baseUrl}/api/group-chat/${resolvedChannel}/messages`,
          { text: finalText },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      if (data?.message) setMessages((prev) => [...prev, data.message]);
      setText("");
      setReplyTarget(null);
      setTypingUsers([]);
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserId = currentUser?.id || currentUser?._id;
      const firstName = getTwoNames(currentUser?.fullName || currentUser?.name || "User");
      socketRef.current?.emit("groupChatTyping", {
        channel,
        userId: currentUserId,
        firstName,
        isTyping: false,
      });
    } finally {
      setSending(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?.id || currentUser?._id;
  const visibleMessages = messages.filter(
    (msg) => !hiddenMessageIds.includes(String(msg._id))
  );

  useEffect(() => {
    const box = scrollBoxRef.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [channel, visibleMessages.length]);

  useEffect(() => {
    if (!baseUrl || !token) return;
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = currentUser?.id || currentUser?._id;

    const socket = io(baseUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const onGroupMessage = ({ channel: incomingChannel, message }) => {
      const resolvedChannel =
        incomingChannel === "users" ? "students" : incomingChannel;
      if (resolvedChannel !== channel || !message?._id) return;
      setMessages((prev) => {
        const byId = new Map();
        [...prev, message].forEach((m) => byId.set(String(m._id), m));
        return Array.from(byId.values()).sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
      });
    };

    const onTyping = ({ channel: incomingChannel, userId, firstName, isTyping }) => {
      const resolvedChannel =
        incomingChannel === "users" ? "students" : incomingChannel;
      if (resolvedChannel !== channel) return;
      if (!userId || String(userId) === String(currentUserId)) return;
      setTypingUsers((prev) => {
        const cleaned = prev.filter((u) => String(u.userId) !== String(userId));
        if (!isTyping) return cleaned;
        return [...cleaned, { userId, firstName: getTwoNames(firstName || "User") }];
      });
    };

    socket.on("groupChatMessage", onGroupMessage);
    socket.on("groupChatTyping", onTyping);
    socket.emit("joinGroupChat", { channel });

    return () => {
      socket.off("groupChatMessage", onGroupMessage);
      socket.off("groupChatTyping", onTyping);
      socket.disconnect();
      socketRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [baseUrl, token, channel]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          Group Chat
        </Typography>
        <Button size="small" onClick={markChannelAsRead}>
          Mark as read
        </Button>
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Chat Room</InputLabel>
        <Select
          value={channel}
          label="Chat Room"
          onChange={(e) => {
            const next = e.target.value;
            setChannel(next);
            localStorage.setItem(storageKey, next);
          }}
        >
          {channelOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {(role === "coach" || role === "owner" || role === "admin") &&
        unreadSummary && (
          <Box
            sx={{
              mb: 2,
              p: 1.25,
              borderRadius: 2,
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>
              Unread updates
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#1e3a8a", fontWeight: 600 }}>
              {unreadSummary.students || 0} unread from students •{" "}
              {unreadSummary.coaches || 0} unread from coaches
            </Typography>
          </Box>
        )}
      {replyTarget && (
        <Box
          sx={{
            mb: 1.5,
            p: 1,
            borderRadius: 2,
            border: "1px solid #cbd5e1",
            bgcolor: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>
              Replying to {replyTarget.senderName}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#334155" }}>
              {replyTarget.preview}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setReplyTarget(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box
        ref={scrollBoxRef}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          p: 2,
          height: 320,
          overflowY: "auto",
          bgcolor: "#f8fafc",
          mb: 2,
        }}
      >
        {hasMore && (
          <Button
            size="small"
            onClick={loadOlderMessages}
            disabled={loadingMore}
            sx={{ mb: 1 }}
          >
            {loadingMore ? "Loading older..." : "Load older messages"}
          </Button>
        )}
        {loading ? (
          <Typography>Loading messages...</Typography>
        ) : visibleMessages.length === 0 ? (
          <Typography>No messages yet. Start the conversation.</Typography>
        ) : (
          visibleMessages.map((msg, index) => {
            const mine =
              String(msg?.senderId?._id || msg?.senderId) === String(currentUserId);
            const senderName = msg?.senderId?.fullName || "User";
            const senderRole = msg?.senderId?.role || "";
            const replyData = parseReplyText(msg?.text);
            const canEdit = mine && canEditMessage(msg);
            const canDelete = mine;
            const messageTime = new Date(msg?.createdAt || msg?.updatedAt || 0);
            const isUnread = !mine && messageTime > lastSeenAt;
            const currentDay = formatDayLabel(msg?.createdAt || msg?.updatedAt);
            const prev = visibleMessages[index - 1];
            const prevDay = prev
              ? formatDayLabel(prev?.createdAt || prev?.updatedAt)
              : "";
            const showDayDivider = index === 0 || currentDay !== prevDay;
            return (
              <React.Fragment key={msg._id}>
                {showDayDivider && (
                  <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        px: 1.2,
                        py: 0.3,
                        borderRadius: 999,
                        bgcolor: "#e2e8f0",
                        color: "#334155",
                      }}
                    >
                      {currentDay}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    mb: 1.2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "92%",
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: mine ? "#10b981" : isUnread ? "#dbeafe" : "#e2e8f0",
                      color: mine ? "white" : "#0f172a",
                      border:
                        String(msg._id) === String(highlightedMessageId)
                          ? "2px solid #2563eb"
                          : isUnread
                          ? "1px solid #93c5fd"
                          : "1px solid transparent",
                      transition: "border-color 0.15s ease",
                    }}
                    onTouchStart={(e) => {
                      swipeStartXRef.current = e.touches?.[0]?.clientX || 0;
                    }}
                    onTouchEnd={(e) => {
                      const endX = e.changedTouches?.[0]?.clientX || 0;
                      const delta = endX - swipeStartXRef.current;
                      if (Math.abs(delta) > 45) {
                        const preview = String(msg?.text || "").slice(0, 70);
                        const replyName = mine ? "You" : senderName;
                        setHighlightedMessageId(String(msg._id));
                        setReplyTarget({
                          id: String(msg._id),
                          senderName: replyName,
                          preview,
                        });
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: isUnread ? 800 : 700,
                        mb: 0.3,
                        opacity: mine ? 0.9 : 1,
                      }}
                    >
                      {mine ? `You (${senderRole || "user"})` : `${senderName} (${senderRole || "user"})`}
                    </Typography>
                    {replyData?.preview && (
                      <Box
                        sx={{
                          mb: 0.8,
                          p: 0.9,
                          borderRadius: 1.5,
                          borderLeft: "3px solid rgba(255,255,255,0.7)",
                          bgcolor: mine ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.05)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 800,
                            lineHeight: 1.2,
                            opacity: mine ? 0.95 : 0.9,
                          }}
                        >
                          {replyData.senderName}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            lineHeight: 1.35,
                            opacity: mine ? 0.92 : 0.85,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {replyData.preview}
                        </Typography>
                      </Box>
                    )}
                    {editingMessageId === String(msg._id) ? (
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          minRows={2}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <Button size="small" onClick={() => saveEditedMessage(msg._id)}>
                          Save
                        </Button>
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: 14, fontWeight: isUnread ? 700 : 400, whiteSpace: "pre-wrap" }}>
                        {replyData?.body || msg.text}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: 10,
                        opacity: mine ? 0.9 : isUnread ? 0.95 : 0.75,
                        fontWeight: isUnread ? 700 : 400,
                        textAlign: "right",
                        mt: 0.5,
                      }}
                    >
                      {formatTimeLabel(msg?.createdAt || msg?.updatedAt)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        onClick={() => reactToMessage(msg._id, "like")}
                        startIcon={<ThumbUpAltOutlinedIcon fontSize="small" />}
                        sx={{ minWidth: 0, px: 1, color: mine ? "#d1fae5" : "inherit" }}
                      >
                        {Array.isArray(msg.likedBy) ? msg.likedBy.length : 0}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => reactToMessage(msg._id, "dislike")}
                        startIcon={<ThumbDownAltOutlinedIcon fontSize="small" />}
                        sx={{ minWidth: 0, px: 1, color: mine ? "#fecaca" : "inherit" }}
                      >
                        {Array.isArray(msg.dislikedBy) ? msg.dislikedBy.length : 0}
                      </Button>
                      {canEdit && (
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingMessageId(String(msg._id));
                            setEditText(msg.text || "");
                          }}
                          startIcon={<EditOutlinedIcon fontSize="small" />}
                          sx={{ minWidth: 0, px: 1 }}
                        >
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="small"
                          onClick={(event) => openDeleteMenu(event, msg._id)}
                          startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                          sx={{ minWidth: 0, px: 1 }}
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        size="small"
                        onClick={() => {
                          const preview = String(msg?.text || "").slice(0, 70);
                          const replyName = mine ? "You" : senderName;
                          setHighlightedMessageId(String(msg._id));
                          setReplyTarget({
                            id: String(msg._id),
                            senderName: replyName,
                            preview,
                          });
                        }}
                        startIcon={<ReplyOutlinedIcon fontSize="small" />}
                        sx={{ minWidth: 0, px: 1 }}
                      >
                        Reply
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </React.Fragment>
            );
          })
        )}
      </Box>
      {typingUsers.length > 0 && (
        <Typography sx={{ mb: 1, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
          {typingUsers.map((u) => u.firstName).join(", ")} typing...
        </Typography>
      )}

      <Menu
        anchorEl={deleteAnchorEl}
        open={Boolean(deleteAnchorEl)}
        onClose={closeDeleteMenu}
      >
        <MenuItem
          onClick={async () => {
            const targetId = deleteMessageId;
            closeDeleteMenu();
            if (!targetId) return;
            if (window.confirm("Are you sure you want to delete for everyone?")) {
              await removeMessageForEveryone(targetId);
            }
          }}
        >
          Delete for everyone
        </MenuItem>
        <MenuItem
          onClick={() => {
            const targetId = deleteMessageId;
            closeDeleteMenu();
            if (!targetId) return;
            if (window.confirm("Remove this message from your UI only?")) {
              hideMessageOnlyForMe(targetId);
            }
          }}
        >
          Delete for me
        </MenuItem>
      </Menu>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            const nextText = e.target.value;
            setText(nextText);
            if (!socketRef.current) return;
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const currentUserId = currentUser?.id || currentUser?._id;
            const firstName = getTwoNames(currentUser?.fullName || currentUser?.name || "User");
            socketRef.current.emit("groupChatTyping", {
              channel,
              userId: currentUserId,
              firstName,
              isTyping: nextText.trim().length > 0,
            });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              socketRef.current?.emit("groupChatTyping", {
                channel,
                userId: currentUserId,
                firstName,
                isTyping: false,
              });
            }, 1200);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button variant="contained" disabled={sending} onClick={sendMessage}>
          Send
        </Button>
      </Stack>
    </Paper>
  );
};

export default GlobalChatPanel;
