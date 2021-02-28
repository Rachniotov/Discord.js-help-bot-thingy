const Discord = require("discord.js");              // import stuff
const { Client, Message } = require("discord.js");
const https = require("https");
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
        const filter = m => m.author.id === message.author.id;
        const embed = new Discord.MessageEmbed()
            .setDescription("react with ✔️ to continue to the next step\nreact with ❌");
        const embedMessage = await message.channel.send(questions[0], embed);
        await embedMessage.react("✔️");
        await embedMessage.react("❌");
        const rFilter = (reaction, user) => {
            return (reaction.emoji.name === "✔️" || reaction.emoji.name === "❌") && user.id === message.author.id;
        }
        let bool = false;
        const rCollector = embedMessage.createReactionCollector(rFilter, { max: 1 });
        const collector = new Discord.MessageCollector(message.channel, filter);
        rCollector.on("end", reaction => {
            if (reaction.first().emoji.name === "✔️") {
                collector.stop();
                console.log("y")
            } else {
                bool = true;
                collector.stop();
                console.log("n")
            }
        })
        collector.on("end", async collected => {
            if (bool) {
                console.log("nuhuh")
                message.channel.send("Canceled making a new snippet");
                await embedMessage.reactions.removeAll();
                return;
            }
            if (!collected) {
                message.channel.send("Canceled making a new snippet");
                await embedMessage.reactions.removeAll();
                return;
            }
            let responses = [];
            collected.forEach(e => {
                responses.push(e.content.toLowerCase());
            })

            message.channel.send(questions[1])
            const idkWhatCollector = new Discord.MessageCollector(message.channel, filter, { max: 1 });
            idkWhatCollector.on("end", collected => {
                console.log("idk")
                const answer = collected.first().content;
                const randomStr = (len) => {
                    let result = "";
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    for (let i = 0; i < len; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return result;
                }
                const saving = async () => {
                    let code = randomStr(8);
                    const existing = client.snippets.get(code);
                    if (existing) {
                        return saving();
                    } else {
                        client.snippets.set(code, {
                            toDetect: responses,
                            toAnswer: answer,
                            by: {
                                id: message.author.id,
                                tag: message.author.tag,
                                createdAt: new Date().toDateString()
                            }
                        })
                        const requestOpts = {
                            method: "POST",
                            hostname: "haste.monkedev.com",
                            path: "/documents",
                        };
                        let data = "";
                        let link = "";
                        new Promise(reso => {
                            const request = https.request(requestOpts, res => {
                                res.once("data", e => {
                                    data += e;
                                    let json = JSON.parse(data);
                                    link = `https://haste.monkedev.com/${json.key}`
                                    reso(link);
                                })
                            })
                            request.write(answer.toString());
                            request.end();
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
                saving();

            })
        })
    }
}