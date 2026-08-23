import { Channel, channels, publish } from '@feathersjs/feathers';
import { container, TYPES } from './infrastructure/config/di.container';
import { EventBusPort } from '@aquasystem/application';

export const channels = (app: any) => {
  const eventBus = container.get<EventBusPort>(TYPES.EventBusPort);

  // User-specific channel
  app.channel('user').filter((connection, user) => connection.user?.id === user.id);

  // Role-based channels
  app.channel('admins').filter((connection) => connection.user?.role === 'ADMIN');
  app.channel('managers').filter((connection) => ['ADMIN', 'MANAGER'].includes(connection.user?.role));
  app.channel('operators').filter((connection) => ['ADMIN', 'MANAGER', 'OPERATOR'].includes(connection.user?.role));

  // Entity-specific channels
  app.channel('products').filter(() => true);
  app.channel('inventory').filter(() => true);
  app.channel('sales').filter(() => true);
  app.channel('invoices').filter(() => true);
  app.channel('returns').filter(() => true);
  app.channel('settings').filter(() => true);

  // Global channel for broadcasts
  app.channel('everyone').filter(() => true);

  // Publish service events to appropriate channels
  app.publish((data, context) => {
    const eventType = context?.eventType || 'updated';
    const entityType = context?.service?.path || 'unknown';

    // Publish to event bus for real-time updates
    eventBus.publish({
      eventType: `${entityType}:${eventType}`,
      occurredAt: new Date(),
      aggregateId: data.id,
      data,
      context,
    });

    // Publish to Feathers channels
    const channels: Channel[] = [];

    // User-specific
    if (context?.params?.user) {
      channels.push(app.channel('user'));
    }

    // Role-based
    if (context?.params?.user?.role === 'ADMIN') {
      channels.push(app.channel('admins'));
    } else if (context?.params?.user?.role === 'MANAGER') {
      channels.push(app.channel('managers'));
    } else if (context?.params?.user?.role === 'OPERATOR') {
      channels.push(app.channel('operators'));
    }

    // Entity-specific
    channels.push(app.channel(entityType));

    // Global
    channels.push(app.channel('everyone'));

    return channels;
  });
};