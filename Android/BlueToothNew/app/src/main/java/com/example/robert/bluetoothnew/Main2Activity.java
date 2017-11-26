package com.example.robert.bluetoothnew;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.Toast;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.PolylineOptions;

import java.util.ArrayList;
import java.util.List;

import static java.lang.Math.pow;
import static java.lang.Math.sqrt;

public class Main2Activity extends AppCompatActivity implements OnMapReadyCallback, SensorEventListener {

    ArrayList<MarkerOptions> markerOptionses = new ArrayList<MarkerOptions>();
    ArrayList<PolylineOptions> polylineOptionses = new ArrayList<PolylineOptions>();

    private GoogleMap mMap;
    private Handler handler = new Handler();
    private Long startTime;
    private SensorManager sensorManager;


    public Broadcast broadcast;
    public BluetoothChatService bluetoothChatService;
    public CalculateAngleCurrentToGoal calculateAngleCurrentToGoal = new CalculateAngleCurrentToGoal();
    public ArrivalGoal arrivalGoal = new ArrivalGoal();
    public float orientationValue = 0;
    public float gyroscopeValue = 0;
    public float [] accelerometerValue = null;

    double magnitude = 0.0;

    public Handler mHandler = new Handler();
    public ImageView imgbtnRun;
    public ImageButton imageStop;
    public Path path ;
    public StringBuffer mOutStringBuffer = new StringBuffer("");
    public static final String MAP_ACTION = "MAP_ACTION";
    public static LatLng sydney  =new LatLng(24.17998,120.6498);
    public Sensor sensor;
    List<LatLng> temp ;
    ArrivalDestination arrivalDestination  = new ArrivalDestination();
    public float [] tesla = null;
    boolean arrivalDirection = false ;
    int j =0;
    LatLng a  = sydney;
    float modifyAngle = 0;

    /**
     * The variable is Key
     */
    public boolean direction = false;
    public boolean source = false;
    public boolean start = false;
    public boolean filterGps = false;   //avoid once time
    public int arrival = 0;

//    CalcalateAngleWithMagnetic_v2 calcalateAngleWithMagnetic_v2  = new CalcalateAngleWithMagnetic_v2();

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main2);
        initImageButton();
        initLocationService();
        initBluetooth();
        initMapView();
//        setAngle();
        initWindow();
        initPath();

        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        SetSensorAccelerometer();
        SetSensormagnetic();
        SetSensorGyroscope();
        imgbtnRun.setOnClickListener(new ImageButton.OnClickListener(){
            @Override
            public void onClick(View view) {
                start = true;
                filterGps = true;
                handler.postDelayed(stopIfOr, 500);
                setAngle();
            }
        });
        imageStop.setOnClickListener(new ImageButton.OnClickListener(){
            @Override
            public void onClick(View view) {
                start = false;
                sendMessage("900");
            }
        });
    }
    
    public void initPath(){
        path = new Path();
    }
    public void initImageButton(){
        imgbtnRun = (ImageView) findViewById(R.id.run);
        imageStop = (ImageButton) findViewById(R.id.imageButton);
    }
    public void setAngle() {
        startTime = System.currentTimeMillis();
        handler.removeCallbacks(updateTimer);
        //設定Delay的時間
        handler.postDelayed(updateTimer, 500);
    }
    public void initBluetooth() {
        bluetoothChatService = BluetoothChatService.getInstance(this);
        bluetoothChatService.setmHandler(mHandler);
    }
    public void initLocationService() {
        Log.v("initLocationService", "initLocationService");
        Intent intent = new Intent(this, LocationService.class);
        startService(intent);
    }
    public void initMapView() {
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);
    }
    public void initWindow(){
        this.setFinishOnTouchOutside(false);
        Window window = this.getWindow();
        window.setFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL);
    }
    private void initKeyVariable(){
        source = false ;
        direction = false ;
        start = false ;
        arrival =0;
        filterGps = false;
    }
//    @Override
//    public void onResume(){
//        super.onResume();
//
//        if(sensor != null){
//
//            sensorManager.registerListener(this,sensor,SensorManager.SENSOR_DELAY_NORMAL);
//        }else{
//            Toast.makeText(this,"Not supperted", Toast.LENGTH_SHORT).show();
//            finish();
//        }
//    }
    public void onPause(){
        super.onPause();
        sensorManager.unregisterListener(this);
    }
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
        LocationManager status = (LocationManager) (this.getSystemService(Context.LOCATION_SERVICE));
        SetSensorOrientation();

        if (status.isProviderEnabled(LocationManager.GPS_PROVIDER) || status.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {

            enableMyLocation();
            setMapAction(mMap);
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(MAP_ACTION);
            registerReceiver(broadcast, intentFilter);
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(sydney, 16));

            mMap.setOnMapClickListener(onMapClickListener);
            broadcast = new Broadcast(googleMap, markerOptionses, polylineOptionses) {
                @Override
                public void position(LatLng latLng) {
                    super.position(latLng);


                    if((sqrt(pow(a.latitude-latLng.latitude,2)+pow(a.longitude - latLng.longitude,2)) * 111100)>10 && filterGps){
                        latLng = a;
                    }          // filter deviation that is mush than 10 meters

                    sydney = latLng;
                    calculateAngleCurrentToGoal.setCurrentPosition(latLng);
                    source = true;
                    path.setStart(latLng);
                    a = latLng;

                    arrivalDestination.setSource(latLng);
                    arrivalGoal.setSource(latLng);
                    polylineOptionses.add(0, new PolylineOptions()
                            .add(sydney, latLng)
                            .width(6)
                            .color(Color.RED)
                            .clickable(false));


                    googleMap.addPolyline(polylineOptionses.get(0));

                    sydney = latLng;
                    Log.v("Position", "longitude:" + latLng.longitude + " latitude:" + latLng.latitude);

                    googleMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                        @Override
                        public void onPolylineClick(Polyline polyline) {
                            polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                        }
                    });
                }
            };
            intentFilter.addAction(MAP_ACTION);
            registerReceiver(broadcast, intentFilter);

        }else{
            Toast.makeText(this, "請開啟定位服務", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));    //開啟設定
        }
    }
    public void communication(List<LatLng> temp){
        this.temp = temp;
    }
    public void planPath(){
        final Handler handler = new Handler();
        handler.post(new Runnable() {
            @Override
            public void run() {
                List<LatLng> temp  = path.path();
                communication(temp);
                    /*
                    *交換參考點
                    */
                for (int i = 1; i < temp.size(); i++) {
                    mMap.addPolyline(new PolylineOptions()  //畫線
                            .add(temp.get(i-1), temp.get(i))    //參考點和下一個參考點相連
                            .width(6)
                            .color(Color.BLUE)
                            .clickable(true));
                    mMap.addMarker(new MarkerOptions().position(temp.get(i)).draggable(true));    //在google map上畫一個marker

                    mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                        @Override
                        public void onPolylineClick(Polyline polyline) {
                            polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                        }
                    });

                }
            }

        });
        mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
            @Override
            public void onPolylineClick(Polyline polyline) {
                polyline.setColor(polyline.getColor() ^ 0x00ffffff);
            }
        });
        direction = true;
    }
    public void communicationForStopIfOr(boolean arrival){
        arrivalDirection = arrival;
    }
    GoogleMap.OnMapClickListener onMapClickListener = new GoogleMap.OnMapClickListener() {   //觸發地圖
        @Override
        public void onMapClick(LatLng latLng) {
            Log.v("run",""+start);

            if(!start){
                mMap.clear();
                path.clear();
                Log.v("onMapClick", latLng.latitude + " " + latLng.longitude);
                path.setEnd(latLng);
                planPath();
                mMap.addMarker(new MarkerOptions().position(latLng).draggable(true));    //在google map上畫一個marker
            }
        }
    };
    private void enableMyLocation() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
        } else if (mMap != null) {
            // Access to the location has been granted to the app.
            mMap.setMyLocationEnabled(true);
        }
    }
    public void setMapAction(final GoogleMap mMap) {
//        mMap.getUiSettings().setZoomControlsEnabled(true);//enable zoom controls
        mMap.getUiSettings().setAllGesturesEnabled(true);//enable all gestures
        mMap.getUiSettings().setScrollGesturesEnabled(true);
        mMap.getUiSettings().setMapToolbarEnabled(false);

        mMap.setOnMyLocationButtonClickListener(new GoogleMap.OnMyLocationButtonClickListener() {
            @Override
            public boolean onMyLocationButtonClick() {

                return false;
            }
        });
    }
    private void sendMessage(String message) {

        // Check that we're actually connected before trying anything
        if (bluetoothChatService.getState() != BluetoothChatService.STATE_CONNECTED) {    //STATE_CONNECTED = 3
            Toast.makeText(this, R.string.not_connected, Toast.LENGTH_SHORT).show();
            return;
        }

        // Check that there's actually something to send
        if (message.length() > 0) {
            Log.v("message", "meesage :"+message);
            // Get the message bytes and tell the BluetoothChatService to write
            byte[] send = message.getBytes();
            bluetoothChatService.write(send);

            // Reset out string buffer to zero and clear the edit text field
            mOutStringBuffer.setLength(0);
        }
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

    public float modifyAngleWithMagnetic(){
        float [] R = new float[9];
        float [] values = new float[3];
        if(accelerometerValue != null && tesla != null){
            SensorManager.getRotationMatrix(R,null,accelerometerValue,tesla);   //計算旋轉矩陣
            SensorManager.getOrientation(R,values);
            return  (float) Math.toDegrees(values[0]);
        }else{
            return 0;
        }
    }
    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }

    private Runnable updateTimer = new Runnable() {
        public void run() {
            if(!arrivalDirection){
                modifyAngle = modifyAngleWithMagnetic();

                if(orientationValue >180){
                    orientationValue = -(orientationValue -360);       //改成 0 ~-180
                }

                if(modifyAngle < 0){
                    modifyAngle = -(modifyAngle);
                }

                Log.v("aaa", "angleValue(1) ： " + String.valueOf(orientationValue));//方向感測器的 X 角度
                Log.v("aaa", "angleValue(2) ： " + String.valueOf(modifyAngle));//方向感測器的 X 角度

                if(magnitude < 55){
                    if(orientationValue >180){
                        orientationValue = -(orientationValue -360);       //改成 0 ~-180
                    }
                    calculateAngleCurrentToGoal.setCurrentAngle(orientationValue);

                    if (source && direction && start) {
                        sendMessage(calculateAngleCurrentToGoal.toString());
                        Log.v("calculateAngle", "calculateAngleCurrentToGoal：" + calculateAngleCurrentToGoal.toString());
                    }
                }else{
                    modifyAngle = modifyAngleWithMagnetic();
                    if(modifyAngle < 0){
                        modifyAngle = -(modifyAngle);
                    }
                    calculateAngleCurrentToGoal.setCurrentAngle(modifyAngle);

                    if (source && direction && start) {
                        sendMessage(calculateAngleCurrentToGoal.toString());
                        Log.v("modifyAngle", "modifyAngle：" + modifyAngle);
                        Log.v("calculateAngle", "calculateAngleCurrentToGoal：" + calculateAngleCurrentToGoal.toString());
                    }


                }
            }else if(arrival == temp.size()-1){
                /**
                 *  initial key
                 */
                initKeyVariable();
            }
            handler.postDelayed(this, 6000);
        }
    };

    private Runnable stopIfOr = new Runnable() {
        public void run() {
            boolean arrival = false ;
            if(j<temp.size()){
                calculateAngleCurrentToGoal.setGoalPosition(temp.get(j));
                arrivalDestination.setDirection(temp.get(j));
                arrival = arrivalDestination.calDistance();
                arrivalGoal.setDirection(temp.get(temp.size()-1));
                if(judgeIsSpecialPoint(temp.get(j)).equals("1")){}
                if(arrival){
                    j++;
                }else if(arrivalGoal.calDistance()){
                    j = temp.size();
                    arrival = true;
                }
            }
            communicationForStopIfOr(arrival);
            handler.postDelayed(this, 500);

        }
    };
    private String judgeIsSpecialPoint(LatLng point){
        int i=0;
        for(i=0 ;i< Constants.SPECIAL1.length; i++){
            if(Constants.SPECIAL1[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL2.length; i++){
            if(Constants.SPECIAL2[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL3.length; i++){
            if(Constants.SPECIAL3[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL4.length; i++){
            if(Constants.SPECIAL4[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL5.length; i++){
            if(Constants.SPECIAL5[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL6.length; i++){
            if(Constants.SPECIAL6[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL7.length; i++){
            if(Constants.SPECIAL7[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL8.length; i++){
            if(Constants.SPECIAL8[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL9.length; i++){
            if(Constants.SPECIAL9[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL10.length; i++){
            if(Constants.SPECIAL10[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL11.length; i++){
            if(Constants.SPECIAL11[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL12.length; i++){
            if(Constants.SPECIAL12[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL13.length; i++){
            if(Constants.SPECIAL13[i].equals(point)){
                return "1";
            }
        }
        for(i=0 ;i< Constants.SPECIAL14.length; i++){
            if(Constants.SPECIAL14[i].equals(point)){
                return "1";
            }
        }
        return null;
    }

    public static class Broadcast extends BroadcastReceiver {
        GoogleMap googleMap;
        ArrayList<MarkerOptions> marker;
        ArrayList<PolylineOptions> polylineOptionses;

        public Broadcast() {
        }

        public Broadcast(GoogleMap googleMap, ArrayList<MarkerOptions> marker, ArrayList<PolylineOptions> polylineOptionses) {
            this.googleMap = googleMap;
            this.marker = marker;
            this.polylineOptionses = polylineOptionses;
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action.equals(MAP_ACTION)) {
                String longitude = intent.getStringExtra("LONGITUDE");
                String latitude = intent.getStringExtra("LATITUDE");
                LatLng point = new LatLng(Double.parseDouble(latitude), Double.parseDouble(longitude));
                position(point);

            }
        }

        public void position(LatLng latLng) {

        }
    }


}

