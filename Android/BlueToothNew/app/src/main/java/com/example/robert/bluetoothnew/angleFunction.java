package com.example.robert.bluetoothnew;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.IBinder;
import android.util.Log;

import java.util.List;

/**
 * Created by robert on 2017/11/26.
 */

public class angleFunction extends Service implements SensorEventListener{

    public SensorManager sensorManager;
    public float orientationValue = 0;
    public float gyroscopeValue = 0;
    public float [] accelerometerValue = null;
    public float [] tesla = null;
    double magnitude = 0.0;
    @Override
    public void onCreate() {
        super.onCreate();
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        SetSensorAccelerometer();
        SetSensormagnetic();
        SetSensorGyroscope();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    protected void SetSensorOrientation() {
        List sensors = sensorManager.getSensorList(Sensor.TYPE_ORIENTATION);
        //如果有取到該手機的方位感測器，就註冊他。
        if (sensors.size() > 0) {
            //registerListener必須要implements SensorEventListener，
            //而SensorEventListener必須實作onAccuracyChanged與onSensorChanged
            //感應器註冊
            sensorManager.registerListener(this, (Sensor) sensors.get(0), SensorManager.SENSOR_DELAY_NORMAL);
        }
    }
    protected void SetSensormagnetic() {
        List sensors = sensorManager.getSensorList(Sensor.TYPE_MAGNETIC_FIELD);
        //如果有取到該手機的方位感測器，就註冊他。
        if (sensors.size() > 0) {
            //registerListener必須要implements SensorEventListener，
            //而SensorEventListener必須實作onAccuracyChanged與onSensorChanged
            //感應器註冊
            sensorManager.registerListener(this, (Sensor) sensors.get(0), SensorManager.SENSOR_DELAY_NORMAL);
        }
    }
    protected void SetSensorGyroscope() {
        List sensors = sensorManager.getSensorList(Sensor.TYPE_GYROSCOPE);
        //如果有取到該手機的方位感測器，就註冊他。
        if (sensors.size() > 0) {
            //registerListener必須要implements SensorEventListener，
            //而SensorEventListener必須實作onAccuracyChanged與onSensorChanged
            //感應器註冊
            sensorManager.registerListener(this, (Sensor) sensors.get(0), SensorManager.SENSOR_DELAY_NORMAL);
        }
    }
    protected void SetSensorAccelerometer() {
        List sensors = sensorManager.getSensorList(Sensor.TYPE_ACCELEROMETER);
        //如果有取到該手機的方位感測器，就註冊他。
        if (sensors.size() > 0) {
            //registerListener必須要implements SensorEventListener，
            //而SensorEventListener必須實作onAccuracyChanged與onSensorChanged
            //感應器註冊
            sensorManager.registerListener(this, (Sensor) sensors.get(0), SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        if(sensorEvent.sensor.getType()== Sensor.TYPE_ORIENTATION){
            float [] temp = sensorEvent.values.clone();
            Log.v("AngleValue", "angleValue(current) ： " + String.valueOf(temp[0]));//方向感測器的 X 角度
            orientationValue = temp[0];
        }else if(sensorEvent.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD){
            float [] temp = sensorEvent.values.clone();
            tesla = temp;
            float azimuth = Math.round(temp[0]);
            float pitch = Math.round(temp[1]);
            float roll = Math.round(temp[2]);
            magnitude = Math.sqrt((azimuth * azimuth)+(pitch * pitch)+(roll * roll));
            Log.v("magnetic","magnitude : "+magnitude);
        }else if(sensorEvent.sensor.getType() == Sensor.TYPE_GYROSCOPE){
            float [] temp = sensorEvent.values.clone();
            Log.v("Gyroscope", "Gyroscope ： " + String.valueOf(temp[0]));//陀螺儀感測器的 X 角度
            gyroscopeValue = temp[0];
        }else if(sensorEvent.sensor.getType() == Sensor.TYPE_ACCELEROMETER){
            float [] temp = sensorEvent.values.clone();
            Log.v("Accelerometer", "Accelerometer ： " + String.valueOf(temp[0]));//加速度感測器的 X 角度
            accelerometerValue = temp;
        }else{}     //the others sensor
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }
}
