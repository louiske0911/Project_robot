package com.example.robert.outputsensor;


import android.app.Activity;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.TextView;

import java.util.List;

/*
 * Android 系統內建八種感測器的，他們分別是：
 1.加速度感測器（accelerometer）
 2.陀螺儀(gyroscope)
 3.環境光照感測器(light)
 4.磁力感測器(magnetic field)
 5.方向感測器(orientation)
 6.壓力感測器(pressure)
 7.距離感測器(proximity)
 8.溫度感測器(temperature)。
 利用這些感測器我們可以製作出各種有趣的應用程式和遊戲。
 需要提醒的是模擬器中無法使用感測器
 */

public class MainActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        final TextView tx1 = (TextView) findViewById(R.id.textView1);
        // 從系統服務中獲得感測器管理器
        SensorManager sm = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        // 從感測器管理器中獲得全部的感測器列表
        List<Sensor> allSensors = sm.getSensorList(Sensor.TYPE_ALL);
        // 顯示有多少個感測器
        tx1.setText("經檢測該手機有" + allSensors.size() + "個感測器，他們分別是：\n");
        // 顯示每個感測器的具體資訊
		/* s.getName()設備名稱
		 * s.getVersion()設備版號
		 * s.getVendor()供應商
		 */
        for (Sensor s : allSensors) {
            String tempString = "\n" + " 設備名稱：" + s.getName() + "\n" + " 設備版本："
                    + s.getVersion() + "\n" + " 供應商：" + s.getVendor() + "\n";
            switch (s.getType()) {
                case Sensor.TYPE_ACCELEROMETER:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 加速度感測器 accelerometer" + tempString);
                    break;
                case Sensor.TYPE_GYROSCOPE:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 陀螺儀感測器gyroscope" + tempString);
                    break;
                case Sensor.TYPE_LIGHT:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 環境光線感測器light" + tempString);
                    break;
                case Sensor.TYPE_MAGNETIC_FIELD:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 電磁場感測器magnetic field" + tempString);
                    break;
                case Sensor.TYPE_ORIENTATION:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 方向感測器orientation" + tempString);
                    break;
                case Sensor.TYPE_PRESSURE:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 壓力感測器pressure" + tempString);
                    break;
                case Sensor.TYPE_PROXIMITY:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 距離感測器proximity" + tempString);
                    break;
                case Sensor.TYPE_TEMPERATURE:
                    tx1.setText(tx1.getText().toString() + s.getType()
                            + " 溫度感測器temperature" + tempString);
                    break;
                default:
                    tx1.setText(tx1.getText().toString() + s.getType() + " 未知感測器"
                            + tempString);
                    break;
            }
        }
    }
}