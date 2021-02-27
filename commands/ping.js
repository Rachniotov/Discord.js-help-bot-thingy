const Discord = require("discord.js");  // import stuff
const { Client, Message } = require("discord.js");

module.exports = {
    name: ["ping", "pong"],                  // define command name and aliases
    /**
    * @param {Message} message
    * @param {String[]} args
    * @param {Client} client
    */
    run: async (message, args, client) => {  // main function
        const msg = await message.channel.send("Pinging...");  // send a message for calculating ping
        let embed = new Discord.MessageEmbed()                 // create a new embed
            .setTitle("Pong!")                                 // set title 
            .setDescription(`Ping: ${msg.createdTimestamp - message.createdTimestamp}`) // set description
        msg.edit("👀", embed);                                 // send the embed
    }
}