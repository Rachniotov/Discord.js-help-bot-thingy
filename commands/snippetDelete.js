const Discord = require("discord.js");              // import stuff
const { Client, Message } = require("discord.js");
const mongo = require("../mongo");
const model = require("../schemas/snippetSchema");

module.exports = {
    name: ["snipdelete"],         // define command name and aliases
    /**
    * @param {Message} message
    * @param {String[]} args
    * @param {Client} client
    */
    run: async (message, args, client) => {
        if (!args.length) return message.reply("you didn't provide the snippet id. Use `$snipdelete <snippet_id>`"); //return if no args
        const id = args[0];
        let data = client.snippets.get(id);     // get the snippet data with the id provided
        if (!data) return message.channel.send("Cannot find the snippet in cache, check if you provided the correct id. It is **case-sensitive**"); // if nothing is found, return

        if (message.author.id === data.by.id || message.member.permissions.has("ADMINISTRATOR")) {  // check if it was made by the person OR has admin perms (idk why admin)
            const content = data.toAnswer.length > 550 ? `${data.toAnswer.slice(0, 540)}...` : data.toAnswer; // create a string for description
            const embed = new Discord.MessageEmbed()                                                          // create a new embed
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`Are you sure you want to delete the snippet by ${data.by.tag}?`)
                .setDescription(`ID: ${args[0]}\nTo detect: ${data.toDetect.join(", ")}\nResponse: ${content}\nCreator:\n\`\`\`yaml\nUser: ${data.by.tag}\nUserID: ${data.by.id}\nCreatedAt: ${data.by.createdAt}\`\`\``)
                .setFooter("this action cannot be reverted, react within 25s");
            const mes = await message.channel.send(embed);  // send the embed nad store the message
            await mes.react("✔️");                         // react with the emoji
            await mes.react("❌");                         // ^^^^^^
            const filter = (reaction, user) => {           // create a new filter 
                return (reaction.emoji.name === "✔️" || reaction.emoji.name === "❌") && user.id === message.author.id;
            }
            const collector = mes.createReactionCollector(filter, { max: 1, time: 1000 * 25 }); // create a new reaction collector
            collector.on("end", async collected => {
                if (!collected) {
                    message.reply("Cancelled deleting the snippet!");
                    await mes.reactions.removeAll();
                    return;
                }
                if (collected.first().emoji.name === "✔️") {        // if reaction emoji was ✔️
                    mongo().then(async mongoose => {                // connect to mongo
                        try {
                            await model.findOneAndDelete({ id: data.id });                              // delete the document
                            message.reply(`Deleted the snippet with id \`${data.id}\` successfully!`)   // reply
                            await mes.reactions.removeAll();
                            client.snippets.delete(data.id);                                            // clear the data from the cache
                        } finally {
                            mongoose.connection.close();                                                // close the connection
                        }
                    })
                } else {                                                // if they reacted with ❌
                    message.reply("Cancelled deleting the snippet!");   // reply
                    await mes.reactions.removeAll();
                    return;                                             // return
                }
            })
        } else {    // if the author of the message doesnt own the snippet or isnt an admin
            message.reply("you cannot use this as you either not own this snippet or you aren't an admin") // reply
            return; // return
        }

    }
}