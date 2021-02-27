const Discord = require("discord.js");              // import stuff
const { Client, Message } = require("discord.js");
const https = require("https")

module.exports = {
    name: ["docs", "documentation"],         // define command name and aliases
    /**
    * @param {Message} message
    * @param {String[]} args
    * @param {Client} client
    */
    run: async (message, args, client) => {  // define the function
        https.get(`https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args.join(" "))}`, res => { // get request to the api with https module coz why not😉
            let embedData = "";               // define a global variable to store the data
            res.on("data", e => {             // on data event
                embedData += e;               // append the buffer chunks to the global var
            })
            res.on("end", () => {             // on end event
                const embed = new Discord.MessageEmbed(JSON.parse(embedData)) // create an embed with the data
                    .setColor("#29ba9d");     // set color to a different one
                message.channel.send(embed);  // send the embed 
            })
        })
    }
}