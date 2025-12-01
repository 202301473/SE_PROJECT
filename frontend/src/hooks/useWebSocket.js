// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (wsUrl, onMessageCallback, onOpenCallback, onCloseCallback, onErrorCallback) => {
  const ws = useRef(null);
  const onMessageRef = useRef(onMessageCallback);
  const onOpenRef = useRef(onOpenCallback);
  const onCloseRef = useRef(onCloseCallback);
  const onErrorRef = useRef(onErrorCallback);
  const [isConnected, setIsConnected] = useState(false);

  // Update refs if callbacks change
  useEffect(() => {
    onMessageRef.current = onMessageCallback;
    onOpenRef.current = onOpenCallback;
    onCloseRef.current = onCloseCallback;
    onErrorRef.current = onErrorCallback;
  }, [onMessageCallback, onOpenCallback, onCloseCallback, onErrorCallback]);

  useEffect(() => {
    if (!wsUrl) return;

    // Close any existing connection before starting a new one
    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
        ws.current.close();
      }
      ws.current = null;
    }

    const newWs = new WebSocket(wsUrl);

    newWs.onopen = (event) => {
      setIsConnected(true);
      onOpenRef.current?.(event);
    };

    newWs.onmessage = (event) => {
      onMessageRef.current?.(event);
    };

    newWs.onerror = (event) => {
      setIsConnected(false);
      onErrorRef.current?.(event);
    };

    newWs.onclose = (event) => {
      setIsConnected(false);
      onCloseRef.current?.(event);
    };

    ws.current = newWs;

    return () => {
      // Only close if it's the WebSocket instance managed by this effect run
      if (ws.current === newWs) {
        if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
          ws.current.close();
        }
        ws.current = null;
      }
    };
  }, [wsUrl]); // Only re-run when wsUrl changes

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      // console.warn("WebSocket is not open. Message not sent:", message); // Removed console.warn
    }
  }, []);

  return { sendMessage, isConnected, wsInstance: ws.current };
};

export default useWebSocket;
