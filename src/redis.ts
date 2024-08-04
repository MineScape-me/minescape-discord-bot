import { createClient } from 'redis';
import { config } from './config';
const { redisHost, redisPort, redisPassword } = config;

// Create a Redis client for publishing
const publisherClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
  password: redisPassword,
});

// Create a Redis client for subscribing
const subscriberClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
  password: redisPassword,
});

// Connect to Redis (publisher)
publisherClient.connect()
  .then(() => {
    console.log('Connected to Redis (publisher)!');
  })
  .catch((err: Error) => {
    console.error('Could not connect to Redis (publisher)', err);
  });

// Connect to Redis (subscriber)
subscriberClient.connect()
  .then(() => {
    console.log('Connected to Redis (subscriber)!');
  })
  .catch((err: Error) => {
    console.error('Could not connect to Redis (subscriber)', err);
  });

export const publishMessage = async (channel: string, message: string): Promise<void> => {
  try {
    await publisherClient.publish(channel, message);
    console.log(`Message published to channel ${channel}: ${message}`);
  } catch (err) {
    console.error('Error publishing message to Redis', err);
  }
};

// /**
//  * List all available channels in Redis
//  */
// export const listChannels = async (): Promise<void> => {
//   try {
//     const channels = await publisherClient.sendCommand(['PUBSUB', 'CHANNELS']);
//     console.log('Available channels:', channels);
//   } catch (err) {
//     console.error('Error listing channels in Redis', err);
//   }
// };

// // Example usage: List all channels
// listChannels();

const message = {
  name: 'Dablakbandit',
  uuid: 'dc7a1b38-08aa-450b-87c7-db0722802826',
  staff: false,
  message: 'Message from discord',
  world: 'Discord',
  jsonData: `[{"text":"Message from discord","color":"white"}]`,
};

// publishMessage(channel, JSON.stringify(message));

export default { publisherClient, subscriberClient };