package com.example.robert.magneticforce;

import android.hardware.SensorListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    TextView myTextView1,myTextView2,myTextView3;
    private SensorManager mySensorManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        myTextView1 = (TextView) findViewById(R.id.textView1);
        myTextView2 = (TextView) findViewById(R.id.textView2);
        myTextView3 = (TextView) findViewById(R.id.textView3);
    }

    @Override
    protected void onResume() {
        //重寫的onResume方法

        mySensorManager.registerListener(//註冊監聽
                mySensorListener,           //監聽器SensorListener物件
                SensorManager.SENSOR_MAGNETIC_FIELD,//感測器的類型為讀取
                SensorManager.SENSOR_DELAY_UI//頻率
        );

        super.onResume();
    }
    private SensorListener mySensorListener = new SensorListener(){

        @Override
        public void onAccuracyChanged(int sensor, int accuracy) {

        }
        //重寫onAccuracyChanged方法
        @Override
        public void onSensorChanged(int sensor, float[] values) {   //重寫onSensorChanged方法
            if(sensor == SensorManager.SENSOR_MAGNETIC_FIELD){
                //只檢查磁場的變化
                myTextView1.setText("x方向的磁場分量為："+values[0]);

                //將資料顯示到TextView
                myTextView2.setText("y方向的磁場分量為："+values[1]);

                //將資料顯示到TextView
                myTextView3.setText("z方向的磁場分量為："+values[2]);

                //將資料顯示到TextView
            }

        }
    };
}
