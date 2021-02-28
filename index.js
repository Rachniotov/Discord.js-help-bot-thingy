const Discord = require("discord.js");   // import djs
const client = new Discord.Client({ intents: ["DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS", "GUILDS", "GUILD_EMOJIS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] }); // create a client with @everyone mentions disabled
const config = require("./config.json"); // import config.json file, which should contan the token
const fs = require("fs")                 // import fs
client.commands = new Map();             // create a map for storing commands (idk why i used map :p)
client.snippets = new Map();             // create a map for storing snippets (same reason ^^^^^^ :p)

client.on("ready", () => {               // ready event
    console.log(`${client.user.tag} is on!`);
    let commandFiles = fs.readdirSync(__dirname + "/commands");          // reading files from ./commands
    for (const file of commandFiles) {                                   // looping through each filename
        const functions = require(__dirname + "/commands" + `/${file}`); // getting all exported stuff and storing in a temp var
        client.commands.set(file.split(".")[0], functions);              // adding stuff to commands map | map(filename, exported stuff)
    }
})

client.on("message", message => {        // message event
    if (message.author.bot) return;      // return if the author of the message is a bot
    client.commands.forEach(e => {       // loop through each element in commands map
        for (const aliases of e.name) {  // loop thorugh each `name` attribute of the exported module
            if (message.content.toLowerCase().startsWith(`$${aliases.toLowerCase()}`)) { // check if message's content starts with the command aliases
                const args = message.content.split(/[ ]+/g); // define args
                args.shift();                   // remove the first element coz we dont need it
                e.run(message, args, client);   // run the command file's function
            }
        }
    })
    let haveToReply = false;
    const eh = (reference, content) => {
        let bool = false;
        for (const s of reference) {
            if (content.includes(s)) {
                return bool = true;
            }
        }
        return bool;
    }
    client.snippets.forEach(e => {
        haveToReply = eh(e.toDetect, message.content);
        if (haveToReply) {
            message.reply(e.toAnswer);
            return;
        }
    })
})

client.login(config.token);              // login with the token