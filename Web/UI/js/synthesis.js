function Speech(text) {
    var synth = window.speechSynthesis;
    var voices = synth.getVoices();
    var t = "according to the South Korean constitution, the chairperson of the cabinet, the chief executive of the government, commander-in-chief of the armed forces, and the head of state of South Korea. The Constitution and the amended Presidential Election Act of 1987 provide for election of the president by direct, secret ballot, ending sixteen years of indirect presidential elections under the preceding two governments. The president is directly elected to a five-year term with no possibility of re-election. If a presidential vacancy should occur, a successor must be elected within sixty days, during which time presidential duties are to be performed by the prime minister or other senior cabinet members in the order of priority as determined by law. While in office, the chief executive lives in Cheong Wa Dae (the 'Blue House'), and is exempt from criminal liability (except for insurrection or treason).";
    t = text
    var u = new SpeechSynthesisUtterance(t);
    u.onend = function () { console.log("on end!"); }
    u.onerror = function () { console.log("on error!"); }
    u.onpause = function () { console.log("on pause"); }
    u.onresume = function () { console.log("on resume"); }
    u.onstart = function () { console.log("on start"); }
    synth.cancel();
    synth.speak(u);
    var r = setInterval(function () {
        console.log(synth.speaking);
        if (!synth.speaking) clearInterval(r);
        else synth.resume();
    }, 14000);
} 
