package com.example.robert.bluetoothnew;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.graphics.Color;
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
import com.google.android.gms.maps.model.MapStyleOptions;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.PolylineOptions;

import java.util.List;

public class Main2Activity extends AppCompatActivity implements OnMapReadyCallback {


    private GoogleMap mMap;

    public BluetoothChatService bluetoothChatService;
    public Handler mHandler = new Handler();
    public ImageView imgbtnRun;
    public ImageButton imageStop;
    public Path path;
    public static final String MAP_ACTION = "MAP_ACTION";
    public static LatLng sydney = new LatLng(24.179957, 120.648275);
    List<LatLng> temp;
    boolean arrivalDirection = false;
    int j = 0;
    public Broadcast broadcast;
    /**
     * The variable is Key
     */

//    CalcalateAngleWithMagnetic_v2 calcalateAngleWithMagnetic_v2  = new CalcalateAngleWithMagnetic_v2();

    SingleTonTemp singleTonTemp;

    public void initSingleTonTemp() {
        singleTonTemp = SingleTonTemp.getInstance();
    }

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main2);
        initImageButton();
        initMapView();
        initWindow();
        initSingleTonTemp();
        resultPlanPath();
//        initangleFunction();
        imgbtnRun.setOnClickListener(new ImageButton.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(!singleTonTemp.status){
                    singleTonTemp.status = true;
                    singleTonTemp.filterGps = true;
                    startToService();
                }
            }
        });
        imageStop.setOnClickListener(new ImageButton.OnClickListener() {
            @Override
            public void onClick(View view) {
                singleTonTemp.status = false;
                sendMessage("900");
//                 callWeb("1");
            }
        });
    }
//    public void initangleFunction() {
//        Log.v("initLocationService", "initLocationService");
//        Intent intent = new Intent(this, angleFunction.class);
//        this.startService(intent);
//    }
    public void startToService(){
        Intent broadcasetIntent = new Intent();
        Log.v("zzzz","position11");
        broadcasetIntent.setAction("run");
        sendBroadcast(broadcasetIntent);
    }

    public void initImageButton() {
        imgbtnRun = (ImageView) findViewById(R.id.run);
        imageStop = (ImageButton) findViewById(R.id.imageButton);
    }

//    public void setAngle() {
//        startTime = System.currentTimeMillis();
//        handler.removeCallbacks(updateTimer);
//        //設定Delay的時間
//        handler.postDelayed(updateTimer, 500);
//    }

    public void initBluetooth() {
        bluetoothChatService = BluetoothChatService.getInstance(this);
        bluetoothChatService.setmHandler(mHandler);
    }

//    public void initLocationService() {
//        Log.v("initLocationService", "initLocationService");
//        Intent intent = new Intent(this, LocationService.class);
//        startService(intent);
//    }

    public void initMapView() {
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);
    }

    public void initWindow() {
        this.setFinishOnTouchOutside(false);
        Window window = this.getWindow();
        window.setFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL);
    }

    private void initKeyVariable() {
        singleTonTemp.sourceStatus = false;
        singleTonTemp.directionstatus = false;
        singleTonTemp.status = false;
        singleTonTemp.arrivalDirection = 0;
        singleTonTemp.filterGps = false;
    }


    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
        Log.v("GPs",""+singleTonTemp.Gps);

        if(singleTonTemp.status){
            Log.v("Status",""+singleTonTemp.status);
            planPath();
        }

        try {
            // Customise the styling of the base map using a JSON object defined
            // in a raw resource file.
            googleMap.setMapStyle(
                    MapStyleOptions.loadRawResourceStyle(
                            this, R.raw.style_json));


        } catch (Resources.NotFoundException e) {
        }

        LocationManager status = (LocationManager) (this.getSystemService(Context.LOCATION_SERVICE));
        if (status.isProviderEnabled(LocationManager.GPS_PROVIDER) || status.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {

            enableMyLocation();
            setMapAction(mMap);
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(MAP_ACTION);
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(sydney, 17));

            mMap.setOnMapClickListener(onMapClickListener);
        } else {
            Toast.makeText(this, "請開啟定位服務", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));    //開啟設定
        }
    }

    public void communication(List<LatLng> temp) {
        this.temp = temp;
    }

    public void planPath() {
        List<LatLng> temp = singleTonTemp.planPath;
        mMap.addMarker(new MarkerOptions().position(singleTonTemp.Gps).draggable(true));    //在google map上畫一個marker
        mMap.addMarker(new MarkerOptions().position(temp.get(temp.size()-1)).draggable(true));    //在google map上畫一個marker

        for (int i = 1; i < temp.size(); i++) {
            mMap.addPolyline(new PolylineOptions()  //畫線
                    .add(temp.get(i - 1), temp.get(i))    //參考點和下一個參考點相連
                    .width(6)
                    .color(Color.RED)
                    .clickable(true));
//            mMap.addMarker(new MarkerOptions().position(temp.get(i)).draggable(true));    //在google map上畫一個marker

            mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                @Override
                public void onPolylineClick(Polyline polyline) {
                    polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                }
            });

        }
        mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
            @Override
            public void onPolylineClick(Polyline polyline) {
                polyline.setColor(polyline.getColor() ^ 0x00ffffff);
            }
        });

        singleTonTemp.directionstatus = true;
    }

    public void communicationForStopIfOr(boolean arrival) {
        arrivalDirection = arrival;
    }

    GoogleMap.OnMapClickListener onMapClickListener = new GoogleMap.OnMapClickListener() {   //觸發地圖
        @Override
        public void onMapClick(LatLng latLng) {
            Log.v("run", "" + singleTonTemp.status);

            if (!singleTonTemp.status) {
                mMap.clear();
                singleTonTemp.planPath.clear();
                Log.v("onMapClick", latLng.latitude + " " + latLng.longitude);
                sendLocationToService(latLng);
//                planPath();
                mMap.addMarker(new MarkerOptions().position(latLng).draggable(true));    //在google map上畫一個marker
            }
        }
    };
    public void resultPlanPath(){
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction("return Result");
        broadcast = new Broadcast() {
            @Override
            public void resultPlanPath() {
                super.resultPlanPath();
                planPath();
            }
        };
        registerReceiver(broadcast, intentFilter);
    }

    public void sendLocationToService(LatLng mCurrentLocation) {
        Log.v("onMapClick", "sendLocationToService");
        Intent broadcasetIntent = new Intent();
        broadcasetIntent.setAction("DO_SOME_THING");
        broadcasetIntent.putExtra("LATITUDE", String.valueOf(mCurrentLocation.latitude));
        broadcasetIntent.putExtra("LONGITUDE", String.valueOf(mCurrentLocation.longitude));
        sendBroadcast(broadcasetIntent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(broadcast);
    }

    public void sendMessage(String Message) {
        Intent broadcasetIntent = new Intent();
        broadcasetIntent.setAction("SendMessage");
        broadcasetIntent.putExtra("Message", Message);
        sendBroadcast(broadcasetIntent);
    }

    private void enableMyLocation() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
        } else if (mMap != null) {
            // Access to the location has been granted to the app.
            mMap.setMyLocationEnabled(true);
        }
    }

    public void callWeb(String position) {
        Log.v("callWeb", "callWeb");
        Intent broadcasetIntent = new Intent();
        broadcasetIntent.setAction("CallWeb");
        broadcasetIntent.putExtra("CallPosition", position);
        sendBroadcast(broadcasetIntent);
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
//    private Runnable updateTimer = new Runnable() {
//        public void run() {
//            if(!arrivalDirection){
//                modifyAngle = modifyAngleWithMagnetic();
//
//                if(orientationValue >180){
//                    orientationValue = -(orientationValue -360);       //改成 0 ~-180
//                }
//
//                if(modifyAngle < 0){
//                    modifyAngle = -(modifyAngle);
//                }
//
//                Log.v("aaa", "angleValue(1) ： " + String.valueOf(orientationValue));//方向感測器的 X 角度
//                Log.v("aaa", "angleValue(2) ： " + String.valueOf(modifyAngle));//方向感測器的 X 角度
//
//                if(magnitude < 55){
//                    if(orientationValue >180){
//                        orientationValue = -(orientationValue -360);       //改成 0 ~-180
//                    }
//                    calculateAngleCurrentToGoal.setCurrentAngle(orientationValue);
//
//                    if (singleTonTemp.sourceStatus && singleTonTemp.directionstatus && singleTonTemp.status) {
//                        getMessage(calculateAngleCurrentToGoal.toString());
//                        Log.v("calculateAngle", "calculateAngleCurrentToGoal：" + calculateAngleCurrentToGoal.toString());
//                    }
//                }else{
//                    modifyAngle = modifyAngleWithMagnetic();
//                    if(modifyAngle < 0){
//                        modifyAngle = -(modifyAngle);
//                    }
//                    calculateAngleCurrentToGoal.setCurrentAngle(modifyAngle);
//
//                    if (singleTonTemp.sourceStatus && singleTonTemp.directionstatus && singleTonTemp.status) {
//                        getMessage(calculateAngleCurrentToGoal.toString());
//                        Log.v("modifyAngle", "modifyAngle：" + modifyAngle);
//                        Log.v("calculateAngle", "calculateAngleCurrentToGoal：" + calculateAngleCurrentToGoal.toString());
//                    }
//
//
//                }
//            }else if(singleTonTemp.arrivalDirection == temp.size()-1){
//                /**
//                 *  initial key
//                 */
//                initKeyVariable();
//            }
//            handler.postDelayed(this, 6000);
//        }
//    };

    //    private Runnable stopIfOr = new Runnable() {
//        public void run() {
//            boolean arrival = false ;
//            if(j<temp.size()){
//                calculateAngleCurrentToGoal.setGoalPosition(temp.get(j));
//                arrivalDestination.setDirection(temp.get(j));
//                arrival = arrivalDestination.calDistance();
//                arrivalGoal.setDirection(temp.get(temp.size()-1));
//                if(judgeIsSpecialPoint(temp.get(j)).equals("1")){}
//                if(arrival){
//                    j++;
//                }else if(arrivalGoal.calDistance()){
//                    j = temp.size();
//                    arrival = true;
//                }
//            }
//            communicationForStopIfOr(arrival);
//            handler.postDelayed(this, 500);
//
//        }
//    };
//    private String judgeIsSpecialPoint(LatLng point){
//        int i=0;
//        for(i=0 ;i< Constants.SPECIAL1.length; i++){
//            if(Constants.SPECIAL1[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL2.length; i++){
//            if(Constants.SPECIAL2[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL3.length; i++){
//            if(Constants.SPECIAL3[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL4.length; i++){
//            if(Constants.SPECIAL4[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL5.length; i++){
//            if(Constants.SPECIAL5[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL6.length; i++){
//            if(Constants.SPECIAL6[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL7.length; i++){
//            if(Constants.SPECIAL7[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL8.length; i++){
//            if(Constants.SPECIAL8[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL9.length; i++){
//            if(Constants.SPECIAL9[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL10.length; i++){
//            if(Constants.SPECIAL10[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL11.length; i++){
//            if(Constants.SPECIAL11[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL12.length; i++){
//            if(Constants.SPECIAL12[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL13.length; i++){
//            if(Constants.SPECIAL13[i].equals(point)){
//                return "1";
//            }
//        }
//        for(i=0 ;i< Constants.SPECIAL14.length; i++){
//            if(Constants.SPECIAL14[i].equals(point)){
//                return "1";
//            }
//        }
//        return null;
//    }
//
    public static class Broadcast extends BroadcastReceiver {

        public Broadcast() {
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action.equals("return Result")) {
                Log.v("resultPlanPath","resultPlanPath");
                String latitude = intent.getStringExtra("OK");
                resultPlanPath();
            }
        }
        public void resultPlanPath(){}
    }
}
