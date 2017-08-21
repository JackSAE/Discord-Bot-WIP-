const Discord = require('discord.js');
const fs = require('fs');
const chalk = require('chalk');
var mysql = require('mysql');
const loadJsonFile = require('load-json-file');

//Owner stuff here
var auth = require('./auth.json');

const owner = auth.owner;
const token = auth.bot_token;

//JSON shit
var channelsJSON = require('./servers.json');

//This has big problem
var wordsJSON = require('./words.json');
var jsonWordsPath = './words.json';

//user requested sound samples
var normalWords = './Audio/';

const musicModule = require('./musicModule.js')
const client = new Discord.Client();

//Meme music shit
var isReady = true;
var playingSound = false;

//When the bot is ready
client.on('ready', () => {
    console.log("Connected as: " + client.user.username);
    console.log("Connected ID: " + client.user.id);

});

//Used to randomly get an obj
if (!Array.prototype.randomlyPick) Object.defineProperty(Array.prototype, 'randomlyPick', {
    enumerable: false,
    value: function() {
        return this[Math.floor(Math.random() * this.length)];
    }
});

//Used to play a sound
function playSound(voiceChannel, sound) {
    //console.log(voiceChannel);
    //console.log(sound);
    voiceChannel.join().then(connection => {
        const dispatcher = connection.playFile(sound + '.mp3');
        dispatcher.on("end", end => {
            voiceChannel.leave();
            playingSound = false;
            isReady = true;
        });
    }).catch(err => console.log(err));

}

//gets a random sound from the obj
function getRandomSound(obj) {
    var sound_test = obj.randomlyPick();
    return sound_test;
}

//Checks to see if a word is already entered into the array
function QuickCheck(word){
  var msg = m.split(' ').slice(0);
  var obj = loadJsonFile.sync(jsonWordsPath);
  obj.UserWords.forEach(function(uWord){
    if(uWord.word == msg[4])
      return true;
    else {
      return false;
    }
  });
}

//Whenever a message is sent in any server
client.on('message', message => {
    m = message.content;
    var sound;
    var message_lowerCase = m.toLowerCase();

    //Reloads the bot
    if (m.includes('`reload') && message.author.id == owner) {
      musicModule.reload();
    }

    //Loops over channels and checks if the channel is in the list
    channelsJSON.channels.forEach(function(channel) {
        if (message.channel.id === channel.channelid && message.channel.type !== 'dm') {
            var voiceChannel = message.member.voiceChannel;
            var foundUserWords = false;
            var foundUnique = false;

            //Adds a new word to the user json file
            if (m.includes('`request')) {
                //Check words
                if(!QuickCheck((m))){
                    //store word
                     musicModule.storeSong(m,voiceChannel, message.author.id, jsonWordsPath)
                }
                //TODO: Change this to re-read the wordsJSON var instead of reloading the bot
            }

            //Deletes a word from the json file
            if (m.includes('`delete') && message.author.id == owner) {
                console.log(musicModule.deleteWord(m, message.author.id, jsonWordsPath));
            }

            //Changes a word from the json file... (Doesn't work atm)
            if (m.includes('`update') && message.author.id == owner) {
                console.log(musicModule.updateLink(m, message.author.id, jsonWordsPath));
            }

            //Leaves a voice channel
            if(m.includes('`leave') && message.author.id == owner){
              client.guilds.forEach(function(g){
                try {
                  vc = g.voiceConnection;
                  if(vc !== null)
                  {
                    vc.disconnect();
                  }
                }catch(err){console.log(err);}
              })

            }

            //Checks to see if the message contains a word from the UserWords array
            wordsJSON.UserWords.forEach(function(userWord) {
                if (message_lowerCase.startsWith(userWord.word)) {

                    console.log(userWord.word);

                    if (isReady && voiceChannel != null) {
                      sound = userWord.Filename;
                      console.log(sound);
                        if (!playingSound) {
                          isReady = false;
                          playingSound = true;
                          //getYoutubeSong(voiceChannel,userWord.link,userWord.startTime,userWord.endTime);
                          playSound(voiceChannel,sound);
                        }
                    }
                    foundUserWords = true;
                }
                foundUserWords = false;
            });
            if(!foundUserWords){
              //Checks to see if the message contains a word from the unique words array
              wordsJSON.uniques.forEach(function(uWord) {
                  if (message_lowerCase.includes(uWord.uWord)) {
                      console.log(uWord.uWord);
                      //get a random sound from the uFileNames array :)
                      if (isReady && voiceChannel != null) {
                          sound = getRandomSound(uWord.uFileNames);
                          sound = normalWords+sound.FileName;
                          if (!playingSound) {
                              isReady = false;
                              playingSound = true;
                              playSound(voiceChannel, sound);
                          }
                      }
                      foundUnique = true;
                  }
                  foundUnique = false;
              });
            } if(!foundUserWords && !foundUnique){
              //Checks to see if the message contains a word from the standard owner entered array
                wordsJSON.words.forEach(function(word) {
                    //console.log(word.Word);
                    if (message_lowerCase.includes(word.Word)) {
                        if (isReady && voiceChannel != null) {
                            sound = normalWords+word.FileName;
                            console.log(sound);
                            if (!playingSound) {
                                isReady = false;
                                playingSound = true;
                                playSound(voiceChannel, sound);
                            }
                        }
                    }
                })
            }
            //If the message is a dm
        } else if (message.channel.type === 'dm') {
            console.log("User: " + message.author.username + " ID: " + message.author.id + " Message: " + message);
        }
    })
})

//Bot token - need this
client.login(token);
