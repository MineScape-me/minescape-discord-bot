import { CommandInteraction, SlashCommandBuilder, PermissionFlagsBits, ThreadChannel, ForumChannel } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('zing')
	.setDescription('Replies with Pong!')
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
	await interaction.reply({content: `Pong!`, ephemeral: true});
}
