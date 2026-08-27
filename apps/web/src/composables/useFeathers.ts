import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import authentication from '@feathersjs/authentication-client';
import io from 'socket.io-client';

let feathersClientInstance: any = null;
let socketInstance: any = null;

export const useFeathers = () => {
  if (!feathersClientInstance) {
    let wsUrl = 'ws://localhost:3030';
    if (typeof window !== 'undefined' && window.location) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      wsUrl = `${protocol}//${hostname}:3030`;
    }

    socketInstance = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    feathersClientInstance = feathers();
    feathersClientInstance.configure(socketio(socketInstance));

    // Session-Scoped Security Storage Adapter:
    // Uses sessionStorage by default so closing the browser/tab immediately destroys the session.
    // Only persists to localStorage if 'rememberMe' is explicitly set.
    const storageAdapter = {
      getItem(key: string): string | null {
        if (typeof window === 'undefined') return null;
        try {
          const isRemembered = window.localStorage.getItem('rememberMe') === 'true';
          if (isRemembered) {
            return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
          }
          return window.sessionStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem(key: string, value: string): void {
        if (typeof window === 'undefined') return;
        try {
          const isRemembered = window.localStorage.getItem('rememberMe') === 'true';
          if (isRemembered) {
            window.localStorage.setItem(key, value);
          } else {
            // Remove persistent token to prevent cross-session leaks
            window.localStorage.removeItem(key);
            window.sessionStorage.setItem(key, value);
          }
        } catch {
          // ignore
        }
      },
      removeItem(key: string): void {
        if (typeof window === 'undefined') return;
        try {
          window.localStorage.removeItem(key);
          window.sessionStorage.removeItem(key);
        } catch {
          // ignore
        }
      },
    };

    feathersClientInstance.configure(
      authentication({
        storage: storageAdapter,
        path: '/authentication',
        jwtStrategy: 'jwt',
      })
    );

    socketInstance.on('connect_error', (error: any) => {
      console.warn('Socket.io connection warning:', error?.message || error);
    });
  }

  return {
    client: feathersClientInstance,
    socket: socketInstance,
    service: (name: string) => feathersClientInstance.service(name),
  };
};
