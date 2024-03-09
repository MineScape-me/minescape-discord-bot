import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel } from "discord.js";
import { query } from "../../database.js";

export const data = new SlashCommandBuilder()
	.setName('lookup')
	.setDescription('Lookup a users linked account.')
	.addUserOption(option =>
		option.setName('target')
			.setDescription('The member to reward.')
			.setRequired(true))
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);


export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	const target = interaction.options.getUser('target', true);

	// Get the UUID from the player_discord table using the Discord ID
	const selectSql = `SELECT uuid FROM player_discord WHERE discord_id = ?;`;
	query(selectSql, [target.id], async (error, results) => {
		if (error) {
			console.log(error);
			await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
			return;
		}

		// Check if the user exists in the player_discord table
		if (results.length === 0) {
			await interaction.reply({ content: 'User is not linked.', ephemeral: true });
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
