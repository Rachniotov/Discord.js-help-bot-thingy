const Discord = require("discord.js");              // import stuff
const { Client, Message } = require("discord.js");
const https = require("https");
const mongo = require("../mongo");
const model = require("../schemas/snippetSchema");
/*
  so explaining this here coz idk where to... Snippets would be like for example: if a user says "cannot find module blah blah",
  you can have an automated responce for it which you can ofc edit atferwards and delete too (ill make the cmds for both afterwards)
  also you can put required permissions for the author if you want to
*/

module.exports = {
    name: ["addsnip", "snip"],         // define command name and aliases
    /**
    * @param {Message} message
    * @param {String[]} args
    * @param {Client} client
    */
    run: async (message, args, client) => {
        const questions = ["Type the keywords that you want the snippet to react to, just type them in the chat and when you are done, react with ✔️ to go to the next step or react with ❌ to cancel making a snippet.\nExample: ```\nuser's message: HELP!11! cannot find module \"HZUBDW.js\"```\n```ideal example:\ncannot find module```",
            "Provide the response you want to repond with if user messaged something related. While sharing long codes, make sure to use code bins."
        ];
        const filter = m => m.author.id === message.author.id; // filter out other user's messages
        const embed = new Discord.MessageEmbed()
            .setDescription("react with ✔️ to continue to the next step\nreact with ❌");
        const embedMessage = await message.channel.send(questions[0], embed);
        await embedMessage.react("✔️");
        await embedMessage.react("❌");
        const rFilter = (reaction, user) => {                  // filter out other reactions as well as other user's reactions
            return (reaction.emoji.name === "✔️" || reaction.emoji.name === "❌") && user.id === message.author.id;
        }
        let bool = false;
        const rCollector = embedMessage.createReactionCollector(rFilter, { max: 1 }); // reaction collector
        const collector = new Discord.MessageCollector(message.channel, filter);      // message collector
        rCollector.on("end", reaction => {
            if (reaction.first().emoji.name === "✔️") {    // if user reacted with ✔️ 
                collector.stop();                          // stop the collector 
            } else {
                bool = true;                               // else make the variable true
                collector.stop();                          // stop the colector
            }
        })
        collector.on("end", async collected => {
            if (bool) {
                message.channel.send("Canceled making a new snippet");
                await embedMessage.reactions.removeAll();
                return;
            }
            if (!collected) {                              // if there is no responce, return
                message.channel.send("Canceled making a new snippet");
                await embedMessage.reactions.removeAll();
                return;
            }
            let responses = [];
            collected.forEach(e => {                          // loop through each message collected
                responses.push(e.content.toLowerCase());      // push the responce to the array
            })

            message.channel.send(questions[1])
            const idkWhatCollector = new Discord.MessageCollector(message.channel, filter, { max: 1 }); // another message collector
            idkWhatCollector.on("end", collected => {
                const answer = collected.first().content;
                const randomStr = (len) => {        // funtion to generate a String of random characters
                    let result = "";
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    for (let i = 0; i < len; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return result;
                }
                const saving = async () => {                        // the main function for saving the thing and other stuff
                    let code = randomStr(8);                        // generate a string with random characters
                    const existing = client.snippets.get(code);     // try to get the map's element same as the random String
                    if (existing) {                                 // if it exists, recurse
                        return saving();
                    } else {                                        // if not, continue
                        client.snippets.set(code, {                 // set the map with the element named same as the random string
                            toDetect: responses,                    // save all the stuff
                            toAnswer: answer,
                            guild: message.guild.id,
                            by: {
                                id: message.author.id,
                                tag: message.author.tag,
                                createdAt: new Date().toDateString()
                            }
                        })
                        await mongo().then(mongoose => {                // create a db connection
                            try {
                                const doc = new model({                 // store whole document in a local var
                                    id: code,
                                    toDetect: responses,
                                    toAnswer: answer,
                                    guild: message.guild.id,
                                    by: {
                                        id: message.author.id,
                                        tag: message.author.tag,
                                        createdAt: new Date().toDateString()
                                    }
                                })
                                doc.save();                             // save the document t0 the db
                            } catch {
                                return;
                            }
                        })
                        const requestOpts = {                       // make a new object for storing the info regarding the request
                            method: "POST",
                            hostname: "haste.monkedev.com",
                            path: "/documents",
                        };
                        let data = "";
                        let link = "";
                        new Promise(reso => {                                       // make a new promise
                            const request = https.request(requestOpts, res => {     // make a post request 
                                res.once("data", e => {
                                    data += e;                                      // append incoming data to the variable
                                    let json = JSON.parse(data);                    // parse the data 
                                    link = `https://haste.monkedev.com/${json.key}` // generate a link
                                    reso(link);                                     // resolve with the link
                                })
                            })
                            request.write(answer.toString());                       // write the content to the site
                            request.end();                                          // end the connection
                        }).then(lnk => {
                            const embed = new Discord.MessageEmbed()
                                .setAuthor(message.author.user, message.author.displayAvatarURL({ dynamic: true }))
                                .setTitle("Created new snippet!")
                                .setDescription(`id: \`${code}\`\nlistening for: ${responses.join(", ")}\nresponce: ${lnk}`)
                                .setFooter("response saved on https://haste.monkedev.com");
                            message.channel.send(embed);
                        })
                    }
                }
                saving();   // calling the function

            })
        })
    }
}