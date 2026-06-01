import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
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
import axios from "axios";

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

const GlobalChatPanel = ({ role = "student", token, baseUrl, onSeen }) => {
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
        const channels = Array.isArray(data?.channels) ? data.channels : ["students"];
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
            ? ["students", "coaches"]
            : ["students", "coaches"];
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

  const withLegacyStudentsFallback = async (fn) => {
    try {
      return await fn(channel);
    } catch (err) {
      const status = err?.response?.status;
      const looksLikeInvalidChannel =
        status === 400 &&
        String(err?.response?.data?.message || "")
          .toLowerCase()
          .includes("invalid chat channel");
      if (channel === "students" && looksLikeInvalidChannel) {
        return fn("users");
      }
      throw err;
    }
  };

  useEffect(() => {
    if (!token || !baseUrl || !channel) return;
    let mounted = true;

    setPage(1);

    const loadMessages = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const { data } = await withLegacyStudentsFallback((resolvedChannel) =>
          axios.get(
            `${baseUrl}/api/group-chat/${resolvedChannel}/messages?page=1&limit=30`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );
        if (mounted) {
          const incoming = Array.isArray(data?.messages) ? data.messages : [];
          const byId = new Map();
          [...messages, ...incoming].forEach((m) => byId.set(String(m._id), m));
          const merged = Array.from(byId.values()).sort(
            (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          );
          setMessages(merged);
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
      const { data } = await withLegacyStudentsFallback((resolvedChannel) =>
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
      const { data } = await withLegacyStudentsFallback((resolvedChannel) =>
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
      const { data } = await withLegacyStudentsFallback((resolvedChannel) =>
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

  const removeMessage = async (messageId) => {
    try {
      await withLegacyStudentsFallback((resolvedChannel) =>
        axios.delete(`${baseUrl}/api/group-chat/${resolvedChannel}/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete message");
    }
  };

  useEffect(() => {
    if (typeof onSeen === "function") onSeen();
  }, [messages.length, onSeen]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      setSending(true);
      const { data } = await withLegacyStudentsFallback((resolvedChannel) =>
        axios.post(
          `${baseUrl}/api/group-chat/${resolvedChannel}/messages`,
          { text: text.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      if (data?.message) setMessages((prev) => [...prev, data.message]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?.id || currentUser?._id;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Group Chat
      </Typography>

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

      <Box
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
        ) : messages.length === 0 ? (
          <Typography>No messages yet. Start the conversation.</Typography>
        ) : (
          messages.map((msg, index) => {
            const mine =
              String(msg?.senderId?._id || msg?.senderId) === String(currentUserId);
            const senderName = msg?.senderId?.fullName || "User";
            const senderRole = msg?.senderId?.role || "";
            const canEdit = mine && canEditMessage(msg);
            const canDelete = mine;
            const currentDay = formatDayLabel(msg?.createdAt || msg?.updatedAt);
            const prev = messages[index - 1];
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
                      maxWidth: "80%",
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: mine ? "#10b981" : "#e2e8f0",
                      color: mine ? "white" : "#0f172a",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        mb: 0.3,
                        opacity: mine ? 0.9 : 1,
                      }}
                    >
                      {mine ? `You (${senderRole || "user"})` : `${senderName} (${senderRole || "user"})`}
                    </Typography>
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
                      <Typography sx={{ fontSize: 14 }}>{msg.text}</Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: 10,
                        opacity: mine ? 0.9 : 0.75,
                        textAlign: "right",
                        mt: 0.5,
                      }}
                    >
                      {formatTimeLabel(msg?.createdAt || msg?.updatedAt)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
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
                          onClick={() => removeMessage(msg._id)}
                          startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                          sx={{ minWidth: 0, px: 1 }}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </React.Fragment>
            );
          })
        )}
      </Box>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
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
