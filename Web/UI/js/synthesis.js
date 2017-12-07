var t;

function Speech(text) {
    var synth = window.speechSynthesis;
    var voices = synth.getVoices();
    t = ""
    t = text
    var u = new SpeechSynthesisUtterance(t);
    u.onend = function() { console.log("on end!"); }
    u.onerror = function() { console.log("on error!"); }
    u.onpause = function() { console.log("on pause"); }
    u.onresume = function() { console.log("on resume"); }
    u.onstart = function() { console.log("on start"); }

    // u.lang = voices[5].lang
    synth.cancel();
    synth.speak(u);
    console.log("NowText" + t)
    var r = setInterval(function() {
        console.log(synth.speaking);
        if (!synth.speaking) clearInterval(r);
        else synth.resume();
    }, 14000);
}