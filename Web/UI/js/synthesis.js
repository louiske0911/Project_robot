function Speech(text) {
    var worte = new SpeechSynthesisUtterance(text);
    var stimmen = window.speechSynthesis.getVoices();
    worte.voice = stimmen[6];
    window.speechSynthesis.speak(worte);

    // speechSynthesis.speak(SpeechSynthesisUtterance('Hello World'));
}