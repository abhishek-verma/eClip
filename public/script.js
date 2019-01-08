const clipboardWatcher = require('electron-clipboard-watcher');
const {clipboard} = require('electron');

const CLIPBOARD_UPDATE_EVENT_KEY = 'clip';
const PORT = 8241;
var socket;

function clipboardUpdateEventHandler(data) {
    console.log("Recieved Clipboard event: " + data.text);
    document.getElementById('content').innerHTML = data.text; 
}

window.onload = function() {
    var windowTopBar = document.getElementById('clipboard_container');
    windowTopBar.style.webkitAppRegion = "drag";

    var createBtn = document.getElementById('create');
    var connectBtn = document.getElementById('connect');

    createBtn.addEventListener('click', () => {

        const app = require('http').createServer();
        socket = require('socket.io')(app);
        var ip = require('ip');

        app.listen(PORT);

        socket.on('connection', (io) => {
            console.log('A New Device Connected!')

            io.on(CLIPBOARD_UPDATE_EVENT_KEY, clipboardUpdateEventHandler)
        });
        // socket.on('test', (data) => {console.log(data)});
        socket.on(CLIPBOARD_UPDATE_EVENT_KEY, clipboardUpdateEventHandler)

        var ipAddr = ip.address() ;

        console.log(`Created server on URL: ${ipAddr}:${PORT}`);

        watchClipboard();
    });

    connectBtn.addEventListener('click', () => {
        var url = "http://"+document.getElementById('url').value;
        socket = require('socket.io-client')(url);

        // socket.on('connect', console.log(`Connected to ${url}`));

        socket.on(CLIPBOARD_UPDATE_EVENT_KEY, clipboardUpdateEventHandler);
        // socket.emit('test', "test");

        // watchClipboard();
    })
    
    
}

function watchClipboard() {
    const watcher = clipboardWatcher({
        // (optional) delay in ms between polls
        watchDelay: 1000,
    
        // handler for when image data is copied into the clipboard
        onImageChange: function (nativeImage) { },
    
        // handler for when text data is copied into the clipboard
        onTextChange: function (text) { 
            document.getElementById('content').innerHTML = text; 
            console.log("copied: " + text);

            socket.emit(CLIPBOARD_UPDATE_EVENT_KEY, {text: text});
            console.log("emitted!");
        }
    });

}