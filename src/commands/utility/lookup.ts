import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel } from "discord.js";
import { query } from "../../database.js";

export const data = new SlashCommandBuilder()
	.setName('lookup')
	.setDescription('Lookup a users linked account.')
	.addSubcommand(subcommand =>
		subcommand
		.setName('discord')
		.setDescription('Lookup a users linked account by discord user.')
		.addUserOption(option =>
			option.setName('target')
			.setDescription('The user to lookup.')
			.setRequired(true)))
	.addSubcommand(subcommand =>
		subcommand
		.setName('username')
		.setDescription('Lookup a users linked account by username.')
		.addStringOption(option =>
			option.setName('target')
			.setDescription('The username to lookup.')
			.setRequired(true)))
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);


export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	if(!interaction.options.getSubcommand()) return;
	switch(interaction.options.getSubcommand()) {
		case 'discord':
			await lookupByDiscord(interaction);
			break;
		case 'username':
			await lookupByUsername(interaction);
			break;
	
	}
}

async function lookupByDiscord(interaction: ChatInputCommandInteraction<CacheType>) {
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
		if (results.length === 0 || !results[0].uuid) {
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

			await interaction.reply({ content: `User is linked to ${results[0].username} - ${uuid}`, ephemeral: true });
		});

	});
}

async function lookupByUsername(interaction: ChatInputCommandInteraction<CacheType>) {


	const target = interaction.options.getString('target', true);

	// Get the UUID from the player_discord table using the Discord ID
	const selectSql = `SELECT uuid FROM uuids WHERE username LIKE ?;`;
	query(selectSql, [target], async (error, results) => {
		if (error) {
			console.log(error);
			await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
			return;
		}

		// Check if the user exists in the player_discord table
		if (results.length === 0 || !results[0].uuid) {
			await interaction.reply({ content: 'User has not joined the server.', ephemeral: true });
			return;
		}

		const uuid = results[0].uuid;
		const selectSql = `SELECT discord_id, discord_name FROM player_discord WHERE uuid LIKE ?;`;
		query(selectSql, [uuid], async (error, results) => {
			if (error) {
				console.log(error);
				await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
				return;
			}

			if(results.length === 0 || results[0].discord_id == 0) {
				await interaction.reply({ content: `User ${target} has not linked their account.`, ephemeral: true });
				return;
			}
			if(!interaction.guild){
				return;
			}
			
			var user = await interaction.guild.members.fetch(results[0].discord_id);
			if(!user){
				await interaction.reply({ content: `User ${target}/${uuid} is linked to ${results[0].discord_name} / ${results[0].discord_id}, but not found in guild.`, ephemeral: true });
				return;
			}
			
			await interaction.reply({ content: `User ${target}/${uuid} is linked to ${user.user.username} / ${results[0].discord_id} - <@${user.user.id}>`, ephemeral: true });
		});

	});
}

