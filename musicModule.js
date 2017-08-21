//Quick check to see if everything is legit
function QuickCheck(msg) {

    if (msg[4] == null && msg[1] != null && msg[2] != null && msg[3] != null) {
        return false;
    } else if (msg[4] != null) {

        //Check numbers...
        var n1 = msg[2].split(':');
        var n2 = msg[3].split(':');

        var isnum11 = /^\d+$/.test(n1[0]);
        var isnum12 = /^\d+$/.test(n1[1]);

        var isnum21 = /^\d+$/.test(n2[0]);
        var isnum22 = /^\d+$/.test(n2[1]);

        if (isNaN(n1[1]) === true && isNaN(n2[1]) === true) {
            // 50 50 example

            //Check to see if they are valid numbers
            if (isnum11 && isnum21) {
                var link = msg[4];
                var startTime = parseInt(msg[2]);
                var endTime = parseInt(msg[3]);
                console.log(link + " : " + startTime + " : " + endTime);
                //Check to see if the left numbers are smaller than the right numbers

                var check = (startTime < endTime) ? true : false;
                if (check) {
                    //yay Store this
                    console.log('check complete');
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
}

//Deletes old cmd window and opens a new one... :)
exports.reload = function(){
  const { spawn } = require('child_process');

  const bat = spawn('cmd.exe', ['/c', 'start run_reformed.bat']);
  spawn('cmd.exe', ['/c', 'closeOldBat.bat']);

}

//Used to download a youtube song
function downloadYoutubeSong(voiceChannel,word,link,vStart,vEnd,output){
  var ffmpeg = require('fluent-ffmpeg');
  const ytdl = require('ytdl-core');
  const fs = require('fs');
  const loadJsonFile = require('load-json-file');

  var youtubeFiles = './UnEditted_Audio/fsStream/';
  var ffmpegFiles = './Audio/UserWords/';
  var normalWords = './Audio/';
  var jsonWordsPath = './words.json';

  console.log(output);
  var outputLoc = youtubeFiles + output +'.mp4';
  const video = ytdl(link);
  video.pipe(fs.createWriteStream(outputLoc));

  video.on('end', () => {
    video.end();
    console.log('Ended');
    console.log('Stream has been destroyed and file has been closed');
    var newAudioName = ffmpegFiles+word+'.mp3';
    ffmpegGO(outputLoc,newAudioName,vStart,vEnd);
    });
}

//Uses ffmpeg to take a snippet out of the youtube song and saves it as the word.mp3
function ffmpegGO(audioName, newAudioName,vStart,vEnd){
  var ffmpeg = require('fluent-ffmpeg');
  const ytdl = require('ytdl-core');
  const fs = require('fs');
  const loadJsonFile = require('load-json-file');

  var youtubeFiles = './UnEditted_Audio/fsStream/';
  var ffmpegFiles = './Audio/UserWords/';
  var normalWords = './Audio/';
  var jsonWordsPath = './words.json';

  const { spawn } = require('child_process');

  var cmdString = "ffmpeg -y -ss " + vStart + ' -t ' + vEnd + ' -i ' + audioName + ' ' + newAudioName;

  const bat = spawn('cmd.exe', ['/c', cmdString]);

  bat.stdout.on('data', (data) => {
  console.log(data.toString());
  });

  bat.stderr.on('data', (data) => {
  console.log(data.toString());
  });

  bat.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
  //reload bot...... temp hack
  exports.reload();
  });
}

//Re-reads the json file and is only called when a user requests a new word
function ReloadJSON(voiceChannel,m){
  var ffmpeg = require('fluent-ffmpeg');
  const ytdl = require('ytdl-core');
  const fs = require('fs');
  const loadJsonFile = require('load-json-file');

  var youtubeFiles = './UnEditted_Audio/fsStream/';
  var ffmpegFiles = './Audio/UserWords/';
  var normalWords = './Audio/';
  var jsonWordsPath = './words.json';

  console.log('HopeFully Reading & writing is done by now');

    var obj = loadJsonFile.sync(jsonWordsPath);
    var msg = m.split(' ').slice(0);

    console.log(obj);

    //loop over file and get the right UserWords
    obj.UserWords.forEach(function(word){
      if(msg[4] === word.word)
      {
        console.log('Link: ' + word.link);
        //Download song
          downloadYoutubeSong(voiceChannel,word.word,word.link,
            word.startTime,word.endTime,
            word.word + (word.startTime << 3) + (word.endTime << 11));
      }
    });
}

//Mesage = `request <link> <time start> <time end> <Word>
exports.storeSong = function(message,voiceChannel, userID, jsonFile) {

    var ffmpegFiles = './Audio/UserWords/';

    var lower = message.toLowerCase();
    msg = lower.split(' ').slice(0);
    var i = 0;

    linkmsg = message.split(' ').slice(0);
    //console.log(msg[1] != null);
    //console.log(msg[2] != null);
    //console.log(msg[3] != null);
    //console.log(msg[4] != null);

    //Just to make sure
    if (msg[0] === '`request') {
        if (msg[4] == null && msg[1] != null && msg[2] != null && msg[3] != null) {

            return false;
        } else if (msg[4] != null) {

            //Check numbers...

            var n1 = msg[2].split(':');
            var n2 = msg[3].split(':');

            var isnum11 = /^\d+$/.test(n1[0]);
            var isnum12 = /^\d+$/.test(n1[1]);

            var isnum21 = /^\d+$/.test(n2[0]);
            var isnum22 = /^\d+$/.test(n2[1]);

            if (isNaN(n1[1]) === true && isNaN(n2[1]) === true) {
                // 50 50 example

                //Check to see if they are valid numbers
                if (isnum11 && isnum21) {
                    var link = linkmsg[1];
                    var startTime = parseInt(msg[2]);
                    var endTime = parseInt(msg[3]);
                    var wordToSave = msg[4];

                    //Check to see if the left numbers are smaller than the right numbers

                    var check = (startTime < endTime) ? true : false;
                    if (check) {
                        //yay Store this
                        var fs = require('fs');
                        fs.readFile(jsonFile, 'utf8', function readFileCallback(err, data) {

                            if (err) {
                                console.log(err);
                            } else {
                                obj = JSON.parse(data);
                                obj.UserWords.forEach(function(word) {

                                    if (i < obj.UserWords.length) {
                                        if (wordToSave != word.word) {
                                            i += 1;
                                        }
                                    }
                                    if (i == obj.UserWords.length) {
                                        //console.log(str.link(link));
                                        console.log("Saving word: " + wordToSave);
                                        obj.UserWords.push({
                                            userID: userID,
                                            word: wordToSave,
                                            startTime: startTime,
                                            endTime: endTime,
                                            link: link,
                                            Filename: ffmpegFiles+wordToSave
                                        }); //add some data
                                        json = JSON.stringify(obj, null, 4); //convert it back to json as well as make it look good
                                        fs.writeFileSync(jsonFile, json, 'utf8'); // write it back
                                        ReloadJSON(voiceChannel,message);
                                        return true;
                                    }
                                })
                            }
                        })
                    } else {
                        return false;
                    }
                }
            } else if (isNaN(n1[1]) === true && isNaN(n2[1]) === false) {
                // 30 1:50 example

                //Check to see if they are valid numbers
                if (isnum11 && isnum21 && isnum22) {
                    console.log('numbers valid Seconds -> minutes');
                    var link = msg[1];
                    var startTime = parseInt(msg[2]);
                    var endTime = msg[3]; //This should be optional
                    var wordToSave = msg[4];

                    var endNumSecs = endTime.split(':');
                    console.log(endNumSecs);
                    var na = (parseInt(endNumSecs[0])) * 60;
                    var na1 = parseInt(endNumSecs[1]);

                    var res = na + na1;
                    console.log(res);
                    var check = (startTime < res) ? true : false;

                    if (check) {
                        //yay Set up youtube vid
                        return true;
                        //How the youtube link will look
                        //https://www.youtube.com/embed/BmOpD46eZoA?start=36&end=41&autoplay=1
                    } else {
                        return false;
                    }
                }
            } else if (isNaN(n1[1]) === false && isNaN(n2[1]) === true) {
                // 1:50 30 example

                //Don't even bother to validate since someones trying to be a meme
                console.log('you trying to be funny huh');
            } else {
                // 1:50 1:60 example
                //Check to see if they are valid numbers
                if (isnum11 && isnum12 && isnum21 && isnum22) {
                    console.log('numbers valid both minutes');
                    var link = msg[1];
                    var startTime = msg[2];
                    var endTime = msg[3]; //This should be optional
                    var wordToSave = msg[4];

                    var startNumSecs = startTime.split(':');
                    var endNumSecs = endTime.split(':');

                    //Mins to seconds + parsing the strings of the numbers to actual ints
                    var sna1 = parseInt(startNumSecs[0]) * 60;
                    var esna1 = parseInt(endNumSecs[0]) * 60;

                    //parsing the strings of the numbers to actual ints
                    var sena2 = parseInt(startNumSecs[1]);
                    var ena2 = parseInt(endNumSecs[1]);

                    //Adding them together
                    var sres = (sna1 + sena2);
                    var eres = (esna1 + ena2);

                    //checking if the first number is smaller than the last
                    var check = (sres < eres) ? true : false;
                    if (check) {
                        //yay Set up youtube vid
                        return true;
                        //How the youtube link will look
                        //https://www.youtube.com/embed/BmOpD46eZoA?start=36&end=41&autoplay=1

                    } else {
                        return false;
                    }
                }
            }
        } else {
            return false;
        }
    }
}

//Message = `update <word> <new link> <start time> <end time>`
exports.updateLink = function(lookingForWord, userID, jsonFile) {
    var fs = require('fs');
    var msg = lookingForWord.split(' ').slice(0);
    console.log(msg);

    if (msg[0] === '`update') {
        //change link here
        fs.readFile(jsonFile, 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                obj = JSON.parse(data);
                obj.UserWords.forEach(function(word) {
                    if (msg[1] == word.word) {
                        //check id
                        if (userID == word.userID) {
                            if (QuickCheck(msg)) {
                                word.link = msg[4];
                                word.startTime = msg[2];
                                word.endTime = msg[3];

                                json = JSON.stringify(obj, null, 4); //convert it back to json as well as make it look good
                                fs.writeFile(jsonFile, json, 'utf8'); // write it back
                            }
                        }
                    }
                })
            }
        })
    }

}

//Message = `delete <word>
exports.deleteWord = function(lookingForWord, userID, jsonFile) {
    var fs = require('fs');
    var msg = lookingForWord.split(' ').slice(0);
    var i = 0;
    if (msg[0] === '`delete') {
        //change link here
        fs.readFile(jsonFile, 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    obj = JSON.parse(data);
                    obj.UserWords.forEach(function(word) {
                            i += 1;
                            if (msg[1] == word.word) {
                                //check id
                                if (userID == word.userID) {
                                    //remove word
                                    var deleteNum =  i - 1;
                                    console.log('removing word...' + deleteNum);
                                    console.log(obj.UserWords.splice(deleteNum,1));
                                    //console.log(obj.UserWords);
                                //write the change to file
                                json = JSON.stringify(obj, null, 4); //convert it back to json as well as make it look good
                                fs.writeFile(jsonFile, json, 'utf8'); // write it back
                            }
                        }
                    })
            }
        })
      }
}
