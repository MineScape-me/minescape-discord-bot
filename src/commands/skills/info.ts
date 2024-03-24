import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel, EmbedBuilder } from "discord.js";
import { queryCall } from "../../database.js";
import { skills, capitalize, formatNumber, emojis, getLevelIndex } from "../../util/skills.js";

export const data = new SlashCommandBuilder()
	.setName('info')
	.setDescription('Lookup a user.')
	.addStringOption(option => 
		option.setName('username')
		.setDescription('The username to lookup.')
		.setRequired(true)
	)
	.addIntegerOption(
		option => option.setName('index')
		.setDescription('The index to lookup.')
		.setRequired(false)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDMPermission(false);

let getTotal = "(" + skills.map(skill => `cache.hiscores_normal_exp.${skill}`).join(" + ") + ") as total";
//SELECT cache.hiscores_normal_exp.*, " . $get . ", minescape.character_ids.uuid, minescape.uuids.username FROM cache.hiscores_normal_exp,  minescape.character_ids, minescape.uuids WHERE cache.hiscores_normal_exp.id = minescape.character_ids.id AND minescape.character_ids.uuid = minescape.uuids.uuid AND minescape.uuids.username = '$username';
let selectUser = `SELECT cache.hiscores_normal_exp.*, \
					${getTotal}, \
					minescape.character_ids.uuid, \
					minescape.uuids.username \
					FROM cache.hiscores_normal_exp, \
					minescape.character_ids, \
					minescape.uuids \
					WHERE cache.hiscores_normal_exp.id = minescape.character_ids.id \
					AND minescape.character_ids.uuid = minescape.uuids.uuid \
					AND minescape.uuids.username = ?`;

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.deferReply();
	const username = interaction.options.getString('username', true);
	let index = interaction.options.getInteger('index', false) || 1;
	queryCall(selectUser, [username], async (error, results) => {
		if (error || !results) {
			console.log(error);
			await interaction.editReply({ content: 'Issue performing command.' });
			return;
		}
		if (results.length === 0) {
			await interaction.editReply({ content: `Unknown username.` });
			return;
		}

		index = Math.max(1, Math.min(index, results.length));
		const info = results[index-1];
		
		const embed = new EmbedBuilder()
			.setTitle(`Levels for ${info.username} ${index}/${results.length}`)
			.setColor(0x00AE86)
			// Set minecraft head
			.setThumbnail(`https://minotar.net/helm/${info.uuid.replaceAll("-", '')}/32.png`)
			.setTimestamp();
		let totalLevel = 0;
		for (let skill of skills) {
			let level = getLevelIndex(info[skill]) + 1;
			let exp = Math.floor(info[skill]);
			const emoji = emojis[skill as keyof typeof emojis];
			let header = `${emoji} ${capitalize(skill)}: ${level}`;
			totalLevel += level;
			embed.addFields({ name: header, value: formatNumber(exp), inline: true });
		}
		embed.addFields({ name: `${emojis['total']}Total: ${totalLevel}`, value: formatNumber(Math.floor(info["total"])), inline: true });
		await interaction.editReply({ embeds: [embed] });

	});
}
