"use client";

import { useState, useEffect } from "react";
import { Bell, X, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Notifications({ isOpen, onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?page=${pageNum}`);
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }
        setHasMore(pageNum < data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false);
      setPage(1);
    }
  }, [isOpen]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast({
          title: "Sucesso",
          description: "Todas as notificações foram marcadas como lidas.",
        });
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      });
      if (response.ok) {
        setNotifications([]);
        toast({
          title: "Sucesso",
          description: "Todas as notificações foram removidas.",
        });
      }
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-professional bg-gray-100 dark:bg-neutral-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <Badge variant="destructive">
                  {notifications.filter((n) => !n.isRead).length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={notifications.filter((n) => !n.isRead).length === 0}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <Empty>
                  <EmptyMedia variant="icon">
                    <Bell className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>Nenhuma notificação</EmptyTitle>
                  <EmptyDescription>
                    Você será notificado quando houver novas atividades, como
                    confirmações de compra ou zeramento de dívidas.
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.isRead
                          ? "bg-muted/50 border-muted"
                          : "bg-background border-border hover:bg-muted/50"
                      }`}
                      onClick={() =>
                        !notification.isRead && markAsRead(notification.id)
                      }
                    >
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                      <p className="text-sm">{notification.message}</p>
                    </div>
                  ))}
                  {hasMore && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? "Carregando..." : "Mostrar mais"}
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
