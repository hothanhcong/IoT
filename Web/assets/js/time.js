setInterval(function currentTime() {
    var d = new Date()
   
    // document.getElementById('day').innerText = d.toDateString()
    document.getElementById('times').innerHTML = d.toLocaleTimeString()
    var day = d.getDate()
    var mon = d.getMonth()+1
    var year = d.getFullYear()
    document.getElementById('day').innerHTML = `<br>Ngày ${day} tháng ${mon}`
}, 10)
