import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatRoom, ChatUser, TaskWithAnalysis } from '../types';
import {
  getOrCreateChatUser,
  loadSavedPrivateRooms,
  savePrivateRooms,
  getDMRoomId,
} from '../utils/chatStorage';
import { ChatProfileModal } from './ChatProfileModal';
import { CreatePrivateRoomModal } from './CreatePrivateRoomModal';
import { OnlineUsersModal } from './OnlineUsersModal';
import {
  ChevronLeft,
  Send,
  Users,
  HelpCircle,
  Sparkles,
  BookOpen,
  Settings,
  Tag,
  X,
  Radio,
  Lock,
  Plus,
  Copy,
  Check,
  LogOut,
  MessageSquare,
  Shield,
  Share2,
} from 'lucide-react';

interface ChatScreenProps {
  onGoHome: () => void;
  onGoPlanner: () => void;
  activeTasks: TaskWithAnalysis[];
}

const DEFAULT_ROOMS: ChatRoom[] = [
  {
    id: 'general',
    name: '🌐 ห้องรวมสาธารณะ (คุยทุกคน)',
    description: 'ช่องแชทสาธารณะ ทุกคนที่มีลิ้งก์แอปเข้ามาอ่านและคุยกันได้ทันทีแบบสดๆ',
    icon: 'BookOpen',
  },
  {
    id: 'study-help',
    name: 'ติว & ปรึกษาโจทย์',
    description: 'ติดตรงไหน มาถามเพื่อนๆ ในแอปได้เลย',
    icon: 'HelpCircle',
  },
  {
    id: 'motivation',
    name: 'เติมไฟ & กำลังใจ',
    description: 'แชร์เป้าหมายส่งงาน ให้กำลังใจคนกำลังปั่นงาน',
    icon: 'Sparkles',
  },
];

const QUICK_PHRASES = [
  '💪 สู้ๆ ไปด้วยกันนะทุกคน!',
  '🙋‍♀️ มีใครทำวิชานี้เสร็จแล้วบ้าง?',
  '🎉 เพิ่งปั่นเสร็จไปอีกหนึ่งชิ้น!',
  '☕ แวะมาพักสายตาสัก 5 นาที',
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onGoHome,
  onGoPlanner,
  activeTasks,
}) => {
  const [currentUser, setCurrentUser] = useState<ChatUser>(() => getOrCreateChatUser());
  const [privateRooms, setPrivateRooms] = useState<ChatRoom[]>(() => loadSavedPrivateRooms());
  const [activeRoomId, setActiveRoomId] = useState<string>('general');
  const [roomTab, setRoomTab] = useState<'public' | 'private'>('public');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string; avatar: string; color: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadRoomIds, setUnreadRoomIds] = useState<string[]>([]);

  const [selectedTaskTag, setSelectedTaskTag] = useState<{ subject: string; title?: string } | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePrivateOpen, setIsCreatePrivateOpen] = useState(false);
  const [isOnlineUsersOpen, setIsOnlineUsersOpen] = useState(false);
  const [selectedPeerAction, setSelectedPeerAction] = useState<{ id: string; name: string; avatar: string; color: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // All known rooms combined
  const allRooms = [...DEFAULT_ROOMS, ...privateRooms];
  const currentRoom = allRooms.find((r) => r.id === activeRoomId) || DEFAULT_ROOMS[0];

  // Auto-scroll to bottom of messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Fetch initial room messages via REST
  const fetchRoomMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(roomId)}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);
        setTimeout(() => scrollToBottom(false), 50);
      }
    } catch (e) {
      console.warn('Could not fetch messages via REST:', e);
    }
  };

  // WebSocket Connection
  useEffect(() => {
    let isUnmounted = false;

    const connectWebSocket = () => {
      if (typeof window === 'undefined') return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          setIsConnected(true);
          ws.send(
            JSON.stringify({
              type: 'join',
              roomId: activeRoomId,
              user: currentUser,
            })
          );
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
              if (data.roomId === activeRoomId && Array.isArray(data.messages)) {
                setMessages(data.messages);
                setTimeout(() => scrollToBottom(false), 50);
              }
              if (typeof data.onlineCount === 'number') {
                setOnlineCount(data.onlineCount);
              }
            } else if (data.type === 'new_message') {
              const incomingMsg: ChatMessage = data.message;

              // If it's for the currently active room, add to list
              if (data.roomId === activeRoomId) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === incomingMsg.id)) {
                    return prev;
                  }
                  return [...prev, incomingMsg];
                });
                setTimeout(() => scrollToBottom(true), 50);
              } else {
                // Mark unread for other rooms
                setUnreadRoomIds((prev) => Array.from(new Set([...prev, data.roomId])));

                // If incoming DM is from someone not in our private rooms yet, auto-add the DM room
                if (data.roomId.startsWith('dm_') && incomingMsg.senderId !== currentUser.id) {
                  setPrivateRooms((prev) => {
                    if (prev.some((r) => r.id === data.roomId)) return prev;
                    const newDMRoom: ChatRoom = {
                      id: data.roomId,
                      name: incomingMsg.senderName,
                      description: `แชทส่วนตัว 1:1 กับ ${incomingMsg.senderName}`,
                      isPrivate: true,
                      peerUser: {
                        id: incomingMsg.senderId,
                        name: incomingMsg.senderName,
                        avatar: incomingMsg.senderAvatar,
                        color: incomingMsg.senderColor,
                      },
                    };
                    const updated = [newDMRoom, ...prev];
                    savePrivateRooms(updated);
                    return updated;
                  });
                }
              }
            } else if (data.type === 'presence') {
              if (typeof data.count === 'number') {
                setOnlineCount(data.count);
              }
              if (Array.isArray(data.users)) {
                setOnlineUsers(data.users);
              }
            }
          } catch (err) {
            console.error('Error parsing WS message:', err);
          }
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          if (isUnmounted) return;
          setIsConnected(false);
        };
      } catch (err) {
        console.error('WS Connection error:', err);
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      }
    };

    fetchRoomMessages(activeRoomId);
    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [activeRoomId]);

  // When room changes, notify socket and reload messages
  const handleSwitchRoom = (newRoomId: string) => {
    setActiveRoomId(newRoomId);
    // Clear unread indicator
    setUnreadRoomIds((prev) => prev.filter((id) => id !== newRoomId));

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'switch_room',
          roomId: newRoomId,
          user: currentUser,
        })
      );
    } else {
      fetchRoomMessages(newRoomId);
    }
  };

  // Add / Join Private Room
  const handleJoinPrivateRoom = (newRoom: ChatRoom) => {
    setPrivateRooms((prev) => {
      const filtered = prev.filter((r) => r.id !== newRoom.id);
      const updated = [newRoom, ...filtered];
      savePrivateRooms(updated);
      return updated;
    });
    setRoomTab('private');
    handleSwitchRoom(newRoom.id);
  };

  // Start 1:1 Direct Message with an online or chat peer
  const handleStartDM = (peer: { id: string; name: string; avatar: string; color: string }) => {
    if (peer.id === currentUser.id) return;
    const dmRoomId = getDMRoomId(currentUser.id, peer.id);
    const existing = privateRooms.find((r) => r.id === dmRoomId);

    const dmRoom: ChatRoom = existing || {
      id: dmRoomId,
      name: peer.name,
      description: `แชทส่วนตัว 1:1 กับ ${peer.name}`,
      isPrivate: true,
      peerUser: {
        id: peer.id,
        name: peer.name,
        avatar: peer.avatar,
        color: peer.color,
      },
    };

    if (!existing) {
      const updated = [dmRoom, ...privateRooms];
      setPrivateRooms(updated);
      savePrivateRooms(updated);
    }

    setRoomTab('private');
    handleSwitchRoom(dmRoomId);
    setSelectedPeerAction(null);
  };

  // Leave / Delete a private room from local list
  const handleLeavePrivateRoom = (roomId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = privateRooms.filter((r) => r.id !== roomId);
    setPrivateRooms(updated);
    savePrivateRooms(updated);

    if (activeRoomId === roomId) {
      handleSwitchRoom('general');
      setRoomTab('public');
    }
  };

  const handleCopyRoomCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyChatLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);

    const payload = {
      roomId: activeRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderColor: currentUser.color,
      text,
      taskTag: selectedTaskTag || undefined,
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'message',
          ...payload,
        })
      );
      setInputText('');
      setSelectedTaskTag(null);
      setShowTaskSelector(false);
      setIsSending(false);
    } else {
      try {
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const newMsg: ChatMessage = await res.json();
          setMessages((prev) => [...prev, newMsg]);
          setInputText('');
          setSelectedTaskTag(null);
          setShowTaskSelector(false);
          setTimeout(() => scrollToBottom(true), 50);
        }
      } catch (err) {
        console.error('Failed to post message:', err);
      } finally {
        setIsSending(false);
      }
    }
  };

  const formatMessageTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div id="chat-screen" className="w-full flex flex-col h-[calc(100vh-5rem)] max-h-[850px] relative">
      {/* Top Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#DDE3EE] dark:border-[#2A3555] mb-2 shrink-0">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-1.5 text-sm font-medium text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white transition py-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>หน้าแรก</span>
        </button>

        {/* Top Controls: Share link, Presence & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Share App/Chat Link Button */}
          <button
            type="button"
            onClick={handleCopyChatLink}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer shadow-2xs"
            title="คัดลอกลิ้งก์ชวนเพื่อนเข้ามาคุยในแชท"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">คัดลอกแล้ว!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ชวนเพื่อน</span>
                <span className="sm:hidden">แชร์</span>
              </>
            )}
          </button>

          {/* Online Peers Button */}
          <button
            type="button"
            onClick={() => setIsOnlineUsersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer shadow-2xs"
            title="ดูเพื่อนที่ออนไลน์ & แชทส่วนตัว"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-3.5 h-3.5" />
            <span>ออนไลน์ {onlineCount} คน</span>
          </button>

          {/* User Profile Button */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-xs font-semibold text-[#15203B] dark:text-white hover:bg-slate-50 dark:hover:bg-[#1F2C4D] transition shadow-2xs"
            title="เปลี่ยนชื่อ / อวตาร"
          >
            <span>{currentUser.avatar}</span>
            <span className="max-w-[75px] sm:max-w-[110px] truncate">{currentUser.name}</span>
            <Settings className="w-3.5 h-3.5 text-[#65708A] dark:text-[#9AA7C4]" />
          </button>
        </div>
      </div>

      {/* Room Category Tabs: Public vs Private Rooms */}
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#131B2E] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setRoomTab('public');
              if (currentRoom.isPrivate) {
                handleSwitchRoom('general');
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              roomTab === 'public'
                ? 'bg-white dark:bg-[#1E2947] text-[#15203B] dark:text-white shadow-xs'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#1F9D8B]" />
            <span>ห้องสาธารณะ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoomTab('private');
              if (!currentRoom.isPrivate && privateRooms.length > 0) {
                handleSwitchRoom(privateRooms[0].id);
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 relative ${
              roomTab === 'private'
                ? 'bg-white dark:bg-[#1E2947] text-[#15203B] dark:text-white shadow-xs'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>ห้องส่วนตัว & DM</span>
            {privateRooms.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400">
                {privateRooms.length}
              </span>
            )}
            {unreadRoomIds.some((id) => privateRooms.some((r) => r.id === id)) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>

        {/* Action Button: Create Private Room */}
        <button
          type="button"
          onClick={() => setIsCreatePrivateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition text-xs font-semibold shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>สร้าง/ใส่รหัสห้องส่วนตัว</span>
        </button>
      </div>

      {/* Room Pills row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 no-scrollbar">
        {roomTab === 'public' ? (
          DEFAULT_ROOMS.map((room) => {
            const isActive = room.id === activeRoomId;
            const hasUnread = unreadRoomIds.includes(room.id);
            const Icon =
              room.id === 'study-help' ? HelpCircle : room.id === 'motivation' ? Sparkles : BookOpen;

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => handleSwitchRoom(room.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap relative ${
                  isActive
                    ? 'bg-[#15203B] dark:bg-[#E8EDF8] text-white dark:text-[#0E1424] shadow-xs'
                    : 'bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{room.name}</span>
                {hasUnread && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                )}
              </button>
            );
          })
        ) : privateRooms.length === 0 ? (
          <div className="py-1 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <span>ยังไม่มีห้องส่วนตัว</span>
            <button
              type="button"
              onClick={() => setIsCreatePrivateOpen(true)}
              className="underline font-bold text-amber-800 dark:text-amber-200"
            >
              + สร้างห้องด้วยรหัส หรือกดคุยส่วนตัวกับเพื่อนออนไลน์
            </button>
          </div>
        ) : (
          privateRooms.map((room) => {
            const isActive = room.id === activeRoomId;
            const hasUnread = unreadRoomIds.includes(room.id);
            const isDM = !!room.peerUser;

            return (
              <div
                key={room.id}
                className={`flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap relative shrink-0 border ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-[#172038] border-[#DDE3EE] dark:border-[#2A3555] text-[#15203B] dark:text-white hover:border-amber-400'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSwitchRoom(room.id)}
                  className="flex items-center gap-1.5"
                >
                  {isDM ? (
                    <span className="text-sm">{room.peerUser?.avatar || '👤'}</span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span className="max-w-[120px] truncate">{room.name}</span>
                  {hasUnread && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleLeavePrivateRoom(room.id, e)}
                  className={`p-1 rounded-md hover:bg-black/15 transition ml-1 ${
                    isActive ? 'text-white/80 hover:text-white' : 'text-[#65708A] hover:text-red-500'
                  }`}
                  title="ออกจากห้องส่วนตัวนี้"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Room Information & Secret Code Banner */}
      <div
        className={`px-3.5 py-2.5 rounded-2xl mb-2 flex items-center justify-between text-xs shrink-0 border ${
          currentRoom.isPrivate
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
            : 'bg-slate-100/70 dark:bg-[#151D33] border-[#DDE3EE]/60 dark:border-[#2A3555]/60 text-[#65708A] dark:text-[#9AA7C4]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {currentRoom.isPrivate ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {currentRoom.peerUser ? 'แชทส่วนตัว 1:1' : 'ห้องส่วนตัวลับ'}
              </span>
              <span className="font-bold text-[#15203B] dark:text-white truncate">
                {currentRoom.name}
              </span>
              {currentRoom.roomCode && (
                <div className="flex items-center gap-1 bg-white/80 dark:bg-[#12192c]/80 px-2 py-0.5 rounded-lg border border-amber-400/40 text-amber-700 dark:text-amber-300 font-mono text-[11px]">
                  <span>รหัส: {currentRoom.roomCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRoomCode(currentRoom.roomCode!)}
                    className="hover:text-amber-900 dark:hover:text-white ml-0.5"
                    title="คัดลอกรหัสห้อง"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 truncate">
              {currentRoom.id === 'general' && (
                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] shrink-0">
                  สาธารณะ
                </span>
              )}
              <span className="truncate">{currentRoom.description}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2 font-medium ml-2">
          {currentRoom.isPrivate && (
            <button
              type="button"
              onClick={() => handleLeavePrivateRoom(currentRoom.id)}
              className="text-[11px] text-[#65708A] dark:text-[#9AA7C4] hover:text-red-500 flex items-center gap-1 transition"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">ออกจากห้อง</span>
            </button>
          )}

          <span className="flex items-center gap-1 text-[#1F9D8B]">
            <Radio className="w-3 h-3 text-[#1F9D8B]" />
            <span className="hidden sm:inline">{isConnected ? 'เชื่อมต่อสด' : 'กำลังเชื่อมต่อ...'}</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 py-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 ${
                currentRoom.isPrivate ? 'bg-amber-500/15 text-amber-500' : 'bg-[#1F9D8B]/10 text-[#1F9D8B]'
              }`}
            >
              {currentRoom.isPrivate ? '🔒' : '💬'}
            </div>
            <h3 className="text-sm font-bold text-[#15203B] dark:text-white">
              {currentRoom.isPrivate
                ? `ยินดีต้อนรับสู่ ${currentRoom.name}`
                : 'ยังไม่มีข้อความในห้องนี้'}
            </h3>
            <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-1 max-w-xs">
              {currentRoom.isPrivate
                ? currentRoom.roomCode
                  ? `ห้องนี้เป็นส่วนตัวเฉพาะผู้มีรหัส ${currentRoom.roomCode} ส่งรหัสให้เพื่อนเพื่อเริ่มคุยกันได้เลย!`
                  : 'เริ่มต้นพิมพ์ข้อความสนทนาส่วนตัวกันได้เลย!'
                : 'ทักทายเพื่อนๆ หรือพิมพ์ถามการบ้านเพื่อเปิดบทสนทนาได้เลย!'}
            </p>
            {currentRoom.isPrivate && currentRoom.roomCode && (
              <button
                type="button"
                onClick={() => handleCopyRoomCode(currentRoom.roomCode!)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold shadow-xs hover:bg-amber-600 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'คัดลอกรหัสแล้ว' : 'คัดลอกรหัสห้องส่งให้เพื่อน'}</span>
              </button>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar with click to DM */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isSelf) {
                      setSelectedPeerAction({
                        id: msg.senderId,
                        name: msg.senderName,
                        avatar: msg.senderAvatar,
                        color: msg.senderColor,
                      });
                    }
                  }}
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-base shadow-2xs select-none transition ${
                    !isSelf ? 'hover:scale-105 cursor-pointer ring-1 ring-transparent hover:ring-[#1F9D8B]' : ''
                  }`}
                  style={{
                    backgroundColor: `${msg.senderColor || '#1F9D8B'}20`,
                    border: `1.5px solid ${msg.senderColor || '#1F9D8B'}`,
                  }}
                  title={!isSelf ? `กดเพื่อแชทส่วนตัวกับ ${msg.senderName}` : 'คุณ'}
                >
                  {msg.senderAvatar || '🎓'}
                </button>

                {/* Message Content Bubble */}
                <div
                  className={`max-w-[82%] sm:max-w-[70%] flex flex-col ${
                    isSelf ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Name & Time */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {!isSelf ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPeerAction({
                            id: msg.senderId,
                            name: msg.senderName,
                            avatar: msg.senderAvatar,
                            color: msg.senderColor,
                          });
                        }}
                        className="text-[11px] font-semibold text-[#65708A] dark:text-[#9AA7C4] hover:text-[#1F9D8B] hover:underline"
                      >
                        {msg.senderName}
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#65708A] dark:text-[#9AA7C4]">
                        คุณ
                      </span>
                    )}
                    <span className="text-[10px] text-[#A3ACBF] dark:text-[#6F7B99]">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Task Tag pill if present */}
                  {msg.taskTag && (
                    <div
                      className={`mb-1 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border shadow-2xs ${
                        isSelf
                          ? 'bg-[#1F9D8B]/15 text-[#1F9D8B] border-[#1F9D8B]/30'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <Tag className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        วิชา: {msg.taskTag.subject}
                        {msg.taskTag.title ? ` • ${msg.taskTag.title}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-xs ${
                      isSelf
                        ? currentRoom.isPrivate
                          ? 'bg-amber-500 text-white rounded-tr-xs'
                          : 'bg-[#1F9D8B] text-white rounded-tr-xs'
                        : 'bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#15203B] dark:text-[#E8EDF8] rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions & Task tag bar */}
      <div className="pt-2 shrink-0">
        {/* Quick Task Tag selector */}
        {showTaskSelector && (
          <div className="mb-2 p-3 rounded-2xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] shadow-lg animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#15203B] dark:text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#1F9D8B]" />
                เลือกงานที่ต้องการแท็กถามเพื่อน:
              </span>
              <button
                type="button"
                onClick={() => setShowTaskSelector(false)}
                className="text-[#65708A] hover:text-[#15203B] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {activeTasks.length === 0 ? (
              <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] py-1">
                คุณยังไม่มีงานที่บันทึกไว้ในแอป{' '}
                <button
                  type="button"
                  onClick={onGoPlanner}
                  className="text-[#1F9D8B] underline font-medium"
                >
                  ไปเพิ่มงาน
                </button>
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {activeTasks.map(({ task }) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      setSelectedTaskTag({ subject: task.subject, title: task.title });
                      setShowTaskSelector(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#12192c] border border-[#DDE3EE] dark:border-[#2A3555] text-[#15203B] dark:text-white hover:border-[#1F9D8B] hover:text-[#1F9D8B] transition text-left truncate max-w-full"
                  >
                    {task.subject}
                    {task.title ? ` • ${task.title}` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Task Tag Pill */}
        {selectedTaskTag && (
          <div className="flex items-center gap-1.5 mb-2 px-3 py-1 rounded-xl bg-[#1F9D8B]/10 border border-[#1F9D8B]/30 text-xs text-[#1F9D8B] font-semibold w-fit">
            <Tag className="w-3.5 h-3.5" />
            <span>
              แท็ก: {selectedTaskTag.subject}
              {selectedTaskTag.title ? ` • ${selectedTaskTag.title}` : ''}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTaskTag(null)}
              className="hover:text-red-500 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setShowTaskSelector((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border transition whitespace-nowrap shrink-0 ${
              selectedTaskTag
                ? 'bg-[#1F9D8B] text-white border-[#1F9D8B]'
                : 'bg-white dark:bg-[#172038] border-[#DDE3EE] dark:border-[#2A3555] text-[#15203B] dark:text-white hover:bg-slate-50 dark:hover:bg-[#1F2C4D]'
            }`}
          >
            <Tag className="w-3 h-3 text-[#1F9D8B]" />
            <span>แท็กการบ้าน</span>
          </button>

          {QUICK_PHRASES.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => setInputText((prev) => (prev ? `${prev} ${phrase}` : phrase))}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white whitespace-nowrap shrink-0 transition hover:bg-slate-50 dark:hover:bg-[#1F2C4D]"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Input & Send Form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={inputText}
            maxLength={400}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentRoom.isPrivate
                ? `พิมพ์คุยใน ${currentRoom.name}...`
                : `ส่งข้อความใน ${currentRoom.name}...`
            }
            className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-sm text-[#15203B] dark:text-white placeholder-[#8E9BB5] focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] shadow-xs"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shrink-0 ${
              currentRoom.isPrivate
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-[#15203B] dark:bg-[#1F9D8B]'
            }`}
            aria-label="ส่งข้อความ"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Peer Action Modal (When clicking a user avatar in chat) */}
      {selectedPeerAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-xs bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-3xl p-5 shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPeerAction(null)}
              className="absolute top-4 right-4 text-[#65708A] hover:text-[#15203B] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow-xs"
              style={{
                backgroundColor: `${selectedPeerAction.color || '#1F9D8B'}20`,
                border: `2px solid ${selectedPeerAction.color || '#1F9D8B'}`,
              }}
            >
              {selectedPeerAction.avatar}
            </div>

            <h3 className="text-base font-bold text-[#15203B] dark:text-white">
              {selectedPeerAction.name}
            </h3>
            <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-0.5">
              เพื่อนร่วมชั้นในแอปจอมมาร
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleStartDM(selectedPeerAction)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1F9D8B] hover:bg-[#1F9D8B]/90 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>เปิดแชทส่วนตัว 1:1 กับเพื่อนคนนี้</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeerAction(null)}
                className="w-full py-2 text-xs text-[#65708A] dark:text-[#9AA7C4] hover:underline"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Join Private Room Modal */}
      <CreatePrivateRoomModal
        isOpen={isCreatePrivateOpen}
        onClose={() => setIsCreatePrivateOpen(false)}
        onJoinRoom={handleJoinPrivateRoom}
      />

      {/* Online Users & Direct Messages Modal */}
      <OnlineUsersModal
        isOpen={isOnlineUsersOpen}
        currentUser={currentUser}
        onlineUsers={onlineUsers}
        onClose={() => setIsOnlineUsersOpen(false)}
        onStartDM={handleStartDM}
        onOpenCreatePrivate={() => setIsCreatePrivateOpen(true)}
      />

      {/* Profile Edit Modal */}
      <ChatProfileModal
        isOpen={isProfileOpen}
        currentUser={currentUser}
        onClose={() => setIsProfileOpen(false)}
        onSave={(updated) => {
          setCurrentUser(updated);
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                type: 'join',
                roomId: activeRoomId,
                user: updated,
              })
            );
          }
        }}
      />
    </div>
  );
};
