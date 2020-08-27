import express from 'express';
import path from 'path';
import SocketIO from 'socket.io'

let users = [];
let waiting = [];
let videoData = {

    SocketCurrenTime: null
}

const app = express();
app.set('port', process.env.PORT || 4000);

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});

const io = SocketIO.listen(server);

io.on('connection', (socket) => {

    console.log('new connection ', socket.id);
    
    users.push(socket.id);
    waiting.push(socket.id);
    requestCurrenTime(socket.id);

    socket.on('client.video:currentTime', (data) => {

        if(waiting.length){

            waiting.forEach(id => io.to(id).emit("server.video:JoinToCurrentTime", data));
            waiting.length = 0;
        }
    });

    socket.on('client.video:pause', (data) => {

        socket.broadcast.emit('server.video:pause', data);
    });
    
    socket.on('client.video:play', (data) => {
    
        socket.broadcast.emit('server.video:play', data);
    });
    
     socket.on('client.video:seeked', (data) => {

        socket.broadcast.emit('server.video:seeked', data);
        console.log('server: ', data.user, 'has seeked the video at ', data.currentTime);
    });

    socket.on('disconnect', (data) => {

        users.splice(users.indexOf(socket.id), 1);
        if(waiting.indexOf != -1) waiting.splice(waiting.indexOf(socket.id), 1);
        console.log(socket.id, 'has disconected from the server');
        if(videoData.SocketCurrenTime === socket.id){

            if(users.length) videoData.SocketCurrenTime = users[0];
            else{
                console.log("0 users");
                videoData.SocketCurrenTime = null;  
            }
        }
    });
});

function requestCurrenTime(id){

    if(videoData.SocketCurrenTime === null){

        console.log("new first socket");
        videoData.SocketCurrenTime = id;
        io.to(id).emit('server.video:JoinToCurrentTime', {currentTime: 0, paused: false});
        waiting.splice(waiting.indexOf(id), 1);
    }
    else{
        console.log("requesting currentTime to ", videoData.SocketCurrenTime);
        io.to(videoData.SocketCurrenTime).emit("server.video:currentTime", {});
    } 
}