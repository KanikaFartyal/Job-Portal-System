import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconBell, IconCheck, IconDotsVertical } from '@tabler/icons-react';
import { fetchNotifications, markNotificationsRead } from '../api';

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleMarkRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/90 text-slate-200 transition hover:bg-slate-800">
        <IconBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[0.65rem] font-semibold text-white">{unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-3 w-80 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-xl shadow-black/30 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-2 pb-3">
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-xs text-slate-400">Latest activity and alerts</p>
              </div>
              <button onClick={handleMarkRead} className="rounded-full bg-slate-900/90 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-800">
                Mark all read
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
              {loading ? (
                <p className="text-sm text-slate-400">Loading notifications…</p>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-slate-400">No updates yet.</p>
              ) : (
                notifications.map((item) => (
                  <div key={item._id || item.createdAt} className="rounded-3xl border border-white/10 bg-slate-900/90 p-3 transition hover:border-amber-400/30 hover:bg-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                      </div>
                      <span className={`h-3 w-3 rounded-full ${item.read ? 'bg-slate-500' : 'bg-amber-400'}`}/>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[0.75rem] text-slate-500">
                      <IconCheck size={14} />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationMenu;
