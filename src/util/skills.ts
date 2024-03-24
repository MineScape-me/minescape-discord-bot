let xpLevels  = [0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411, 2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824, 12031, 13363, 14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648, 37224,
	41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333, 111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886, 273742, 302288, 333804, 368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627, 814445, 899257, 992895, 1096278, 1210421, 1336443,
	1475581, 1629200, 1798808, 1986068, 2192818, 2421087, 2673114, 2951373, 3258594, 3597792, 3972294, 4385776, 4842295, 5346332, 5902831, 6517253, 7195629, 7944614, 8771558, 9684577, 10692629, 11805606, 13034431];

export const skills = ["attack", "strength", "defence", "ranged", "prayer", "magic", "runecrafting", "construction", "hitpoints", "agility", "herblore", "thieving", "crafting", "fletching", "slayer", "hunter", "mining", "smithing", "fishing", "cooking", "firemaking", "woodcutting", "farming"];


export const emojis = {
	"attack": "<:Attack:555661945148014593>",
	"hitpoints": "<:Hitpoints:555661945416581140>",
	"mining": "<:Mining:555661945596936202>",
	"strength": "<:Strength:555661945697468426>",
	"agility": "<:Agility:555661945357860864>",
	"smithing": "<:Smithing:555661945706119168>",
	"defence" : "<:Defence:555661945332695040>",
	"herblore": "<:Herblore:555661945659850772>",
	"fishing": "<:Fishing:555661945454329856>",
	"ranged": "<:Ranged:555661945727090718>",
	"thieving": "<:Thieving:555661945693274112>",
	"cooking": "<:Cooking:555661945101877270>",
	"prayer": "<:Prayer:555661945303203842>",
	"crafting": "<:Crafting:555661945496141825>",
	"firemaking": "<:Firemaking:555661945353535498>",
	"magic" : '<:Magic:555661945773228033>',
	"fletching": "<:Fletching:555661945559056384>",
	"woodcutting": "<:Woodcutting:555661945445810177>",
	"runecrafting": "<:Runecrafting:555661945647267861>",
	"slayer": "<:Slayer:555661945731284992>",
	"farming": "<:Farming:555661945349472286>",
	"construction": "<:Construction:555661945198346241>",
	"hunter": "<:Hunter:555661945467043840>",
	"total": "<:Levels:557443161224380416>",
	"level": "<:Levels:557443161224380416>"
};

export function getLevelIndex(exp: number): number {
	let levelIndex = 0;
	for (let i = 0; i < xpLevels.length; i++) {
		if (exp < xpLevels[i]) {
			break;
		}
		levelIndex = i;
	}
	return levelIndex;
}
// function to turn a number into a string with no decimal
export function formatNumber(num: number | string): string {
	if (typeof num === 'number') {
		return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return num;
}

// function to captialize a string
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}