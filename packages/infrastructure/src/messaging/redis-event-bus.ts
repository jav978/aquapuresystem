import Redis from 'ioredis';
import { Result } from '@aquasystem/shared-kernel';
import { EventBusPort, DomainEvent, EventHandler } from '@aquasystem/application';

export class RedisEventBus implements EventBusPort {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(private readonly redisUrl: string) {
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  async publish(event: DomainEvent): Promise<void> {
    const channel = `events:${event.eventType}`;
    const message = JSON.stringify({
      ...event,
      occurredAt: event.occurredAt.toISOString(),
    });
    await this.publisher.publish(channel, message);
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    const channel = `events:${eventType}`;
    
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      await this.subscriber.subscribe(channel);
    }
    
    this.handlers.get(eventType)!.push(handler);
  }

  async startListening(): Promise<void> {
    this.subscriber.on('message', async (channel, message) => {
      const eventType = channel.replace('events:', '');
      const handlers = this.handlers.get(eventType) || [];
      
      try {
        const event = JSON.parse(message);
        event.occurredAt = new Date(event.occurredAt);
        
        await Promise.all(handlers.map((handler) => handler(event)));
      } catch (error) {
        console.error(`Error processing event ${eventType}:`, error);
      }
    });
  }

  async shutdown(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}