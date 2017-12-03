package com.example.robert.tts;

/**
 * Created by robert on 2017/12/2.
 */

import android.content.Context;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import java.util.Locale;

public class MyTTS implements TextToSpeech.OnInitListener{

    private Context context;
    private TextToSpeech mTextToSpeech = null;
    private boolean isLoaded = false;

    // initTTS
    public MyTTS(Context context){
        try {
            this.context = context;
            this.mTextToSpeech = new TextToSpeech(context, this);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onInit(int status) {
        Log.v("status",""+TextToSpeech.SUCCESS);
        if (status == TextToSpeech.SUCCESS)
        {
            mTextToSpeech.setLanguage(Locale.US);
            isLoaded = true;
        }
        else
        {
            isLoaded = false;
        }
    }

    // stop action about tts
    public void close(){
        if(mTextToSpeech != null)
        {
            mTextToSpeech.stop();
            mTextToSpeech.shutdown();
        }
    }

    public void queueSpeak(String text) {
        if (isLoaded)
            mTextToSpeech.speak(text, TextToSpeech.QUEUE_ADD, null);
    }

    public void flushSpeak(String text) {
        if (isLoaded)
            mTextToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null);
    }

}