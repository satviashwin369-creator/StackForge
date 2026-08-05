"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuthToken } from "@/lib/api-client";
import { getWsBaseUrl } from "@/lib/api/config";
import { logsService } from "@/lib/api/services";
import type { LogEntry } from "@/lib/types/models";

interface UseLiveLogsOptions {
  deploymentId?: string;
  pollIntervalMs?: number;
  enableWebSocket?: boolean;
}

export function useLiveLogs({
  deploymentId,
  pollIntervalMs = 4000,
  enableWebSocket = true,
}: UseLiveLogsOptions = {}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = deploymentId
        ? await logsService.getForDeployment(deploymentId)
        : await logsService.getRecent(100);
      setLogs(res.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    setLoading(true);
    void fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const id = setInterval(() => void fetchLogs(), pollIntervalMs);
    return () => clearInterval(id);
  }, [fetchLogs, pollIntervalMs]);

  useEffect(() => {
    if (!enableWebSocket || !deploymentId) return;

    const token = getAuthToken();
    const wsUrl = `${getWsBaseUrl()}/ws/logs/${deploymentId}${token ? `?token=${token}` : ""}`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setLive(true);
      ws.onclose = () => setLive(false);
      ws.onerror = () => setLive(false);
      ws.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data) as LogEntry;
          setLogs((prev) => {
            if (prev.some((l) => l.id === entry.id)) return prev;
            return [...prev, entry].slice(-500);
          });
        } catch {
          /* ignore malformed frames */
        }
      };
    } catch {
      setLive(false);
    }

    return () => {
      ws?.close();
      setLive(false);
    };
  }, [deploymentId, enableWebSocket]);

  return { logs, loading, error, live, refetch: fetchLogs };
}
