import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel, EmbedBuilder } from "discord.js";
import { queryCall } from "../../database.js";
import { skills, capitalize, formatNumber } from "../../util/skills.js";

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
			let level = Math.floor(info[skill]);
			let exp = Math.floor(info[skill]);
			let header = `${capitalize(skill)}: ${level}`;
			totalLevel += level;
			embed.addFields({ name: header, value: formatNumber(exp), inline: true });
		}
		embed.addFields({ name: `Total: ${totalLevel}`, value: formatNumber(Math.floor(info["total"])), inline: true });
		await interaction.editReply({ embeds: [embed] });
	// 	let json = data;
	// let value = 0;
	// if(character){
	// 	value = Number(character) - 1;
	// }
	// if(value >= json.value.length){
	// 	value = json.value.length - 1;
	// }
	// if(value < 0){
	// 	value = 0;
	// }
    // if(json.completed == true){
    //   const embed = new Discord.EmbedBuilder()
    //   .setTitle("Levels for " + json.value[value].username + " " + (value+1) + "/" + json.value.length)
    //   /*
    //          * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
    //          */
    //   .setColor(0x00AE86)
    //   /*
    //          * Takes a Date object, defaults to current date.
    //          */
    //   .setTimestamp()
    //   let values = json.value[value];
    //   let totalLevel = 0;
    //   for (let emoji in Strings.emojis) {
	// 	if(emoji == 'level'){
	// 		continue;
	// 	}
    //     let skill = emoji.charAt(0).toUpperCase() + emoji.slice(1);
    //     let levelNumber = getLevel(values[emoji], 1);
    //     let header = "";
    //     header += getEmoji(emoji) + " ";
    //     header += skill;
    //     if(skill == 'Total'){
    //       header += ': ' + totalLevel;
    //       embed.addFields({name: header, value: formatNumber(Math.floor(values[emoji])), inline: true});
    //       continue;
    //     }
    //     totalLevel += levelNumber;
    //     header += ': ' + levelNumber;
    //     embed.addFields({name: header, value: formatNumber(Math.floor(values[emoji])), inline: true});
    //   }
    //   return embed;
	});
}
