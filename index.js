require("dotenv").config();
const soundboardList = require("./resources/soundboardList.js").soundboardList;
const redditList = require("./resources/redditList.js").redditList;
const redditFetch = require("reddit-fetch");
// gpt requirements
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.GPTAPI,
});
const openai = new OpenAIApi(configuration);

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// login i activity
client.on("ready", () => {
  console.log(`Logged as ${client.user.tag}!`);
  client.user.setActivity("Type help for help");
});

// lowercase in commands
function isCommand(command, message) {
  return !!message.content.toLowerCase().startsWith(command);
}

// CHAT GPT text-generation
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("gpt")) return;

  if (message.content.startsWith("gpt")) {
    const res = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: message.content,
      max_tokens: 1000,
      temperature: 0.9,
    });
    message.channel.send({ content: `${res.data.choices[0].text}` });
  }
});

// DALL-E image-generation
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("img")) return;

  if (message.content.startsWith("img")) {
    const resIMG = await openai.createImage({
      prompt: message.content,
      n: 1,
      size: "512x512",
    });
    message.channel.send({ content: `${resIMG.data.data[0].url}` });
  }
});

// text messages answers
client.on("messageCreate", (message) => {
  if (isCommand("help", message)) {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("XD.BOT v0.2 SFW")
      .setAuthor({
        name: "sensu",
        iconURL: "https://avatars.githubusercontent.com/u/119530198?v=4",
        url: "https://github.com/is3nsu",
      })
      .setDescription("4fun bot for XD CREW")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/443082781682302977/1063504439354343465/f2s3ebc1wt361.jpg"
      )
      .addFields({
        name: "\u200B",
        value: "\u200B",
      })
      .addFields(
        {
          name: "How to use:",
          value: "Type one of the commands listed below",
        },
        {
          name: "\u200B",
          value: "\u200B",
        }
      )
      .addFields(
        {
          name: "How to use chatGPT:",
          value: `Precede each phrase with "gpt", e.g. gpt give a cheesecake recipe.
          Depending on the complexity of the question/potential answer, the bot may take some time and the answer will be generated up to 10 seconds.
          If the query is poorly worded, e.g. if it is too short, the bot may sometimes throw an error message or the answer may be unrelated to the question asked.
          The GPT API is under a trial license, so it has a limited number of requests. Try not to ask complicated questions, because the more "token requests" the bot manages, the faster this limit will be exhausted.
          Have fun 😎`,
        },
        {
          name: "\u200B",
          value: "\u200B",
        }
      )
      .addFields(
        {
          name: "How to use DALL-E (AI generated images):",
          value: `As in chatGPT, precede the message with "img" and type a sentence with the description of the picture you want. DALL-E is in beta and may spit out nonsense. Like its predecessor, the AI is limited - it can generate a maximum of 50 images per hour and is under a trial license. In addition, AI is censored (beta - false positives can happen) and using a banned word crashes the bot and requires a manual restart. (putin is also a banned word). 😅`,
        },
        {
          name: "\u200B",
          value: "\u200B",
        }
      )
      .addFields(
        {
          name: "🔤 Text commands:",
          value: `github
      tobe
      cool
      dice`,
          inline: true,
        },
        {
          name: "🎶 YT music:",
          value: `!play (name/url)
          !stop
          !pause
          !resume`,
          inline: true,
        }
      )
      .addFields({
        name: "\u200B",
        value: "\u200B",
      })
      .addFields(
        {
          name: "🎵 Soundboard:",
          value: `zapukaj
          siuu         
          pierd        
          succ
          johncena
          jason
          naura
          cj
          yasuo`,
          inline: true,
        },
        {
          name: "🖼 Random SubReddit IMG's:",
          value: `memes
          pussy
          doge`,
          inline: true,
        }
      )
      .addFields({
        name: "\u200B",
        value: "\u200B",
      })
      .setFooter({
        text: "HOSTED ON 256MB RAM 😥",
        iconURL:
          "https://cdn.discordapp.com/attachments/443082781682302977/1063504439354343465/f2s3ebc1wt361.jpg",
      });
    message.channel.send({ embeds: [helpEmbed] });
  }
  if (isCommand("tobe", message)) {
    message.reply("or not to be 🧾");
  }
  if (isCommand("cool", message)) {
    let cool = Math.floor(Math.random() * 100 + 1);
    message.reply(`You are ${cool}% cool 😎`);
  }
  if (isCommand("github", message)) {
    message.reply("https://github.com/is3nsu");
  }
  if (isCommand("dice", message)) {
    message.reply(
      `${message.author} thrown **${Math.trunc(Math.random() * 6 + 1)}**`
    );
  }
});

// SOUNDBOARD
const voiceDiscord = require("@discordjs/voice");
const { joinVoiceChannel } = require("@discordjs/voice");

client.on("messageCreate", async (message) => {
  function soundboard(msg, url) {
    if (isCommand(msg, message)) {
      const channel = message.member.voice.channel;
      if (!channel)
        return message.channel.send("Join any voice channel first...");

      const player = voiceDiscord.createAudioPlayer("");
      const resource = voiceDiscord.createAudioResource(url);

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      player.play(resource);
      connection.subscribe(player);
      player.on(voiceDiscord.AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });
    }
  }

  for (let i = 0; i < soundboardList.length; i++) {
    soundboard(soundboardList[i].name, soundboardList[i].link);
  }
});

// DISTUBE - voice yt
const { DisTube } = require("distube");
client.distube = new DisTube(client, {
  leaveOnStop: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
});
const prefix = "!";

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  if (command === "play") {
    client.distube
      .play(message.member.voice.channel, args.join(""), {
        message,
        textChannel: message.channel,
        member: message.member,
      })
      .catch((err) => {
        message.reply(err.message);
      });
  }

  if (command === "stop") {
    client.distube.stop(message);
    client.distube.voices.get(message)?.leave();
    message.channel.send("End of party😭");
  }

  if (command === "pause") {
    client.distube.pause(message);
    message.channel.send("Paused ⏸");
  }

  if (command === "resume") {
    client.distube.resume(message);
    message.channel.send("Resumed 🎶");
  }
});

//img reddit json
client.on("messageCreate", async (message) => {
  function redditRandom(msg, subreddit) {
    if (isCommand(msg, message)) {
      redditFetch({
        subreddit: subreddit,
        sort: "hot",
        allowNSFW: true,
        allowModPost: true,
        allowCrossPost: true,
        allowVideo: true,
        gallery: false,
      }).then((post) => {
        message.channel.send(`${message.author} it's for you ${post.url}`);
      });
    }
  }

  for (let i = 0; i < redditList.length; i++) {
    redditRandom(redditList[i].name, redditList[i].subreddit);
  }
});

// TOKEN
client.login(process.env.TOKEN);
