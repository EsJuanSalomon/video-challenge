const socket = io();

var wasRecentlyUpdated = false;
var video = document.getElementById('video');
video.volume = 0.3;

//client events
video.onplay = () => {

    if(!wasRecentlyUpdated){
    
        socket.emit('client.video:play', {user: socket.id});
        console.log("you've replayed the video for everyone");
    }
    wasRecentlyUpdated = false;
};

video.onpause = () => {

    if(!wasRecentlyUpdated){

        socket.emit('client.video:pause', {user: socket.id});
        console.log("you've paused the video for everyone");
    }
    wasRecentlyUpdated = false;
}

video.onseeked = (e) => {

    if(!wasRecentlyUpdated && e.target.currentTime >= 1){

        socket.emit('client.video:seeked', {currentTime: e.target.currentTime, user: socket.id});
        console.log("you've changed the current time of the video for everyone");
    }
    wasRecentlyUpdated = false;
};

//server messages
socket.on('server.video:play', (data) => {

    wasRecentlyUpdated =  true;
    video.play();
    console.log(`${data.user} has replayed the video for everyone`);
});

socket.on('server.video:pause', (data) => {

    wasRecentlyUpdated =  true;
    video.pause();
    console.log(`${data.user} has paused the video for everyone`);
});

socket.on('server.video:seeked', (data) => {

    wasRecentlyUpdated = true;
    video.currentTime = data.currentTime; 
    console.log(`${data.user} has changed the current time of the video at ${data.currentTime}`);
});

socket.on('server.video:currentTime', (data) => {

    socket.emit('client.video:currentTime', {currentTime: video.currentTime, paused: video.paused});
    console.log("you has been shared your current time");
});

socket.on('server.video:JoinToCurrentTime', (data) => {

    wasRecentlyUpdated =  true;
    video.currentTime = data.currentTime;

    wasRecentlyUpdated =  !data.paused;
    if(!data.paused) video.play();
    console.log("welcome");
});