var url = "./compiled-globalscene.json";
var images = [
    './assets/bad.png', './assets/bot.png',
    './assets/bul.png', './assets/heart.png', './assets/shortcircuit.png'
];
var sounds = [
    './sounds/boom.wav', './sounds/pick1.wav', './sounds/pick2.wav',
];

/*
var audio = new Audio('audio_file.mp3');
audio.play();
 */

var fbgameStarted = false;
FBInstant.initializeAsync().then(function() {
    fbgameStarted = true;
    console.log("initialized");
    images.forEach(function(src, index){
        var img = new Image();
        img.src = src;
        FBInstant.setLoadingProgress(Math.ceil(index / (images.length + sounds.length))*100);
    });


    var audios = sounds.map(function(src, index) {
        var audio = new Audio(src);
        //audio.play();
        FBInstant.setLoadingProgress(Math.ceil((index + images.length) / (images.length + sounds.length))*100);
        return audio;
    });

    var footer;
    var toBeat;
    var foeImg;

    FBInstant.startGameAsync().then(function() {
        console.log("start");

        var contextId = FBInstant.context.getID();
        var contextType = FBInstant.context.getType();
        var playerName = FBInstant.player.getName();
        var playerPic = FBInstant.player.getPhoto();
        var playerId = FBInstant.player.getID();
        var info = {
            contextId:contextId,
            contextType:contextType,
            playerName:playerName,
            playerPic:playerPic,
            playerId:playerId
        };
        console.log(info);
    //    var img = document.getElementById('img');
    //    img.src = playerPic;
    //    var log = document.getElementById('log');
    //    log.innerText = JSON.stringify(info);
        var fbHeader = document.getElementById('fb-header');

        var iii = fbHeader.appendChild(document.createElement('div'));
        iii.style.display = "flex";
        iii.style.flexDirection = "row";
        var d = iii.appendChild(document.createElement('div'));
        d.style.flex = "1";
        var img = d.appendChild(document.createElement('img'));
        img.style.width = "60px";
        img.style.height = "60px";
        img.src = playerPic;

        var d = iii.appendChild(document.createElement('div'));
        d.style.flex = "1";
        foeImg = d.appendChild(document.createElement('img'));
        foeImg.style.width = "60px";
        foeImg.style.height = "60px";
        foeImg.style.display = "none";

        var fff = fbHeader.appendChild(document.createElement('div'));
        fff.style.display = "flex";
        fff.style.flexDirection = "row";

        footer = fff.appendChild(document.createElement('div'));
        footer.style.flex = "1";
        footer.innerText = playerName;
        getMyScore(entry => {
            footer.innerText = entry.rank + ". " + entry.name
                +"\nScore: " + entry.score;
            if(entry.rank > 1) {
                getScore(leaderBoard => {
                    console.log(leaderBoard);
                    var entry = leaderBoard[0];
                    toBeat.innerText = !entry ? '' : entry.rank + ". " + entry.name
                        +"\nScore: " + entry.score;
                    foeImg.src = entry.pic;
                    foeImg.style.display = "";
                }, entry.rank-2, 1);
            }
        });

        toBeat = fff.appendChild(document.createElement('div'));
        toBeat.style.flex = "1";

        loadAnimation(url, document.getElementById("canvas"));
    });

    setScore = function (score, callback) {
        FBInstant
            .getLeaderboardAsync('Best Score2.' + FBInstant.context.getID())
            .then(leaderBoard => {
                console.log(leaderBoard.getName());
                return leaderBoard.setScoreAsync(score);
            })
            .then(() => {
                console.log('Score saved');
                callback();

                if(footer) {
                    getMyScore(entry => {
                        footer.innerText = entry.rank + ". " + entry.name
                            +"\nScore: " + entry.score;
                        if(entry.rank > 1) {
                            getScore(leaderBoard => {
                                console.log(leaderBoard);
                                var entry = leaderBoard[0];
                                toBeat.innerText = !entry ? '' : entry.rank + ". " + entry.name
                                    +"\nScore: " + entry.score;
                                foeImg.src = entry.pic;
                                foeImg.style.display = "";
                            }, entry.rank-2, 1);
                        } else {
                            foeImg.style.display = "none";
                            toBeat.innerText = "";
                        }
                    });
                }
            })
            .catch(error => console.error(error));

    };

    getScore = function (callback, rank, count) {
        FBInstant
            .getLeaderboardAsync('Best Score2.' + FBInstant.context.getID())
            .then(leaderBoard => leaderBoard.getEntriesAsync(count||10, rank||0))
            .then(entries => {
                callback(entries.map(entry => {
                    return {
                        rank: entry.getRank(),
                        name: entry.getPlayer().getName(),
                        pic: entry.getPlayer().getPhoto(),
                        score: entry.getScore(),
                    };
                }));
            }).catch(error => console.error(error));
    };

    getMyScore = function(callback) {
        FBInstant
            .getLeaderboardAsync('Best Score2.' + FBInstant.context.getID())
            .then(leaderboard => leaderboard.getPlayerEntryAsync())
            .then(entry => {
                callback({
                    rank: entry.getRank(),
                    name: entry.getPlayer().getName(),
                    pic: entry.getPlayer().getPhoto(),
                    score: entry.getScore(),
                });
            }).catch(error => {
                console.error(error)
            });
    };

    var alternate = 1;
    playSound = function(boom) {
        if(boom) {
            audios[0].play();
        } else {
            audios[alternate].play();
            alternate = 3-alternate;
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        if(!fbgameStarted) {
            loadAnimation(url, document.getElementById("canvas"));
        }
    },1000);
});