/**
 * 作者： 邱皇旗
 * e-mail : a0983080692@gmail.com
 */
package com.example.robert.bluetoothnew;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.speech.tts.TextToSpeech;
import android.support.annotation.RequiresApi;
import android.util.Log;
import android.widget.Toast;

import com.google.android.gms.maps.model.LatLng;

import java.util.List;
import java.util.Locale;

import static java.lang.Math.pow;
import static java.lang.Math.sqrt;

/**
 * Created by robert on 2017/11/26.
 */

public class angleFunction extends Service implements SensorEventListener, TextToSpeech.OnInitListener {

    public SensorManager sensorManager;         //註冊sensor 服務
    public float orientationValue = 0;
    public float gyroscopeValue = 0;
    public float[] accelerometerValue = null;
    public float[] tesla = null;
    double magnitude = 0.0;
    public Handler mHandler = new Handler();
    private TextToSpeech tts = null;            //註冊語音

    public StringBuffer mOutStringBuffer = new StringBuffer("");
    public LatLng lastPosition;
    public ArrivalGoal arrivalGoal = new ArrivalGoal();             //宣告 ArrivalGoal ，計算是否抵達最終的目的地
    ArrivalDestination arrivalDestination = new ArrivalDestination();       //宣告ArrivalDestination 物件，ArrivalDestination 用來判斷是否抵達候選點
    public BluetoothChatService bluetoothChatService;               //註冊bluetooth 服務
    public CalculateAngleCurrentToGoal calculateAngleCurrentToGoal = new CalculateAngleCurrentToGoal();     //宣告CalculateAngleCurrentToGoal ，這個物件是用來計算角度，input （當下角度·當下座標·下一個節點座標）
    boolean arrivalDirection = false;
    public String[] judgeIsSpecialPointResult = {"0", "0"};     //
    public LatLng special;
    boolean lock = true;    //讓在判斷是否為特殊點，如果還沒判斷完畢，就不給呼叫
    Broadcast broadcast;


    Path path = new Path();     //宣告 Path ，進行路徑規劃
    SingleTonTemp singleTonTemp;

    private Handler handler = new Handler();
    private Long startTime;
    float modifyAngle = 0;


    public void initSingleTonTemp() {       //宣告singleTon
        singleTonTemp = SingleTonTemp.getInstance();
    }

    @Override
    public void onCreate() {
        super.onCreate();
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        /**
         * sensor 感測器註冊
         */
        SetSensorAccelerometer();
        SetSensormagnetic();
        SetSensorGyroscope();
        SetSensorOrientation();

        /**
         * 初始化各個物件
         */
        initSingleTonTemp();
        initBluetooth();
        initsetTTS();
        initBroadcase();
        initLocationBroadCast();
        setAngle();
        /**
         * 開始執行感測器跟指令的監聽
         */
        handler.postDelayed(position, 500);
    }

    public void callWeb(String string, String string1) {        //傳兩個String到web上，web會回傳語音內容
        Log.v("callWeb", "callWeb" + string + string1);
        Intent broadcasetIntent = new Intent();
        broadcasetIntent.setAction("CallWeb");          //註冊BroatCase的通道
        broadcasetIntent.putExtra("type", string);      //通道傳遞參數名
        broadcasetIntent.putExtra("id", string1);       //通道傳遞參數名
        if (!string.equals("0")) {              //init judgeIsSpecialPointResult
            judgeIsSpecialPointResult[0] = "0";
            judgeIsSpecialPointResult[1] = "0";
        }
        sendBroadcast(broadcasetIntent);
    }

    public void initBluetooth() {
        bluetoothChatService = BluetoothChatService.getInstance(this);
        bluetoothChatService.setmHandler(mHandler);
    }

    public void setAngle() {            //等待開始指令（就是 layout上的箭頭觸發）
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction("run");
        broadcast = new Broadcast() {
            @Override
            public void run() {
                super.run();
                startTime = System.currentTimeMillis();
                handler.removeCallbacks(updateTimer);
                Log.v("startTime", "" + startTime);
                //設定Delay的時間
                sendMessage("888");
                handler.postDelayed(stopIfOr, 500);         //每500 ms，呼叫stopIfOr function ，依據路徑規劃的數據，走節點
                handler.postDelayed(updateTimer, 1000);     //每1000 ms，updateTimer function ，依據當下角度，開始跟pi3溝通

            }
        };
        registerReceiver(broadcast, intentFilter);
    }

    public void setPathEnd(LatLng latLng) {
        singleTonTemp.directionPosition = latLng;
        path.setEnd(latLng);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    /**
     * init sensor service
     */
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

    /**
     * 獲得各項sensor的值，每個sensor都會回傳一個float的arrary
     *
     * @param sensorEvent
     */
    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        if (sensorEvent.sensor.getType() == Sensor.TYPE_ORIENTATION) {
            float[] temp = sensorEvent.values.clone();
            orientationValue = temp[0];
        } else if (sensorEvent.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            float[] temp = sensorEvent.values.clone();
            tesla = temp;
            float azimuth = Math.round(temp[0]);
            float pitch = Math.round(temp[1]);
            float roll = Math.round(temp[2]);
            magnitude = sqrt((azimuth * azimuth) + (pitch * pitch) + (roll * roll));
            Log.v("magnetic", "magnitude : " + magnitude);
        } else if (sensorEvent.sensor.getType() == Sensor.TYPE_GYROSCOPE) {
            float[] temp = sensorEvent.values.clone();
            Log.v("Gyroscope", "Gyroscope ： " + String.valueOf(temp[0]));//陀螺儀感測器的 X 角度
            gyroscopeValue = temp[0];
        } else if (sensorEvent.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float[] temp = sensorEvent.values.clone();
            Log.v("Accelerometer", "Accelerometer ： " + String.valueOf(temp[0]));//加速度感測器的 X 角度
            accelerometerValue = temp;
        } else {
        }     //the others sensor
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }

    /**
     * 利用 磁力感測器 & 加速度感測器 計算角度
     *
     * @return
     */
    public float modifyAngleWithMagnetic() {
        float[] R = new float[9];
        float[] values = new float[3];
        if (accelerometerValue != null && tesla != null) {
            SensorManager.getRotationMatrix(R, null, accelerometerValue, tesla);   //計算旋轉矩陣
            SensorManager.getOrientation(R, values);
            return (float) Math.toDegrees(values[0]);
        } else {
            return 0;
        }
    }

    /**
     * 將取到的直傳給pi3，藉由BroatCase
     */
    private void initLocationBroadCast() {
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction("SendMessage");
        broadcast = new Broadcast() {
            @Override
            public void getMessage(String message) {
                super.getMessage(message);
                sendMessage(message);
            }
        };
        registerReceiver(broadcast, intentFilter);
    }

    /**
     * //將取到的直傳給pi3 ，傳計算結果
     *
     * @param message
     */

    public void sendMessage(String message) {
        // Check that we're actually connected before trying anything
        if (bluetoothChatService.getState() != BluetoothChatService.STATE_CONNECTED) {    //STATE_CONNECTED = 3
            Toast.makeText(getBaseContext(), R.string.not_connected, Toast.LENGTH_SHORT).show();   //問題
            return;
        }
        // Check that there's actually something to send
        if (message.length() > 0) {
            Log.v("message", "meesage :" + message);
            // Get the message bytes and tell the BluetoothChatService to write
            byte[] send = message.getBytes();
            bluetoothChatService.write(send);

            // Reset out string buffer to zero and clear the edit text field
            mOutStringBuffer.setLength(0);
        }
    }


    private Runnable position = new Runnable() {
        public void run() {
            LatLng latLng = singleTonTemp.Gps;  //從singleTon取值
            if (latLng == null) {
            } else {
                Log.v("PositionGPS", "longitude:" + latLng.longitude + " latitude:" + latLng.latitude);

                if (singleTonTemp.filterGps && (sqrt(pow(singleTonTemp.lastPosition.latitude - latLng.latitude, 2) + pow(singleTonTemp.lastPosition.longitude - latLng.longitude, 2)) * 111100) > 10) {
                    latLng = singleTonTemp.lastPosition;
                }          // filter deviation that is mush than 10 meters

//        lastPosition = latLng;
                calculateAngleCurrentToGoal.setCurrentPosition(latLng);     //calculateAngleCurrentToGoal 設定當下座標
                singleTonTemp.sourceStatus = true;
                path.setStart(latLng);      //path 設定開始座標
                singleTonTemp.lastPosition = latLng;        //SingleTon 暫存，當作上一個座標

                arrivalDestination.setSource(latLng);       //arrivalDestination ，設定開始座標
                arrivalGoal.setSource(latLng);      //arrivalGoal ，設定開始座標
                Log.v("Position", "longitude:" + latLng.longitude + " latitude:" + latLng.latitude);
            }

            handler.postDelayed(this, 500);
        }
    };
    private Runnable updateTimer = new Runnable() {
        public void run() {
            sendMessage("999");     //自走車的前進指令
            handler.postDelayed(this, 3000);
        }

        private void sendMessage(String message) {
            if (bluetoothChatService.getState() != BluetoothChatService.STATE_CONNECTED) {    //STATE_CONNECTED = 3
                Toast.makeText(getBaseContext(), R.string.not_connected, Toast.LENGTH_SHORT).show();   //問題
                return;
            }

            // Check that there's actually something to send
            if (message.length() > 0) {
                Log.v("message", "meesage :" + message);
                // Get the message bytes and tell the BluetoothChatService to write
                byte[] send = message.getBytes();
                bluetoothChatService.write(send);

                // Reset out string buffer to zero and clear the edit text field
                mOutStringBuffer.setLength(0);
            }
        }
    };
    private Runnable stopIfOr = new Runnable() {
        public void run() {
            boolean arrival = false;
            if (singleTonTemp.index < singleTonTemp.planPath.size()) {

                Log.v("Value", "Value: " + singleTonTemp.index + " " + singleTonTemp.planPath.size());

                calculateAngleCurrentToGoal.setGoalPosition(singleTonTemp.planPath.get(singleTonTemp.index));
                arrivalDestination.setDirection(singleTonTemp.planPath.get(singleTonTemp.index));
                arrival = arrivalDestination.calDistance();

                arrivalGoal.setDirection(singleTonTemp.planPath.get(singleTonTemp.planPath.size() - 1)); //??

                Log.v("arrival", "arrival: " + arrival);

//                special = singleTonTemp.Gps;

                if (arrival) {
                    if (lock) {
                        special = singleTonTemp.planPath.get(singleTonTemp.index);  //special 是用來判斷是否為特殊點
                        judgeIsSpecialPoint(special);
//                        callWeb(judgeIsSpecialPointResult[0], judgeIsSpecialPointResult[1]);
                        singleTonTemp.index++;
//                        callWeb("building", "19");

                    }
                    Log.v("special", "special: " + special);


                } else if (arrivalGoal.calDistance()) {         //計算是否抵達目的地
                    singleTonTemp.index = singleTonTemp.planPath.size();
                    arrival = true;
                }
            }
            communicationForStopIfOr(arrival);      //傳遞
            handler.postDelayed(this, 1000);

        }
    };

    public void communicationForStopIfOr(boolean arrival) {
        arrivalDirection = arrival;
    }

    private void judgeIsSpecialPoint(LatLng special) {
//            communicationForjudgeIsSpecialPoint("0" ,"0");
        int i = 0;
        int j = 0;
        lock = false;
        /**
         * callWeb帶的參數，是我們自己設定的
         */
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL1.length; i++) {       //育樂館
                if (Constants.SPECIAL1[i].equals(special)) {
                    callWeb("building", "5");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
//        mn  n
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL2.length; i++) {       //語言大樓
                if (Constants.SPECIAL2[i].equals(special)) {
                    callWeb("building", "7");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL3.length; i++) {       //忠勤樓&建築
                if (Constants.SPECIAL3[i].equals(special)) {
                    callWeb("building", "11");
                    special = null;
                    j = 1;
                    break;

                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL4.length; i++) {       //行政一館
                if (Constants.SPECIAL4[i].equals(special)) {
                    callWeb("building", "15");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL5.length; i++) {       //行政二館
                if (Constants.SPECIAL5[i].equals(special)) {
                    callWeb("building", "16");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL6.length; i++) {       //圖書館
                if (Constants.SPECIAL6[i].equals(special)) {
                    callWeb("building", "14");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL7.length; i++) {       //科航管
                if (Constants.SPECIAL7[i].equals(special)) {
                    callWeb("building", "18");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL8.length; i++) {       //商學院
                if (Constants.SPECIAL8[i].equals(special)) {
                    callWeb("building", "19");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL9.length; i++) {       //資電館
                if (Constants.SPECIAL9[i].equals(special)) {
                    callWeb("building", "13");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL10.length; i++) {      //電通館
                if (Constants.SPECIAL10[i].equals(special)) {
                    callWeb("college", "8");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL11.length; i++) {      //人言
                if (Constants.SPECIAL11[i].equals(special)) {
                    callWeb("building", "8");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL12.length; i++) {      //工學院
                if (Constants.SPECIAL12[i].equals(special)) {
                    callWeb("building", "12");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL13.length; i++) {      //第一招待所
                if (Constants.SPECIAL13[i].equals(special)) {
                    callWeb("andscape", "6");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL14.length; i++) {      //理學院
                if (Constants.SPECIAL14[i].equals(special)) {
                    callWeb("college", "9");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL15.length; i++) {      //人社館
                if (Constants.SPECIAL15[i].equals(special)) {
                    callWeb("building", "9");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL16.length; i++) {      //體育館
                if (Constants.SPECIAL16[i].equals(special)) {
                    callWeb("building", "2");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL17.length; i++) {      //丘逢甲紀念館
                if (Constants.SPECIAL17[i].equals(special)) {
                    callWeb("building", "17");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL18.length; i++) {      //分手步道
                if (Constants.SPECIAL18[i].equals(special)) {
                    callWeb("landscape", "4");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL19.length; i++) {      //水利大樓
                if (Constants.SPECIAL19[i].equals(special)) {
                    callWeb("building", "3");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL20.length; i++) {      //學思樓
                if (Constants.SPECIAL20[i].equals(special)) {
                    callWeb("building", "1");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL21.length; i++) {      //文創中心
                if (Constants.SPECIAL21[i].equals(special)) {
                    callWeb("landscape", "3");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL22.length; i++) {      //學思源
                if (Constants.SPECIAL22[i].equals(special)) {
                    callWeb("landscape", "1");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL23.length; i++) {      //綜合體育場
                if (Constants.SPECIAL23[i].equals(special)) {
                    callWeb("landscape", "2");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL24.length; i++) {      //榕榕大道
                if (Constants.SPECIAL24[i].equals(special)) {
                    callWeb("landscape", "7");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        if (j == 0) {
            for (i = 0; i < Constants.SPECIAL25.length; i++) {      //21步道
                if (Constants.SPECIAL25[i].equals(special)) {
                    callWeb("andscape", "4");
                    special = null;
                    j = 1;
                    break;
                }
            }
        }
        lock = true;
    }

//    private Runnable judgeIsSpecialPoint = new Runnable() {
//        public void communicationForjudgeIsSpecialPoint(String string1,String string2) {
//            Log.v("######","____"+string1+"  "+string2);
//            judgeIsSpecialPointResult[0] = string1;
//            judgeIsSpecialPointResult[1] = string2;
//        }
//        public void run() {
////            communicationForjudgeIsSpecialPoint("0" ,"0");
//            int i = 0;
//            for (i = 0; i < Constants.SPECIAL1.length; i++) {       //育樂館
//                if (Constants.SPECIAL1[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building" ,"5");
//                    special = null;
//                }
//            }
////            for (i = 0; i < Constants.test.length; i++) {       //育樂館
////                if (Constants.test[i].equals(special)) {
////                    communicationForjudgeIsSpecialPoint("building" ,"5");
////                    special = null;
////
////                }
////            }
//            for (i = 0; i < Constants.SPECIAL2.length; i++) {       //語言大樓
//                if (Constants.SPECIAL2[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building" ,"7");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL3.length; i++) {       //忠勤樓&建築
//                if (Constants.SPECIAL3[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building" ,"11");
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL4.length; i++) {       //行政一館
//                if (Constants.SPECIAL4[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","15");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL5.length; i++) {       //行政二館
//                if (Constants.SPECIAL5[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","16");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL6.length; i++) {       //圖書館
//                if (Constants.SPECIAL6[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","14");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL7.length; i++) {       //科航管
//                if (Constants.SPECIAL7[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","18");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL8.length; i++) {       //商學院
//                if (Constants.SPECIAL8[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","19");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL9.length; i++) {       //資電館
//                if (Constants.SPECIAL9[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","13");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL10.length; i++) {      //電通館
//                if (Constants.SPECIAL10[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("college","8");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL11.length; i++) {      //人言
//                if (Constants.SPECIAL11[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","8");
//                    special = null;
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL12.length; i++) {      //工學院
//                if (Constants.SPECIAL12[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","12");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL13.length; i++) {      //第一招待所
//                if (Constants.SPECIAL13[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("andscape","6");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL14.length; i++) {      //理學院
//                if (Constants.SPECIAL14[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("college","9");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL15.length; i++) {      //人社館
//                if (Constants.SPECIAL15[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","9");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL16.length; i++) {      //體育館
//                if (Constants.SPECIAL16[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","2");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL17.length; i++) {      //丘逢甲紀念館
//                if (Constants.SPECIAL17[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","17");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL18.length; i++) {      //分手步道
//                if (Constants.SPECIAL18[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("landscape","4");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL19.length; i++) {      //水利大樓
//                if (Constants.SPECIAL19[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","3");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL20.length; i++) {      //學思樓
//                if (Constants.SPECIAL20[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("building","1");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL21.length; i++) {      //文創中心
//                if (Constants.SPECIAL21[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("landscape","3");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL22.length; i++) {      //學思源
//                if (Constants.SPECIAL22[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("landscape","1");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL23.length; i++) {      //綜合體育場
//                if (Constants.SPECIAL23[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("landscape","2");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL24.length; i++) {      //榕榕大道
//                if (Constants.SPECIAL24[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("landscape","7");
//                    special = null;
//
//                }
//            }
//            for (i = 0; i < Constants.SPECIAL25.length; i++) {      //21步道
//                if (Constants.SPECIAL25[i].equals(special)) {
//                    communicationForjudgeIsSpecialPoint("andscape","4");
//                    special = null;
//
//                }
//            }
//            handler.postDelayed(this, 500);
//
//        }
//    };

    public void initBroadcase() {
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction("DO_SOME_THING");
        broadcast = new Broadcast() {
            @Override
            public void setposition(LatLng latLng) {
                super.setposition(latLng);
                singleTonTemp.directionPosition = latLng;
                setPathEnd(latLng);
                singleTonTemp.planPath = path.path();
                planPath();
            }
        };
        registerReceiver(broadcast, intentFilter);
    }

    /**
     * web 傳遞語音字串
     */
    public void initsetTTS() {
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction("setTTS");
        broadcast = new Broadcast() {
            @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
            @Override
            public void setTTS(String message) {
                super.setTTS(message);
                speakOut(message);
            }
        };
        registerReceiver(broadcast, intentFilter);
    }

    public void onDestroy() {
        super.onDestroy();
        unregisterReceiver(broadcast);
    }

    public void planPath() {    //告訴web 開始了
        Intent broadcasetIntent = new Intent();
        broadcasetIntent.setAction("return Result");
        broadcasetIntent.putExtra("OK", "OK");
        sendBroadcast(broadcasetIntent);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onInit(int status) {    //語音的初始設定
        if (status == TextToSpeech.SUCCESS) {

            int result = tts.setLanguage(Locale.TAIWAN);

            if (result == TextToSpeech.LANG_MISSING_DATA
                    || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("TTS", "This Language is not supported");
            } else {
                speakOut("");
            }

        } else {
            Log.e("TTS", "Initilization Failed!");
        }
    }

    /**
     * 語音說話的設定
     * @param content
     */
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public void speakOut(String content) {

        CharSequence text = content;
        tts.setPitch(0.5f);
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "id1");
    }

    public static class Broadcast extends BroadcastReceiver {
        GetLocationListener getLocationListener;

        public Broadcast() {
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action.equals("DO_SOME_THING")) {
                String longitude = intent.getStringExtra("LONGITUDE");
                String latitude = intent.getStringExtra("LATITUDE");
                Log.v("zzzz", "DO_SOME_THING  " + longitude + "," + latitude);
                LatLng point = new LatLng(Double.parseDouble(latitude), Double.parseDouble(longitude));
                setposition(point);
            } else if (action.equals("SendMessage")) {
                String message = intent.getStringExtra("Message");
                getMessage(message);
            } else if (action.equals("run")) {
                Log.v("zzzz", "run");
                run();
            } else if (action.equals("setTTS")) {
                Log.v("zzzz", "setTTS2");

                String message = intent.getStringExtra("message");
                Log.v("zzzz", "setTTS2" + message);
                setTTS(message);
            }
        }

        public void getMessage(String message) {
        }

        public void setposition(LatLng latLng) {
        }

        public void run() {
        }

        public void setTTS(String message) {

        }
    }


}
