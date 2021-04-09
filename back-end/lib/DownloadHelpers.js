const path = require('path');
const mkdirp = require('mkdirp')
const Aria2 = require("aria2");
const aria2 = new Aria2([{
    host: 'localhost',
    port: 6800,
    secure: false,
    secret: '',
    path: '/jsonrpc'
}]);

let connected = false;

const initAria2c = ()=>{
    return new Promise((resolve, reject) => {
        aria2
            .open()
            .then((arg) => resolve(arg))
            .catch(err => reject(err));

        // emitted when the WebSocket is open.
        aria2.on('open', () => {
            console.log('aria2 OPEN');
            connected = true;
        });

// emitted when the WebSocket is closed.
        aria2.on('close', () => {
            console.log('aria2 CLOSE');
            connected = false;
        });

// emitted for every message sent.
        aria2.on("output", m => {
            console.log("aria2 OUT", m);
        });

        // emitted for every message received.
        aria2.on("input", m => {
            console.log("aria2 IN", m);
        });
    })
}
const downloadUrl = (url, destinationPath) => {
    const dest_directory = path.resolve(path.dirname(destinationPath));
    try {
        mkdirp.sync(dest_directory);
    } catch (e) {
        console.error(e);
    }
    const fileName = path.basename(destinationPath);

    return new Promise(async (resolve, reject) => {
        if (!connected) await initAria2c();
        if (!connected) throw new Error("Aria")
        const guid = await aria2.call("addUri", [url], { dir: dest_directory,out:fileName});
        console.log('guid:', guid);
        let onError = ([{gid}])=>{
            if (guid == gid){
                reject('Download Error!')
            }
            aria2.removeListener('onDownloadError', onError);
        };
        aria2.on('onDownloadError',onError)
        let onComplete = ([{gid}])=>{
            if (gid == guid){
                resolve(destinationPath);
            }
            aria2.removeListener('onDownloadComplete', onComplete);
        };
        aria2.on('onDownloadComplete',onComplete)

     /*   const notifications = await aria2.listNotifications();
        /!*
        [
          'onDownloadStart',
          'onDownloadPause',
          'onDownloadStop',
          'onDownloadComplete',
          'onDownloadError',
          'onBtDownloadComplete'
        ]
        *!/

        // notifications logger example
        notifications.forEach((notification) => {
            aria2.on(notification, (params) => {
                console.log('notification:', notification, params);
            })
        })*/
    })
}

module.exports={
    downloadUrl,
}