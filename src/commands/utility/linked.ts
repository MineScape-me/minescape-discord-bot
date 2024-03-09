import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel } from "discord.js";
import { query } from "../../database.js";

export const data = new SlashCommandBuilder()
	.setName('linked')
	.setDescription('Check your linked account.')
	.setDMPermission(false);


export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {

	// Get the UUID from the player_discord table using the Discord ID
	const selectSql = `SELECT uuid FROM player_discord WHERE discord_id = ?;`;
	query(selectSql, [interaction.user.id], async (error, results) => {
		if (error) {
			console.log(error);
			await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
			return;
		}

		// Check if the user exists in the player_discord table
		if (results.length === 0 || !results[0].uuid) {
			await interaction.reply(`Follow the guide in the the <#683273758903107595> channel to link your account.`);
			return;
		}

		const uuid = results[0].uuid;
		const selectSql = `SELECT username FROM uuids WHERE uuid = ?;`;
		query(selectSql, [uuid], async (error, results) => {
			if (error) {
				console.log(error);
				await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
				return;
			}

			await interaction.reply({ content: `User is linked to ${results[0].username}`, ephemeral: true });
		});

	});
}
