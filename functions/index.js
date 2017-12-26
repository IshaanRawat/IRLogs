const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require("web-push");
const formidable = require("formidable");
const fs = require("fs");
const UUID = require("uuid-v4");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./firebase-key.json");
const gcConfig = {
    projectID: "irlogs-f4861",
    keyFilename: "firebase-key.json"
};
const gcs = require("@google-cloud/storage")(gcConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://irlogs-f4861.firebaseio.com"
});

exports.storeLogsData = functions.https.onRequest((request, response) => {
    cors(request, response, function() {
        var uuid = new UUID();
        var formData = new formidable.IncomingForm();
        formData.parse(request, function (err, fields, files) {
            fs.rename(files.image.path, "/tmp/" + files.image.name);
            var bucket = gcs.bucket("");
            bucket.upload("/tmp/" + files.image.name, {
                uploadType: "media",
                metadata: {
                    metadata: {
                        contentType: files.image.type,
                        firebaseStorageDownloadTokens: uuid
                    }
                }
            }, function (err, file) {
                if(!err) {
                    admin.database().ref('posts').push({
                        id: fields.id,
                        title: fields.title,
                        location: fields.location,
                        image: "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid
                    })
                    .then(() => {
                        const vapidPrivateKey = "jfijteP7yQR89sveCsBJfQ1qW5BTARzudRJlZ2PKAtY";
                        const vapidPublicKey = "BBTlbc29fuuQW8m18NEZ01AK2rl_IpgES37cYzGGwO0gTKCoozliJNhkAbHcMqcTg-hFnrv-77-BwBxktOyn-bE";
                        webpush.setVapidDetails("mailto:support@ishaanrawat.com", vapidPublicKey, vapidPrivateKey);
                        return admin.database().ref("subscriptions").once("value");
                    })
                    .then((subscriptions) => {
                        subscriptions.forEach((sub) => {
                            let pushConfig = {
                                endpoint: sub.val().endpoint,
                                keys: {
                                    auth: sub.val().keys.auth,
                                    p256dh: sub.val().keys.p256dh
                                }
                            };
                            webpush.sendNotification(pushConfig, JSON.stringify({
                                title: "New Post",
                                content: "New Post Added!",
                                location: "/"
                            }))
                            .catch((err) => {
                                console.log(err);
                            });
                        });
                        response.status(201).json({message: "Data stored.", id: fields.id});
                    })
                    .catch((err) => {
                        response.status(500).json({error: err});
                    });
                } else {
                    console.log(err);
                }
            });
        })
    });
});
