var tActive = 10; // in s
var tShortBreak = 60; // in s
var tLongBreak = 7; //in s
var counter = 0; // counts nr of sessions
var timer;
var timerID;
var focused;
var laSensor;
var streak = 0;
var tips = ['Trink was 💧', 'Snack ein Obst 🍏', 'Beweg dich 💃', 'Öffne das Fenster 🦨', 'Geh kurz mal raus ☀️', 'Atme kurz durch 🌪️']; 
var xMax = 0, yMax = 0, zMax = 0; 

window.onload = init();

function init(){
    focused = true;
    setTimer(tActive);
    startLinearAccelerometer();
    document.getElementById('label').innerHTML = "Los geht's!";
}

function startSession(){
    document.getElementById('label').innerHTML = "Höchste Konzentration!";
    if (laSensor != null) {
        laSensor.start();
    }
    countdown();
}

function stopSession(){
    clearInterval(timerID);
    if (laSensor != null) {
        laSensor.stop();
    }
}

function takeBreak(){
    if (laSensor != null){
        //laSensor.stop();
        activeBreak();
    } else {
        showTip();
    }        
    document.getElementById('btn').style.visibility = "hidden";
    let time;
    if(counter < 4){
        //short break
        time = tShortBreak;
    } else {
        // longer break
        time = tLongBreak;
        // new round
        counter = 0;
    }
    setTimer(time);
    countdown();
}

function setTimer(time){
    timer = time;
    let minutes, seconds;
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    
    // Fill in leading 0 if necessary
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    
    // Ausgabe
    document.getElementById('timer').innerHTML = minutes + ":" + seconds;
}

// expects duration in seconds!
function countdown() {
    timerID = setInterval(function () {
        setTimer(timer);
        if (--timer < 0) {
            clearInterval(timerID);
            if (focused) {
                counter++;
                focused = false;
                updateStreak();
                takeBreak();
                document.getElementById('label').innerHTML = "Wohlverdiente Pause";
            } else {
                if(laSensor != null){
                    document.getElementById('score').style.display = "none";
                    document.getElementById('score').style.visibility = "hidden";  
                    laSensor.removeEventListener('reading', showScore);
                    laSensor.addEventListener('reading', dontTouch);
                }
                resetMsg();
                setTimer(tActive);
                focused = true;
                let btn = document.getElementById('btn');
                btn.innerHTML = "START";
                btn.onclick = startBtn;
                btn.style.visibility = "visible";
                document.getElementById('label').innerHTML = "Und weiter geht's!";
            }
        }
    }, 1000); // invoked every second
}

function startBtn(){
    let btn = document.getElementById('btn');
    btn.innerHTML = "STOP";
    btn.onclick = stopBtn;
    resetMsg();
    startSession();
}

function stopBtn(){
    let btn = document.getElementById('btn');
    btn.innerHTML = "WEITER";
    btn.onclick = startBtn;
    stopSession();
}

function dontTouch(){
    let x = laSensor.x;
    let y = laSensor.y;
    let z = laSensor.z;
    if (Math.abs(x**2 + y**2 + z**2)> 0.15) {
        document.getElementById('message').innerHTML = "Hey, lass dich nicht ablenken!";
        stopBtn();
    }
}

function startLinearAccelerometer(){
    if ('LinearAccelerationSensor' in window) {
        try {
            // 1 reading per second
            laSensor = new LinearAccelerationSensor({frequency: 10});
            laSensor.addEventListener('reading', dontTouch);
        } catch (error) {
          // Handle construction errors.
          if (error.name === 'SecurityError') {
            console.log('Fehler: Zugriff auf Sensor wurde von Permissions Policy blockiert.');
          } else if (error.name === 'ReferenceError') {
            console.log('Fehler: Gerät hat keinen Beschleunigungssensor.');
          } else {
            throw error;
          }
        }
    }
}

function resetMsg(){
    document.getElementById('message').innerHTML = "";
}

function updateStreak(){
    streak++;
    document.getElementById('streak').innerHTML = streak;
}

function showTip(){
    let i = getRandomInt(tips.length - 1);
    let tip = tips[i];
    document.getElementById('message').innerHTML = "<b>Tipp: </b>" + tip;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// val - {x, y, z}, id - {xBar, yBar, zBar}, max
function move(val, label, max){
    let bar = document.getElementById(label);
    max += Math.abs(val);
    if (max < 100){
        bar.style.height = max + "%";
    } else {
        bar.style.height = "100%";
    }
    /*if (val > max) {
        // new max for movement on this axis
        var bar = document.getElementById(label);
        var height = max;
        var limit = score(val);
        max = limit;
        var id = setInterval(frame, 10);
        function frame() {
            if (height >= limit) {
                clearInterval(id);
            } else {
                height++;
                bar.style.height = height + "%";
            }
        }
    }*/
}

function showScore(){
    move(laSensor.x, "xBar", xMax);
    move(laSensor.y, "yBar", yMax);
    move(laSensor.z, "zBar", zMax);
    
}

function score(val){
    /*TODO: better scoring formula*/
    let s = Math.abs(val);
    return s;
}

function activeBreak(){
    document.getElementById('score').style.display = "flex";
    document.getElementById('score').style.visibility = "visible";
    laSensor.removeEventListener('reading', dontTouch);
    laSensor.addEventListener('reading', showScore);
}
