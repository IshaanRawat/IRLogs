const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require("web-push");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://irlogs-f4861.firebaseio.com"
});

exports.storeLogsData = functions.https.onRequest((request, response) => {
    cors(request, response, function() {
        admin.database().ref('posts').push({
            id: request.body.id,
            title: request.body.title,
            location: request.body.location,
            image: request.body.image
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
            response.status(201).json({message: "Data stored.", id: request.body.id});
        })
        .catch((err) => {
            response.status(500).json({error: err});
        });
    });
});
