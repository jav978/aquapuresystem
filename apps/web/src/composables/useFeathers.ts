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

    const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
    feathersClientInstance.configure(
      authentication({
        storage,
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
