import React, { createContext, useState, useCallback, useRef, useEffect } from "react";
import { APP_CONFIG } from "@/constants/app.constants";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (message: string, type: Notification["type"]) => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, type: Notification["type"]) => {
      const id = crypto?.randomUUID()||Math.random().toString(36).substring(2, 15);
      setNotifications((prev) => {
        const next = [...prev, { id, message, type }];
        return next.length > 3 ? next.slice(-3) : next;
      });
      const timer = setTimeout(() => removeNotification(id), APP_CONFIG.toastDuration);
      timersRef.current.set(id, timer);
    },
    [removeNotification]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify }}>
      {children}
    </NotificationContext.Provider>
  );
};
