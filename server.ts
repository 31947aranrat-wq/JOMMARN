import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'chat-messages.json');

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  text: string;
  timestamp: number;
  taskTag?: {
    subject: string;
    title?: string;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const DEFAULT_ROOMS: ChatRoom[] = [
  {
    id: 'general',
    name: 'ห้องคุยทั่วไป / การบ้าน',
    description: 'พูดคุย แลกเปลี่ยน ถาม-ตอบ เรื่องการบ้านทุกวิชา',
    icon: 'BookOpen',
  },
  {
    id: 'study-help',
    name: 'ห้องติว & ปรึกษาโจทย์',
    description: 'ติดตรงไหน มาถามเพื่อนๆ ในแอปได้เลย',
    icon: 'HelpCircle',
  },
  {
    id: 'motivation',
    name: 'ห้องเติมไฟ & กำลังใจ',
    description: 'แชร์เป้าหมายส่งงาน ให้กำลังใจคนกำลังปั่นงาน',
    icon: 'Sparkles',
  },
];

// Ensure data folder and file exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadInitialMessages(): ChatMessage[] {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read messages file, using seed data:', err);
  }

  const now = Date.now();
  const seedMessages: ChatMessage[] = [
    {
      id: 'msg-seed-1',
      roomId: 'general',
      senderId: 'user-system',
      senderName: 'Jommarn Bot',
      senderAvatar: '🤖',
      senderColor: '#1F9D8B',
      text: 'ยินดีต้อนรับสู่ห้องแชทของชาว Jommarn! 🚀 แลกเปลี่ยนเรื่องการบ้านและให้กำลังใจกันได้ที่นี่เลย',
      timestamp: now - 3600000 * 2,
    },
    {
      id: 'msg-seed-2',
      roomId: 'general',
      senderId: 'user-peer-1',
      senderName: 'ข้าวหอม (ม.5)',
      senderAvatar: '🌸',
      senderColor: '#E5484D',
      text: 'มีใครทำฟิสิกส์การเคลื่อนที่เสร็จแล้วบ้างคะ ยากมากเลยย 😭',
      timestamp: now - 3600000 * 1.5,
      taskTag: {
        subject: 'ฟิสิกส์',
        title: 'การเคลื่อนที่แนวตรง',
      },
    },
    {
      id: 'msg-seed-3',
      roomId: 'general',
      senderId: 'user-peer-2',
      senderName: 'บอส พลังใบ',
      senderAvatar: '⚡',
      senderColor: '#F5A623',
      text: 'แนะนำให้เริ่มแบ่งทำวันละ 20 นาทีตามที่แอปแนะนำเลยครับ ช่วยลดความลนได้เยอะมาก สู้ๆ นะทุกคน!',
      timestamp: now - 1800000,
    },
    {
      id: 'msg-seed-4',
      roomId: 'study-help',
      senderId: 'user-peer-3',
      senderName: 'นัท คณิตคิดเร็ว',
      senderAvatar: '📐',
      senderColor: '#3B82F6',
      text: 'ใครติดโจทย์คณิตศาสตร์ แปะข้อความหรือหัวข้อไว้ได้นะ เดี๋ยวเข้ามาช่วยตอบให้ครับ',
      timestamp: now - 3600000,
    },
    {
      id: 'msg-seed-5',
      roomId: 'motivation',
      senderId: 'user-peer-4',
      senderName: 'พลอย ปั่นยันเช้า',
      senderAvatar: '🔥',
      senderColor: '#EC4899',
      text: 'วันนี้เคลียร์ไปได้ 2 วิชาแล้ว ดีใจมากก ใครยังปั่นอยู่สู้ไปด้วยกันนะคะ! 🎉',
      timestamp: now - 900000,
    },
  ];

  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(seedMessages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write initial seed messages:', err);
  }
  return seedMessages;
}

let messages: ChatMessage[] = loadInitialMessages();

function persistMessages() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist messages:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.get('/api/chat/rooms', (req, res) => {
    res.json(DEFAULT_ROOMS);
  });

  app.get('/api/chat/messages', (req, res) => {
    const roomId = (req.query.roomId as string) || 'general';
    const roomMessages = messages.filter((m) => m.roomId === roomId);
    res.json(roomMessages);
  });

  app.post('/api/chat/messages', (req, res) => {
    const { roomId, senderId, senderName, senderAvatar, senderColor, text, taskTag } = req.body;
    if (!text || !senderName) {
      return res.status(400).json({ error: 'Text and senderName are required' });
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      roomId: roomId || 'general',
      senderId: senderId || 'anon',
      senderName: String(senderName).slice(0, 30),
      senderAvatar: senderAvatar || '🎓',
      senderColor: senderColor || '#1F9D8B',
      text: String(text).slice(0, 500),
      timestamp: Date.now(),
      taskTag: taskTag
        ? {
            subject: String(taskTag.subject || '').slice(0, 40),
            title: taskTag.title ? String(taskTag.title).slice(0, 60) : undefined,
          }
        : undefined,
    };

    messages.push(newMessage);
    // Keep max 200 messages in memory/disk
    if (messages.length > 200) {
      messages = messages.slice(messages.length - 200);
    }
    persistMessages();

    // Route to appropriate WebSocket clients
    routeMessage(newMessage);

    res.status(201).json(newMessage);
  });

  app.get('/api/chat/online', (req, res) => {
    res.json({ count: connectedClients.size });
  });

  const server = http.createServer(app);

  // WebSocket Server Setup
  const wss = new WebSocketServer({ noServer: true });

  interface ClientMeta {
    ws: WebSocket;
    roomId: string;
    userId?: string;
    userName?: string;
    userAvatar?: string;
    userColor?: string;
  }

  const connectedClients = new Map<WebSocket, ClientMeta>();

  function broadcast(data: any, filterRoomId?: string) {
    const payload = JSON.stringify(data);
    connectedClients.forEach((meta, client) => {
      if (client.readyState === WebSocket.OPEN) {
        if (!filterRoomId || meta.roomId === filterRoomId) {
          client.send(payload);
        }
      }
    });
  }

  function routeMessage(newMessage: ChatMessage) {
    const payload = JSON.stringify({
      type: 'new_message',
      roomId: newMessage.roomId,
      message: newMessage,
    });

    if (newMessage.roomId.startsWith('dm_')) {
      // DM format: dm_{id1}__{id2}
      const peerIds = newMessage.roomId.replace('dm_', '').split('__');
      connectedClients.forEach((meta, client) => {
        if (client.readyState === WebSocket.OPEN) {
          // Deliver if user is in that DM room OR user ID is one of the participants
          if (meta.roomId === newMessage.roomId || (meta.userId && peerIds.includes(meta.userId))) {
            client.send(payload);
          }
        }
      });
    } else if (newMessage.roomId.startsWith('priv_')) {
      // Private room with secret code: strictly deliver to clients currently joined in this private room
      connectedClients.forEach((meta, client) => {
        if (client.readyState === WebSocket.OPEN && meta.roomId === newMessage.roomId) {
          client.send(payload);
        }
      });
    } else {
      // Public room: broadcast to all clients in this room (or all for live counters)
      connectedClients.forEach((meta, client) => {
        if (client.readyState === WebSocket.OPEN) {
          if (meta.roomId === newMessage.roomId) {
            client.send(payload);
          }
        }
      });
    }
  }

  function broadcastPresence() {
    const onlineCount = Math.max(1, connectedClients.size);
    const usersMap = new Map<string, { id: string; name: string; avatar: string; color: string }>();
    
    connectedClients.forEach((meta) => {
      if (meta.userId && meta.userName) {
        usersMap.set(meta.userId, {
          id: meta.userId,
          name: meta.userName,
          avatar: meta.userAvatar || '🎓',
          color: meta.userColor || '#1F9D8B',
        });
      }
    });

    const activeUsers = Array.from(usersMap.values()).slice(0, 50);
    const payload = JSON.stringify({
      type: 'presence',
      count: onlineCount,
      users: activeUsers,
    });

    connectedClients.forEach((_, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname === '/ws' || pathname === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // Let Vite or other handlers take non-ws upgrades if any
      // or socket.destroy()
    }
  });

  wss.on('connection', (ws) => {
    const meta: ClientMeta = { ws, roomId: 'general' };
    connectedClients.set(ws, meta);
    broadcastPresence();

    ws.on('message', (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());
        if (data.type === 'join') {
          meta.roomId = data.roomId || 'general';
          if (data.user) {
            meta.userId = data.user.id;
            meta.userName = data.user.name;
            meta.userAvatar = data.user.avatar;
            meta.userColor = data.user.color;
          }
          // Send room message history to this socket
          const roomMsgs = messages.filter((m) => m.roomId === meta.roomId);
          ws.send(
            JSON.stringify({
              type: 'init',
              roomId: meta.roomId,
              messages: roomMsgs,
              onlineCount: Math.max(1, connectedClients.size),
            })
          );
          broadcastPresence();
        } else if (data.type === 'switch_room') {
          meta.roomId = data.roomId || 'general';
          const roomMsgs = messages.filter((m) => m.roomId === meta.roomId);
          ws.send(
            JSON.stringify({
              type: 'init',
              roomId: meta.roomId,
              messages: roomMsgs,
              onlineCount: Math.max(1, connectedClients.size),
            })
          );
        } else if (data.type === 'message') {
          const { roomId, senderId, senderName, senderAvatar, senderColor, text, taskTag } = data;
          if (!text || !senderName) return;

          const newMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            roomId: roomId || meta.roomId || 'general',
            senderId: senderId || meta.userId || 'anon',
            senderName: String(senderName).slice(0, 30),
            senderAvatar: senderAvatar || meta.userAvatar || '🎓',
            senderColor: senderColor || '#1F9D8B',
            text: String(text).slice(0, 500),
            timestamp: Date.now(),
            taskTag: taskTag
              ? {
                  subject: String(taskTag.subject || '').slice(0, 40),
                  title: taskTag.title ? String(taskTag.title).slice(0, 60) : undefined,
                }
              : undefined,
          };

          messages.push(newMessage);
          if (messages.length > 200) {
            messages = messages.slice(messages.length - 200);
          }
          persistMessages();

          routeMessage(newMessage);
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
      broadcastPresence();
    });

    ws.on('error', () => {
      connectedClients.delete(ws);
      broadcastPresence();
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Jommarn App + Realtime Chat running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
