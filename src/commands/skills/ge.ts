import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, CacheType, ThreadChannel, ForumChannel, ThreadOnlyChannel, EmbedBuilder } from "discord.js";
import { query, queryCall } from "../../database.js";
import { capitalize } from "../../util/skills.js";

export const data = new SlashCommandBuilder()
	.setName('ge')
	.setDescription('Grand Exchange lookup.')
	.addStringOption(option => 
		option.setName('item')
		.setDescription('The item to lookup.')
		.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDMPermission(false);


export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.deferReply();
	const input = interaction.options.getString('item', true);
	const item = input.toUpperCase().replace(' ', '_');
	const selectSql = `SELECT * FROM grandexchange_guide_price WHERE item LIKE ? LIMIT 10;`;
	queryCall(selectSql, [item], async (error, results) => {
		if (error || !results) {
			console.log(error);
			await interaction.editReply({ content: 'Issue performing command.' });
			return;
		}

		if (results.length === 0) {
			results = await query(`SELECT * FROM grandexchange_guide_price WHERE item LIKE ? LIMIT 10;`, [`%${item}%`]).catch(console.error);
			if (!results || results.length === 0){
				await interaction.editReply({ content: `No results found for ${input}.` });
				return;
			}
			await interaction.editReply({ content: `No results found for ${input}, did you mean:` });
			await interaction.followUp({ content: `\u200b${results.map((result: any) => capitalize(result.item.toLowerCase().replaceAll("_", " "))).join('\n')}`, ephemeral: true });
			return;
		}

		const buyHistory = await query(`SELECT * FROM grandexchange_history_buy WHERE item = ? AND date BETWEEN NOW() - INTERVAL 7 DAY AND NOW();`, [item]).catch(console.error);
		const sellHistory = await query(`SELECT * FROM grandexchange_history_sell WHERE item = ? AND date BETWEEN NOW() - INTERVAL 7 DAY AND NOW();`, [item]).catch(console.error);

		if(!buyHistory || !sellHistory){
			await interaction.editReply({ content: 'Issue performing command.' });
			return;
		}

		const info = results[0];
		const embed = new EmbedBuilder()
			.setTitle(`Grand Exchange: ${capitalize(info.item.toLowerCase().replaceAll("_", " "))}`)
			.setColor(0x00AE86)
			.setTimestamp(info.last_update)
			.setThumbnail(`https://resourcepack.minescape.me/images/${info.item.toLowerCase()}.png`);

		const bought = buyHistory.reduce((a, b) => a + b.amount, 0);
		const boughtA = buyHistory.reduce((a, b) => a + (b.min + (b.max - b.min)/2), 0) / buyHistory.length;
		const boughtS = buyHistory.reduce((a, b) => a + (b.max - b.min)/2, 0) / buyHistory.length;
		const sold = sellHistory.reduce((a, b) => a + b.amount, 0);
		const soldA = sellHistory.reduce((a, b) => a + (b.min + (b.max - b.min)/2), 0) / sellHistory.length;
		const soldS = sellHistory.reduce((a, b) => a + (b.max - b.min)/2, 0) / sellHistory.length;

		embed.addFields(
			{name: 'Guide', value: info.price + "gp"},
			{name: 'Sell Lowest', value: info.sell_lowest.toLocaleString() + "gp", inline: true},
			{name: 'Sell Highest', value: info.sell_highest.toLocaleString() + "gp", inline: true},
			{name: 'Sell Amount', value: info.sell_amount.toLocaleString(), inline: true},
			{name: 'Sold:', value: sold.toLocaleString(), inline: true},
			{name: 'Average:', value: soldA.toLocaleString() + "gp", inline: true},
			{name: 'Spread +/-: ', value: soldS.toLocaleString() + "gp", inline: true},
			{name: 'Buy Lowest', value: info.buy_lowest.toLocaleString() + "gp", inline: true},
			{name: 'Buy Highest', value: info.buy_highest.toLocaleString() + "gp", inline: true},
			{name: 'Buy Amount', value: info.buy_amount.toLocaleString(), inline: true},
			{name: 'Bought:', value: bought.toLocaleString(), inline: true},
			{name: 'Average:', value: boughtA.toLocaleString() + "gp", inline: true},
			{name: 'Spread +/-: ', value: boughtS.toLocaleString() + "gp", inline: true},
		);
		await interaction.editReply({ embeds: [embed] });
	});
}
