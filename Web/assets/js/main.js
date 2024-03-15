const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const sidebar = $('.sidebar');
const btnHeader = $('.header__bar')
const content = $('.content')
const tabs = $$('.sidebar_item-link')
const currentLocation = location.href
const deviceId = $('.device__row')

const app = {
    currentIndex: 0,

    sourses: [
        {
            name: 'Đèn',
            imgOn: './assets/img/lightbulb-on.png',
            imgOff: './assets/img/lightbulb-off.png'
        },
        {
            name: 'Tưới nước',
            imgOn: './assets/img/pump-on.png',
            imgOff: './assets/img/pump-off.png'
        },
        {
            name: 'Quạt thông gió',
            imgOn: './assets/img/vent-fan.png',
            imgOff: './assets/img/vent-fan.png'
        },
    ],
    //------render html---
    render: function() {
        _this= this

        const htmls = this.sourses.map(function(sourse, index) {
            return `
                <div class="device__row-list-item ">
                    <div class="device__row-item">
                        <span class="device__row-item-name">${sourse.name}</span>
                        <div class="device__row-item-img">
                            <img class="device__row-item-image" src="${sourse.imgOff}" alt="">
                        </div>
                    </div>
                    <div class="device__row-item-icon btn--success">
                        <i class="fa-solid fa-toggle-off item-icon data-index= ${index}"></i>
                    </div>
                </div>
            `
        })
        console.log(htmls)
        deviceId.innerHTML = htmls.join('')

        const btnDevices = $$('.item-icon')

        btnDevices.forEach((device, index) => {
            device.onclick = function(e) {
                console.log(index)
                const checkClass = e.target.closest('.fa-toggle-off')
                if(checkClass) {
                    device.classList.add('fa-toggle-on')
                    device.classList.remove('fa-toggle-off')
                    if(index === 0) {
                        updateFirebaseOnLight()
                    }
                    else if (index === 1){
                        updateFirebaseOnWater()
                    }
                    else {
                        updateFirebaseOnFan()
                    }
                }
                else {
                    device.classList.add('fa-toggle-off')
                    device.classList.remove('fa-toggle-on')
                    if(index === 0) {
                        updateFirebaseOffLight()
                    }
                    else if(index === 1){
                        updateFirebaseOffWater()
                    }
                    else {
                        updateFirebaseOffFan()
                    }
                }
            }
        })

        function toast({message = '', type= 'on' , duration = 3000}) {
            const main = $('#toast')
            if(main) {
                const toast = document.createElement('div')
                const icons = {
                    on: 'fa-solid fa-circle-check',
                    off: 'fa-solid fa-circle-exclamation'
                }

                const icon = icons[type]
                const delay = duration / 1000

                toast.classList.add('toast', `toast--${type}`)
                toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`
                
                const autoRemoveId = setTimeout(function() {
                    main.removeChild(toast)
                }, duration + 1000)

                toast.onclick = function(e) {
                    if(e.target.closest('.toast__close')) {
                        main.removeChild(toast)
                        clearTimeout(autoRemoveId)
                    }
                }

                toast.innerHTML = `
                    <div class="toast__icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="toast__body">
                        <div class="toast__msg">${message}</div>
                    </div>
                    <div class="toast__close">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                `
                main.appendChild(toast)
            
            }
        }

        function onDevice() {
            toast({
                message: 'Bật thiết bị thành công.',
                type: 'on',
                duration: 3000
            })
        }

        function offDevice() {
            toast({
                message: 'Tắt thiết bị thành công',
                type: 'off',
                duration: 3000
            })
        }
        
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
        
        //-----wirte value firebase in browser-----
        firebase.database().ref("/IoT/Humidity").on("value", (snapshot) => {
            document.getElementById("humidity").innerHTML = snapshot.val()
        });
        
        firebase.database().ref("/IoT/Temperature").on("value", (snapshot) => {
            document.getElementById("temp").innerHTML = snapshot.val()
            //----22-25
            // if(snapshot.val() > 24) {
            //     updateFirebaseOnWater()
            // }
            // else updateFirebaseOffWater()
        });
        
        firebase.database().ref("/IoT/GroundHumidity").on("value", (snapshot) => {
            document.getElementById("water-droplet").innerHTML = snapshot.val()
            // if(snapshot.val() < 80) {
            //     updateFirebaseOnLight()
            // }
            // else updateFirebaseOffLight()
        });

        firebase.database().ref("/IoT/Intensity").on("value", (snapshot) => {
            document.getElementById("insensity").innerHTML = snapshot.val()
            // if(snapshot.val() > 1000) {
            //     updateFirebaseOnFan()
            // }
            // else updateFirebaseOffFan()
        });
        
        //------ firebase on, off device---
        btnDevices.forEach((device, index) => {
            switch(index) {
                case 0:
                    firebase.database().ref("/IoT/Led").on("value", (snapshot) => {
                        val = snapshot.val()
                        if(val === 0) {
                            device.classList.add('fa-toggle-off')
                            device.classList.remove('fa-toggle-on')
                            offDevice()
                        }
                        else if(val === 1){
                            device.classList.add('fa-toggle-on')
                            device.classList.remove('fa-toggle-off')
                            onDevice()
                        }
                    })
                    break
                case 1:
                    firebase.database().ref("/IoT/Water").on("value", (snapshot) => {
                        val = snapshot.val()
                        if(val === 0) {
                            device.classList.add('fa-toggle-off')
                            device.classList.remove('fa-toggle-on')
                            offDevice()
                        }
                        else if(val === 1){
                            device.classList.add('fa-toggle-on')
                            device.classList.remove('fa-toggle-off')
                            onDevice()
                        }
                    })
                    break
                case 2:
                    firebase.database().ref("/IoT/Fan").on("value", (snapshot) => {
                        val = snapshot.val()
                        if(val === 0) {
                            device.classList.add('fa-toggle-off')
                            device.classList.remove('fa-toggle-on')
                            offDevice()
                        }
                        else if(val === 1){
                            device.classList.add('fa-toggle-on')
                            device.classList.remove('fa-toggle-off')
                            onDevice()
                        }
                    })
                    break
            }
        })
        //----update firebase-----
        function updateFirebaseOnLight() {
            firebase.database().ref("/IoT").update({
                "Led": 1
            })
        }
        function updateFirebaseOffLight() {
            firebase.database().ref("/IoT").update({
                "Led": 0
            })
        }
    
        function updateFirebaseOnWater() {
            firebase.database().ref("/IoT").update({
                "Water": 1
            })
        }

        function updateFirebaseOffWater() {
            firebase.database().ref("/IoT").update({
                "Water": 0
            })
        }

        function updateFirebaseOnFan() {
            firebase.database().ref("/IoT").update({
                "Fan": 1
            })
        }
        function updateFirebaseOffFan() {
            firebase.database().ref("/IoT").update({
                "Fan": 0
            })
        }

    },

    start: function() {
        this.render()
    }
}

app.start()