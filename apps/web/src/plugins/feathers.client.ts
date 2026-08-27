import { defineNuxtPlugin } from '#app';
import { useFeathers } from '~/composables/useFeathers';

export default defineNuxtPlugin(() => {
  const { client, socket } = useFeathers();

  return {
    provide: {
      feathersClient: client,
      socket,
    },
  };
});