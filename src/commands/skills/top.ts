import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageComponentInteraction, InteractionEditReplyOptions } from "discord.js";
import { ButtonInteraction } from 'discord.js';

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
	const page = Math.max(1, interaction.options.getInteger('page') || 1);
	const perPage = 12;

	const queryCallback = async (interaction: ChatInputCommandInteraction<CacheType> | ButtonInteraction, page: number) => {
		const offset = (page - 1) * perPage;

		queryCall(getTop("total", perPage, offset), [], (error, results) => {
			if(error || !results.length){
				console.error(error);
				if((interaction as ButtonInteraction<CacheType>).update){
					return (interaction as ButtonInteraction<CacheType>).update({ content: 'No results found.'});
				}
				return interaction.editReply({ content: 'No results found.'});
			}
			handleResult(interaction, "total", results, offset, page, queryCallback);
		});
	}
	queryCallback(interaction, page);
}


async function handleLevel(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.deferReply();
	const page = Math.max(1, interaction.options.getInteger('page') || 1);
	const perPage = 12;

	const queryCallback = async (interaction: ChatInputCommandInteraction<CacheType> | ButtonInteraction, page: number) => {

		const offset = (page - 1) * perPage;
		
		queryCall(getTop("level", perPage, offset), [], (error, results) => {
			if(error || !results.length){
				console.error(error);
				if((interaction as ButtonInteraction<CacheType>).update){
					return (interaction as ButtonInteraction<CacheType>).update({ content: 'No results found.'});
				}
				return interaction.editReply({ content: 'No results found.'});
			}
			handleResult(interaction, "level", results, offset, page, queryCallback);
		});
	}
	queryCallback(interaction, page);
}

async function handleSkill(interaction: ChatInputCommandInteraction<CacheType>, skill: string) {
	await interaction.deferReply();
	const page = Math.max(1, interaction.options.getInteger('page') || 1);
	const perPage = 12;

	const queryCallback = async (interaction: ChatInputCommandInteraction<CacheType> | ButtonInteraction, page: number) => {
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
				if((interaction as ButtonInteraction<CacheType>).update){
					return (interaction as ButtonInteraction<CacheType>).update({ content: 'No results found.'});
				}
				return interaction.editReply({ content: 'No results found.'});
			}
			handleResult(interaction, skill, results, offset, page, queryCallback);
		});
	}
	queryCallback(interaction, page);
}


async function handleResult(interaction: ChatInputCommandInteraction<CacheType> | ButtonInteraction, type: string, results: any, offset: number, page: number, queryCallback: (interaction: ChatInputCommandInteraction<CacheType> | ButtonInteraction, page: number) => void) {
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

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`previous-${page - 1}`).setLabel('Previous').setStyle(ButtonStyle.Danger).setDisabled(page === 1), new ButtonBuilder().setCustomId(`next-${page + 1}`).setLabel('Next').setStyle(ButtonStyle.Success));

	if((interaction as ButtonInteraction<CacheType>).update){
		await (interaction as ButtonInteraction<CacheType>).update({ content: '', embeds: [embed], components: [row] });
	}else{
		await interaction.editReply({ content: '', embeds: [embed], components: [row] });
		const message = await interaction.fetchReply();
	
		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 100 });

		collector.on('collect', async (buttonInteraction: ButtonInteraction<CacheType>) => {
			if (buttonInteraction.user.id !== interaction.user.id) {
				interaction.reply({ content: 'These buttons aren\'t for you!', ephemeral: true });
				return
			}

			const [action, inputPage] = buttonInteraction.customId.split('-');
			//validate inputPage
			const page = parseInt(inputPage);

			if (action === 'next' && page >= 1) {
				// await buttonInteraction.deferUpdate();
				queryCallback(buttonInteraction, page)
			} else if (action === 'previous' && page >= 1) {
				// await buttonInteraction.deferUpdate();
				queryCallback(buttonInteraction, page)
			}

		});

		collector.on('end', async () => {
			interaction.editReply({ components: [] });
		})
	}
	
}


