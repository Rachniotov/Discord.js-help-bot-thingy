const Discord = require("discord.js");       // import stuff
const { Client, Message } = require("discord.js");
const https = require("https");

module.exports = {
    name: ["repo"],                  // define command name and aliases
    /**
    * @param {Message} message
    * @param {String[]} args
    * @param {Client} client
    */
    // this cmd does nothing but searches repositories on github and provide you info about it
    run: async (message, args, client) => {  // main function
        if (!args) return message.reply("You didn't provide any repository name to search for."); // if no args, return
        const options = {           // define request options
            host: 'api.github.com',
            path: `/search/repositories?q=${encodeURIComponent(args.join(" "))}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }
        const request = https.request(options, res => {     // make a request
            let data = "";                  // variable for receiving data
            res.on("data", e => {           // when data comes,
                data += e;                  // append it to the var
            })
            res.once("end", () => {         // on ending,
                data = JSON.parse(data);    // parse the data to a json document
                let repoNames = "";
                let count = 1;
                data.items.forEach(name => {    // iterate to get all the repo names
                    if (count <= 10) repoNames += `${count++}) [${name.full_name}](${name.url})\n`;
                    else return;
                });
                const embed = new Discord.MessageEmbed() // embed for choosing repo name 
                    .setTitle("Related repositories")
                    .setDescription(repoNames)
                    .setFooter("choose a number for more info");
                message.channel.send(embed);

                const filter = m => m.author.id === message.author.id;  // filter
                const collector = new Discord.MessageCollector(message.channel, filter, { max: 1 });    // message collector

                collector.on("end", collected => {                  // on ending
                    let num = parseInt(collected.first().content);  // parse the content to a nmber
                    if (isNaN(num)) return collected.first().reply("you didnt provide a valid number."); // if it is NaN, return
                    num = num - 1;
                    const repo = data.items[num];       // get the data from the index received
                    const stuff = {                     // idk why but yes
                        author: {
                            name: repo.owner.login,
                            url: repo.owner.html_url,
                            avatar: repo.owner.avatar_url
                        },
                        desc: repo.description,
                        name: repo.full_name,
                        url: repo.html_url,
                        createdAt: repo.created_at,
                        updatedAt: repo.updated_at,
                        starts: repo.stargazers_count,
                        language: repo.language,
                        issues: repo.open_issues,
                        license: repo.license.name,
                        forks: repo.forks
                    }
                    const embed = new Discord.MessageEmbed()    // new embed for showing data
                        .setTitle(stuff.name)
                        .setURL(stuff.url)
                        .setDescription(stuff.desc)
                        .addFields(
                            { name: "Author", value: `[${stuff.author.name}](${stuff.author.url})` },
                            { name: "Stars", value: stuff.starts },
                            { name: "Issues", value: stuff.issues },
                            { name: "Language", value: stuff.language },
                            { name: "Forks", value: stuff.forks },
                            { name: "License", value: stuff.license },
                            { name: "Created at", value: new Date(stuff.createdAt).toDateString() },
                            { name: "Updated at", value: new Date(stuff.updatedAt).toDateString() },
                        )
                        .setThumbnail(stuff.author.avatar);
                    message.channel.send(embed)     // send the embed
                })

            })
        })
        request.end();      // close the request connection
    }
}