const firebaseConfig = {
    apiKey: "AIzaSyCXglY9XgNFAlf3EQv2A9aQLx4gVXheR3Y",
    authDomain: "tt-iot-21acd.firebaseapp.com",
    databaseURL: "https://tt-iot-21acd-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tt-iot-21acd",
    storageBucket: "tt-iot-21acd.appspot.com",
    messagingSenderId: "487304084412",
    appId: "1:487304084412:web:87ae3bbee3c668d28349b9",
    measurementId: "G-6LLMPC3P6R"
};

firebase.initializeApp(firebaseConfig);


firebase.database().ref("/IoT/Humidity").on("value", (snapshot) => {
document.getElementById("humidity").innerHTML = snapshot.val()
});

firebase.database().ref("/IoT/Temperature").on("value", (snapshot) => {
document.getElementById("temp").innerHTML = snapshot.val()
});

firebase.database().ref("/IoT/GroundHumidity").on("value", (snapshot) => {
    document.getElementById("water-droplet").innerHTML = snapshot.val()
    });