import { injectable } from 'inversify';
import Redis from 'ioredis';
import { EventBusPort, DomainEvent, EventHandler } from '@aquasystem/application';
import { logger } from '@aquasystem/infrastructure';

@injectable()
export class RedisEventBus implements EventBusPort {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers = new Map<string, EventHandler[]>();

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.publisher = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
    this.subscriber = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });

    this.publisher.connect().catch((err) => logger.warn({ err }, 'Redis publisher connection failed, running in-memory fallback'));
    this.subscriber.connect().catch((err) => logger.warn({ err }, 'Redis subscriber connection failed, running in-memory fallback'));

    this.subscriber.on('message', async (channel, message) => {
      try {
        const event = JSON.parse(message);
        const registered = this.handlers.get(channel) || [];
        for (const handler of registered) {
          await handler(event);
        }
      } catch (err) {
        logger.error({ err }, 'Error handling redis event');
      }
    });
  }

  async publish(event: DomainEvent): Promise<void> {
    const channel = event.eventType;
    const message = JSON.stringify(event);

    // In-memory dispatch
    const registered = this.handlers.get(channel) || [];
    for (const handler of registered) {
      handler(event).catch((err) => logger.error({ err }, 'Error in local event handler'));
    }

    if (this.publisher.status === 'ready') {
      try {
        await this.publisher.publish(channel, message);
      } catch (err) {
        logger.warn({ err }, 'Failed to publish event to redis');
      }
    }
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);

    if (this.subscriber.status === 'ready') {
      try {
        await this.subscriber.subscribe(eventType);
      } catch (err) {
        logger.warn({ err }, 'Failed to subscribe to redis channel');
      }
    }
  }
}
