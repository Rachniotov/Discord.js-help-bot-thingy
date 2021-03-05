const Discord = require("discord.js");              // import stuff
const { Client, Message } = require("discord.js");

module.exports = {
    name: ["list"],         // define command name and aliases
    /**
    * @param {Message} message
    * @param {String[]} args
    * @param {Client} client
    */
    run: async (message, args, client) => {
        let guildSnippets = [];                     // a global var to store snippets of a specefic guild
        client.snippets.forEach(s => {              // loop through all the snippets
            if (s.guild === message.guild.id) {     // if guild id is same as message's guild's id,
                guildSnippets.push(s);              // push it to the global array
            }
        });
        let i = 0;                                  // define a counter
        const update = (i) => {                     // a simple funtion which returns an edited MessageEmbed
            let description = `ID: ${guildSnippets[i].id}\nTo detect: ${guildSnippets[i].toDetect}\nResponse: ${guildSnippets[i].toAnswer}\nAuthor:\n\`\`\`yaml\nID: ${guildSnippets[i].by.id}\nTag: ${guildSnippets[i].by.tag}\nCreatedAt: ${guildSnippets[i].by.createdAt}\`\`\``
            let embed = new Discord.MessageEmbed()
                .setTitle(`List of all snippets in ${message.guild.name}`)
                .setFooter("react to the emojis to navigate")
                .setDescription(description);
            return embed;
        }

        const embed = update(i);                        // define the embed
        const mes = await message.channel.send(embed);  // send the embed and store the message
        await mes.react("◀️");                         // react with emojies
        await mes.react("⏹️");
        await mes.react("▶️");
        const filter = (reaction, user) => {            // define the filter
            return (reaction.emoji.name === "◀️" || reaction.emoji.name === "⏹️" || reaction.emoji.name === "▶️") && user.id === message.author.id;
        }
        const colector = mes.createReactionCollector(filter);   // create a reaction collector
        colector.on("collect", async reaction => {
            if (reaction.emoji.name === "◀️") {          // if user reacted with ◀️
                if (i === 0) {                           // calculate i
                    i = guildSnippets.length - 1;
                } else {
                    i = i - 1;
                }
                mes.edit(update(i));                      // edit the embed
            } else if (reaction.emoji.name === "⏹️") {   // if user reacted with ⏹️
                colector.stop();                         // stop the collector
                mes.reactions.removeAll();               // remove the reactions
                return;
            } else if (reaction.emoji.name === "▶️") {  // if user reacted with ▶️
                if (i === guildSnippets.length - 1) {   // calculate i
                    i = 0;
                } else {
                    i = i + 1;
                }
                mes.edit(update(i));                    // edit the embed
            }
            await reaction.users.remove(message.author.id); // remove the user's reactions
        })
    }
}