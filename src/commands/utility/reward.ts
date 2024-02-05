import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel } from "discord.js";
import { connection } from "../../database.js";

export const data = new SlashCommandBuilder()
	.setName('reward')
	.setDescription('Reward a user for a suggestion or bug report.')
	.addUserOption(option =>
		option.setName('target')
			.setDescription('The member to reward.')
			.setRequired(true))
	.addIntegerOption(option => 
		option.setName('amount')
		.setDescription('The amount of tokens to reward.')
		.setRequired(true))
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const updateTags = (interaction: ChatInputCommandInteraction<CacheType>, tagNameToAdd: string | undefined, tagNameToRemove: string | undefined) => {
	if (interaction.channel instanceof ThreadChannel && interaction.channel.parent instanceof ForumChannel) {
		const tagToAdd = interaction.channel.parent.availableTags.find(tag => tag.name === tagNameToAdd);
		const tagToRemove = interaction.channel.parent.availableTags.find(tag => tag.name === tagNameToRemove);
		var tags = interaction.channel.appliedTags;
		let updated = false
		if (tagToAdd) {
			tags.push(tagToAdd.id);
			updated = true;
		}
		if (tagToRemove) {
			tags = tags.filter(tag => tag !== tagToRemove.id);
			updated = true;
		}
		if(updated) {
			interaction.channel.setAppliedTags(tags);
		}
	}
}

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	const target = interaction.options.getUser('target');
	const amount = interaction.options.getInteger('amount');

	// Get the UUID from the player_discord table using the Discord ID
	const query = `SELECT uuid FROM player_discord WHERE discord_id = '${target?.id}'`;
	connection.query(query, async (error, results) => {
		if (error) {
			console.log(error);
			await interaction.reply({ content: 'Error reaching database!', ephemeral: true });
			return;
		}

		// Check if the user exists in the player_discord table
		if (results.length === 0) {
			updateTags(interaction, 'Awaiting Link', undefined);
			const emoji = interaction.client.emojis.cache.get('555661945416581140');
			await interaction.reply(`${target}, please link your account to recieve your reward ${emoji}`);
			await interaction.followUp(`Follow the guide in the the <#683273758903107595> channel to link your account!`);
			return;
		}

		const uuid = results[0].uuid;

		// Insert the UUID and token amount into the player_rewards table
		const insertQuery = `INSERT INTO player_rewards (uuid, data) VALUES ('${uuid}', 'tokens give ${uuid} ${amount}')`;
		connection.query(insertQuery, async (error) => {
			if (error) {
				await interaction.reply({ content: 'Error rewarding player!', ephemeral: true });
				return;
			}

			const emoji = interaction.client.emojis.cache.get('555661945416581140');
			// Reward successfully inserted
			interaction.reply(`Thanks for the help ${target}, you have been awarded ${amount} tokens ${emoji}`);
			updateTags(interaction, 'Paid', 'Awaiting Link');
		});
	});
}
