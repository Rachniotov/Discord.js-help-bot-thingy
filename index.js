const Discord = require("discord.js");   // import djs
const client = new Discord.Client({ intents: ["DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS", "GUILDS", "GUILD_EMOJIS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] }); // create a client with intents
const config = require("./config.json"); // import config.json file, which should contan the token
const fs = require("fs")                 // import fs
client.commands = new Map();             // create a map for storing commands (idk why i used map :p)
client.snippets = new Map();             // create a map for storing snippets (same reason ^^^^^^ :p)
const mongo = require("./mongo");
const snippetSchema = require("./schemas/snippetSchema");

client.on("ready", () => {               // ready event
    console.log(`${client.user.tag} is on!`);
    let commandFiles = fs.readdirSync(__dirname + "/commands");          // reading files from ./commands
    for (const file of commandFiles) {                                   // looping through each filename
        const functions = require(__dirname + "/commands" + `/${file}`); // getting all exported stuff and storing in a temp var
        client.commands.set(file.split(".")[0], functions);              // adding stuff to commands map | map(filename, exported stuff)
    }
    mongo().then(async mongoose => {                                     // making a db connection
        try {
            console.log("connected to mongo");
            if (!client.snippets.size) {                                 // if cache has nothing,
                const data = await snippetSchema.find();                 // get data from the db,
                for (const o of data) {                                  // loop through the data
                    client.snippets.set(o.id, o);                        // add each thing in the cache
                }
            }
        } finally {
            mongoose.connection.close();
        }
    })
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
    const eh = (reference, content) => {        // simple function to check if a String contains something same as the reference String[]
        let bool = false;
        for (const s of reference) {
            if (content.includes(s)) {
                return bool = true;
            }
        }
        return bool;
    }
    client.snippets.forEach(e => {                         // looping through the map
        if (message.guild.id !== e.guild) return;          // returning if the guild id doesnt match
        haveToReply = eh(e.toDetect, message.content);     // calling the function and storing the value returned
        if (haveToReply) {                                 // checking if the variable is true 
            message.reply(e.toAnswer);                     // replying
            return;
        }
    })
})

client.login(config.token);                                 // login with the token