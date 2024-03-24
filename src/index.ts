require('dotenv').config();

import { AutocompleteInteraction, CacheType, Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from './config.js';
import { commands } from './commands/commands.js'

const { token, clientId, guildId } = config;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${Object.keys(commands).length} application (/) commands.`);
		const commandsData = Object.values(commands).map((command) => command.data);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commandsData },
		) as any;

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();


client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if(interaction.isChatInputCommand()) {
		const { commandName } = interaction;
		if (commands[commandName as keyof typeof commands]) {
			(commands[commandName as keyof typeof commands]).execute(interaction);
		}
	} else if (interaction.isAutocomplete()) {
		const { commandName } = interaction;
		const command = commands[commandName as keyof typeof commands] as { autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void };
		if (command && command.autocomplete) {
			command.autocomplete(interaction);
		}
	}

});

// Log in to Discord with your client's token
client.login(token);