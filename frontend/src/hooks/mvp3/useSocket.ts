// frontend/src/hooks/mvp3/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  token?: string;
  serverUrl?: string;
}

interface SocketState {
  connected: boolean;
  error: string | null;
  socket: Socket | null;
}

export const useSocket = ({ token, serverUrl }: UseSocketOptions = {}) => {
  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
    error: null,
    socket: null
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const url = serverUrl || 'http://localhost:3000';
    
    // Create socket connection
    const socket = io(url, {
      auth: {
        token
      },
      withCredentials: true
    });

    socketRef.current = socket;
    setSocketState(prev => ({ ...prev, socket }));

    // Event listeners
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketState(prev => ({
        ...prev,
        connected: true,
        error: null
      }));
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketState(prev => ({
        ...prev,
        connected: false,
        error: `Disconnected: ${reason}`
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketState(prev => ({
        ...prev,
        connected: false,
        error: `Connection error: ${error.message}`
      }));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setSocketState(prev => ({
        ...prev,
        error: error
      }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketState({
        connected: false,
        error: null,
        socket: null
      });
    };
  }, [token, serverUrl]);

  return {
    socket: socketRef.current,
    connected: socketState.connected,
    error: socketState.error
  };
};

export default useSocket;