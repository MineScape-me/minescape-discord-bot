import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel } from "discord.js";
import { queryCall } from "../../database.js";

export const data = new SlashCommandBuilder()
	.setName('characters')
	.setDescription('Lookup a users character ids.')
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
	queryCall(selectSql, [target.id], async (error, results) => {
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
		const selectSql = `SELECT selected FROM player_data WHERE uuid = ?;`;
		queryCall(selectSql, [uuid], async (error, results) => {
			if (error) {
				console.log(error);
				await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
				return;
			}

			const selected = results[0].selected;

			const selectSql = `SELECT * FROM character_ids WHERE uuid = ?;`;
			queryCall(selectSql, [uuid], async (error, results) => {
				if (error) {
					console.log(error);
					await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
					return;
				}
				await interaction.reply({ content: `User has the following character ids:\n${
					results.map((result: any) => `${result.id} ${selected == result.id ? "(selected)" : ""}`).join('\n')
				}`, ephemeral: true });
			});	
		});
	});
}

async function lookupByUsername(interaction: ChatInputCommandInteraction<CacheType>) {
	const target = interaction.options.getString('target', true);

	// Get the UUID from the player_discord table using the Discord ID
	const selectSql = `SELECT uuid FROM uuids WHERE username = ?;`;
	queryCall(selectSql, [target], async (error, results) => {
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
		const selectSql = `SELECT selected FROM player_data WHERE uuid = ?;`;
		queryCall(selectSql, [uuid], async (error, results) => {
			if (error) {
				console.log(error);
				await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
				return;
			}

			const selected = results[0].selected;

			const selectSql = `SELECT * FROM character_ids WHERE uuid = ?;`;
			queryCall(selectSql, [uuid], async (error, results) => {
				if (error) {
					console.log(error);
					await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
					return;
				}
	
				await interaction.reply({ content: `User has the following character ids:\n${
					results.map((result: any) => `${result.id} ${selected == result.id ? "(selected)" : ""}`).join('\n')
				}`, ephemeral: true });
			});	
		});
	});
}

