package com.example.root12_31.demo_google;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import static java.lang.Thread.sleep;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.widget.*;
/**
 * Created by root12-31 on 2017/4/23.
 */

public class init extends AppCompatActivity {
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        setContentView(R.layout.init);
        try {
            sleep(1000);

        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }
}
