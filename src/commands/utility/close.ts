import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  CacheType,
  ThreadChannel,
  ForumChannel,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('close')
  .setDescription('Close and lock a thread.')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const applyClosedTag = (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  if (
    interaction.channel instanceof ThreadChannel &&
    interaction.channel.parent instanceof ForumChannel
  ) {
    const closedTag = interaction.channel.parent.availableTags.find(
      (tag) => tag.name === 'Closed'
    );
    const paidTag = interaction.channel.parent.availableTags.find(
      (tag) => tag.name === 'Paid'
    );

    // Check if current tags include "Paid"
    const currentTags = interaction.channel.appliedTags;
    const hasPaidTag = paidTag && currentTags.includes(paidTag.id);

    // Create new tags array
    const newTags: string[] = [];

    // Add Paid tag if it existed
    if (hasPaidTag && paidTag) {
      newTags.push(paidTag.id);
    }

    // Add Closed tag if it exists
    if (closedTag && newTags.length < 5) {
      newTags.push(closedTag.id);
    }

    // Apply the new tags
    interaction.channel.setAppliedTags(newTags);
  }
};

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  // Check if the command is used in a thread
  if (!(interaction.channel instanceof ThreadChannel)) {
    await interaction.reply({
      content: 'This command can only be used in threads!',
      ephemeral: true,
    });
    return;
  }

  // Apply the closed tag if it exists
  applyClosedTag(interaction);

  // Send a message about who closed it
  await interaction.reply(
    `This thread has been closed by ${interaction.user}.`
  );

  // Close and lock the thread
  try {
    await interaction.channel.setLocked(true);
    await interaction.channel.setArchived(true);
  } catch (error) {
    console.error('Error closing thread:', error);
    await interaction.followUp({
      content: 'Failed to lock or archive the thread.',
      ephemeral: true,
    });
  }
}
