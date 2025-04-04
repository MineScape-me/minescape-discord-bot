import { Message } from 'discord.js';
import { publishMessage } from '../redis';
import { queryCall } from '../database';

interface ChatData {
  name: string;
  uuid: string;
  staff: boolean;
  message: string;
  world: string;
  jsonData: string;
}

export async function handleDiscordMessage(message: Message): Promise<void> {
  var messageContent = message.content;

  // strip non ascii characters
  messageContent = messageContent.replace(/[^\x00-\x7F]/g, '');
  if (messageContent.length > 256) {
    message.reply('Message is too long! Max length is 256 characters.');
    return;
  }

  const selectSql = `SELECT uuid FROM player_discord WHERE discord_id = ?;`;
  queryCall(selectSql, [message.author.id], async (error, results) => {
    if (error) {
      console.log(error);
      message
        .react('❌')
        .catch((err) => console.error('Failed to react to message:', err));
      return;
    }
    // Check if the user exists in the player_discord table
    if (results.length === 0 || !results[0].uuid) {
      return;
    }

    const uuid = results[0].uuid;
    const selectSql = `SELECT username FROM uuids WHERE uuid = ?;`;
    queryCall(selectSql, [uuid], async (error, results) => {
      if (error) {
        console.log(error);
        message
          .react('❌')
          .catch((err) => console.error('Failed to react to message:', err));
        return;
      }
      const username = results[0].username;

      const jsonData = [
        { text: '[', color: 'gold' },
        { text: 'Discord', color: 'blue' },
        { text: ']', color: 'gold' },
        { text: ` ${username}: ${messageContent}`, color: 'white' },
      ];

      const chatData: ChatData = {
        name: username,
        uuid: uuid,
        staff: false,
        message: messageContent,
        world: 'Discord',
        jsonData: JSON.stringify(jsonData),
      };
      publishMessage('shared-chat-message', JSON.stringify(chatData))
        .then(() => {
          // Add a tick emoji reaction to indicate success
          message
            .react('✅')
            .catch((err) => console.error('Failed to react to message:', err));
        })
        .catch((err) => {
          console.error('Failed to publish message:', err);
          message
            .react('❌')
            .catch((err) => console.error('Failed to react to message:', err));
        });
    });
  });
}
