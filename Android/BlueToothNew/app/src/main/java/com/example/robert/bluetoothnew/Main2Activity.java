/**
 *  作者： 邱皇旗
 *  e-mail : a0983080692@gmail.com
 *  Date : 2017/12/5
 */
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
//        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main2);
        initImageButton();
        initMapView();
        initWindow();
        initSingleTonTemp();
        resultPlanPath();
        initCloseDialog();
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
                String [] a = new String[2];
                a[0]="building";
                a[1]="7";
                 callWeb(a);
            }
        });
    }
    public void callWeb(String string[]) {
        Log.v("callWeb", "callWeb");
        Intent broadcasetIntent = new Intent();
        broadcasetIntent.setAction("CallWeb");
        broadcasetIntent.putExtra("type", string[0]);
        broadcasetIntent.putExtra("id", string[1]);
        sendBroadcast(broadcasetIntent);
    }

    public void startToService(){
        Intent broadcasetIntent = new Intent();
        broadcasetIntent.setAction("run");
        sendBroadcast(broadcasetIntent);
    }

    public void initImageButton() {
        imgbtnRun = (ImageView) findViewById(R.id.run);
        imageStop = (ImageButton) findViewById(R.id.imageButton);
    }

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

        if(singleTonTemp.status || singleTonTemp.tempstatus){
            mMap.clear();
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
//        mMap.addMarker(new MarkerOptions().position(singleTonTemp.Gps).draggable(true));    //在google map上畫一個marker
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
    public void initCloseDialog(){
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction("close");
        broadcast = new Broadcast() {
            @Override
            public void closeDialog() {
                super.closeDialog();
                finish();
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

//    public void callWeb(String position) {
//        Log.v("callWeb", "callWeb");
//        Intent broadcasetIntent = new Intent();
//        broadcasetIntent.setAction("CallWeb");
//        broadcasetIntent.putExtra("CallPosition", position);
//        sendBroadcast(broadcasetIntent);
//    }


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
            }else if(action.equals("close")){
                closeDialog();
            }
        }
        public void resultPlanPath(){}
        public void closeDialog(){}
    }
}
