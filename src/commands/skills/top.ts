import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel, EmbedBuilder } from "discord.js";
import { queryCall } from "../../database.js";
import {skills, emojis, getLevelIndex, formatNumber, capitalize} from "../../util/skills.js";

export const data = new SlashCommandBuilder()
	.setName('top')
	.setDescription('View top skills levels/total.')
	.addSubcommand(subcommand => 
		subcommand.setName('total')
		.setDescription('View top total levels.')
		.addIntegerOption(option => 
			option.setName('page')
			.setDescription('The page to display.')
			.setRequired(false))
	)
	.addSubcommand(subcommand => 
		subcommand.setName('level')
		.setDescription('View top levels.')
		.addIntegerOption(option => 
			option.setName('page')
			.setDescription('The page to display.')
			.setRequired(false))
	)
	.addSubcommandGroup(subcommandGroup => {
		subcommandGroup.setName('skill')
		.setDescription('View top skill levels')
		skills.forEach(skill => {
			subcommandGroup.addSubcommand(subcommand => 
				subcommand.setName(skill)
				.setDescription(`View top ${skill} levels.`)
				.addIntegerOption(option => 
					option.setName('page')
					.setDescription('The page to display.')
					.setRequired(false))
			);
		});
		return subcommandGroup;
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	if(interaction.options.getSubcommandGroup()){
		switch(interaction.options.getSubcommandGroup()) {
			case 'skill':
				if(skills.includes(interaction.options.getSubcommand().toLowerCase())){
					await handleSkill(interaction, interaction.options.getSubcommand().toLowerCase());
				}else{
					await interaction.reply({ content: 'Invalid skill.' });
				}
			break;
			default:
				await interaction.reply({ content: 'Invalid command.' });
			break;
			
		}
	}else if(interaction.options.getSubcommand()){
		switch(interaction.options.getSubcommand()) {
			case 'total':
				await handleTotal(interaction);
			break;
			case 'level':
				await handleLevel(interaction);
			break;
			default:
				await interaction.reply({ content: 'Invalid command.' });
			break;
		}
	}else{
		await interaction.reply({ content: 'Invalid command.' });
	}
}

let getLevel = "(" + skills.map(skill => `cache.hiscores_normal_level.${skill}`).join(" + ") + ") as level";
let getExp = "(" + skills.map(skill => `cache.hiscores_normal_exp.${skill}`).join(" + ") + ") as total";

function getTop(type: string, perPage: number, offset: number) {
	return `SELECT ${getLevel}, ${getExp}, minescape.character_ids.uuid, minescape.uuids.username FROM \
			cache.hiscores_normal_exp, \
			cache.hiscores_normal_level, \
			minescape.character_ids, \
			minescape.uuids \
			WHERE cache.hiscores_normal_exp.id = minescape.character_ids.id \
			AND cache.hiscores_normal_exp.id = cache.hiscores_normal_level.id \
			AND minescape.character_ids.uuid = minescape.uuids.uuid \
			ORDER BY ${type} DESC LIMIT ${perPage} OFFSET ${offset};`;
}

async function handleTotal(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.deferReply();
	const page = Math.max(0, interaction.options.getInteger('page') || 1);
	const perPage = 12;
	const offset = (page - 1) * perPage;

	queryCall(getTop("total", perPage, offset), [], (error, results) => {
		if(error || !results.length){
			console.error(error);
			return interaction.editReply({ content: 'No results found.'});
		}
		handleResult(interaction, "total", results, offset);
	});
}


async function handleLevel(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.deferReply();
	const page = Math.max(0, interaction.options.getInteger('page') || 1);
	const perPage = 12;
	const offset = (page - 1) * perPage;
	
	queryCall(getTop("level", perPage, offset), [], (error, results) => {
		if(error || !results.length){
			console.error(error);
			return interaction.editReply({ content: 'No results found.'});
		}
		handleResult(interaction, "level", results, offset);
	});
}

async function handleSkill(interaction: ChatInputCommandInteraction<CacheType>, skill: string) {
	await interaction.deferReply();

	const page = Math.max(0, interaction.options.getInteger('page') || 1);
	const perPage = 12;
	const offset = (page - 1) * perPage;

	const selectSql = `SELECT cache.hiscores_normal_exp.${skill}, \
						minescape.character_ids.uuid, \
						minescape.uuids.username FROM cache.hiscores_normal_exp, \
						minescape.character_ids, \ 
						minescape.uuids \
						WHERE cache.hiscores_normal_exp.id = minescape.character_ids.id \
						AND minescape.character_ids.uuid = minescape.uuids.uuid \
						ORDER BY cache.hiscores_normal_exp.${skill} \
						DESC LIMIT ? OFFSET ?;`;
	queryCall(selectSql, [perPage, offset], (error, results) => {
		if(error || !results.length){
			console.error(error);
			return interaction.editReply({ content: 'No results found.'});
		}
		handleResult(interaction, skill, results, offset);
	});
}


async function handleResult(interaction: ChatInputCommandInteraction<CacheType>, type: string, results: any, offset: number) {
	const emoji = emojis[type as keyof typeof emojis];
	const embed = new EmbedBuilder()
					.setTitle(`Top Players: ${capitalize(type)} ${emoji}`)
					.setColor(0x00AE86)
					.setTimestamp();

	results.forEach((result: any, index: number) => {
		var level;
		var val = type;
		if(type === "total" || type === "level") {
			level = result.level;
			val = 'total';
		}else{
			level = getLevelIndex(result[type]) + 1;
		}
		const number = index + 1 + offset;
		embed.addFields({name: `${number}. \`\`\`${result.username}\`\`\``, value: `${emoji} Level: ${level}\n[${formatNumber(result[val])}]`, inline: true});
	});
	interaction.editReply({ embeds: [embed] });
}


