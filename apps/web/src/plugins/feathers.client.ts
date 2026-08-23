import { defineNuxtPlugin } from '#app';
import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import authentication from '@feathersjs/authentication-client';
import io from 'socket.io-client';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const socket = io(config.public.wsUrl || 'ws://localhost:3030', {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  const client = feathers();
  client.configure(socketio(socket));
  client.configure(authentication({
    storage: window.localStorage,
    path: '/authentication',
    jwtStrategy: 'jwt',
  }));

  // Auto-reconnect handling
  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    // Re-authenticate if needed
    client.authenticate().catch(() => {
      // Ignore auth errors on reconnect
    });
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  nuxtApp.provide('feathersClient', client);
  nuxtApp.provide('socket', socket);

  return {
    provide: {
      feathersClient: client,
      socket,
    },
  });
});