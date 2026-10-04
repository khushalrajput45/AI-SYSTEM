import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setLiveNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const s = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('⚡ [Socket Connected]:', s.id);
    });

    s.on('notification:new', (notif) => {
      setLiveNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
      showToast({
        title: notif.title,
        message: notif.message,
        type: 'info',
      });
    });

    s.on('incident:status_changed', (data) => {
      showToast({
        title: `Incident Status Updated`,
        message: `Incident #${data.incidentNumber} is now ${data.status}`,
        type: 'success',
      });
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Join rooms whenever user changes
  useEffect(() => {
    if (socket && user) {
      socket.emit('join:user', user._id);
      socket.emit('join:role', user.role);
      if (user.department?._id) {
        socket.emit('join:department', user.department._id);
      }
    }
  }, [socket, user]);

  const showToast = (toast) => {
    setToastMessage(toast);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const clearAllNotifications = async () => {
    try {
      setLiveNotifications([]);
      setUnreadCount(0);
      await api.delete('/notifications/clear');
    } catch (err) {
      console.warn('Failed to clear notifications:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      setUnreadCount(0);
      setLiveNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveNotifications,
        unreadCount,
        toastMessage,
        setToastMessage,
        markAllAsRead,
        clearAllNotifications,
        fetchNotifications,
      }}
    >
      {children}
      {/* Real-Time Live Toast Floating Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-emerald-500/40 text-slate-100 p-4 rounded-xl shadow-2xl backdrop-blur-md animate-bounce">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              ⚡
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-emerald-400">
                {toastMessage.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 whitespace-pre-line">
                {toastMessage.message}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
