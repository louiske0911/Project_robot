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

public class Main2Activity extends AppCompatActivity implements OnMapReadyCallback, SensorEventListener {

    private GoogleMap mMap;
    public BluetoothChatService bluetoothChatService;
    public Handler mHandler = new Handler();
    public StringBuffer mOutStringBuffer = new StringBuffer("");
    public static final String MAP_ACTION = "MAP_ACTION";
    ArrayList<MarkerOptions> markerOptionses = new ArrayList<MarkerOptions>();
    ArrayList<PolylineOptions> polylineOptionses = new ArrayList<PolylineOptions>();

    public boolean direction = false;
    public boolean source = false;
    public float[] values = {0};
    private Handler handler = new Handler();
    private Long startTime;
    private SensorManager sensorManager;

    public int checkMarkSize = 0;
    public static LatLng sydney = new LatLng(24.1803, 120.6507);
    public Broadcast broadcast;
    public CalculateAngleCurrentToGoal angle = new CalculateAngleCurrentToGoal();

    public Path path ;




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main2);
        initLocationService();
        initBluetooth();
        initMapView();
        setAngle();
        initPath();
        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
    }
    public void initPath(){
        path = new Path();
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

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
        LocationManager status = (LocationManager) (this.getSystemService(Context.LOCATION_SERVICE));
        if (status.isProviderEnabled(LocationManager.GPS_PROVIDER) || status.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {

            enableMyLocation();
            setMapAction(mMap);
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(MAP_ACTION);
            registerReceiver(broadcast, intentFilter);
            SetSensor();
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(sydney, 16));

            mMap.setOnMapClickListener(onMapClickListener);
            broadcast = new Broadcast(googleMap, markerOptionses, polylineOptionses) {
                @Override
                public void position(LatLng latLng) {
                    super.position(latLng);
                    angle.setCurrentPosition(latLng);
                    source = true;
                    path.setStart(latLng);
                    polylineOptionses.add(0, new PolylineOptions()
                            .add(sydney, latLng)
                            .width(2)
                            .color(Color.BLUE)
                            .clickable(true));


                    googleMap.addPolyline(polylineOptionses.get(0));

//                googleMap.addMarker(marker.get(0));
                    sydney = latLng;
                    Log.v("lll", "longitude:" + latLng.longitude + " latitude:" + latLng.latitude);

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

    GoogleMap.OnMapClickListener onMapClickListener = new GoogleMap.OnMapClickListener() {
        @Override
        public void onMapClick(LatLng latLng) {
            Log.v("onMapClick", latLng.latitude + " " + latLng.longitude);
            angle.setGoalPosition(latLng);
            path.setEnd(latLng);
//            List<LatLng> result = new ArrayList<LatLng>();
//            result = path.path();
//            for(int i =0;i<path.path().size();i++){
//                markerOptionses.add(0, new MarkerOptions().position(result.get(i)).draggable(true));
//            }

            Handler handler = new Handler();

            handler.post(new Runnable() {
                @Override
                public void run() {
                /*
                *路線規劃
                 * strings[0] = startPosition
                 * strings[1] = endPosition
                */
                    List<LatLng> temp = path.path();
                    /*
                    *交換參考點
                    */
                    for (int i = 1; i < temp.size() - 1; i++) {
                        mMap.addPolyline(new PolylineOptions()  //畫線
                                .add(temp.get(i-1), temp.get(i))    //參考點和下一個參考點相連
                                .width(2)
                                .color(Color.BLUE)
                                .clickable(true));
//
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





//            markerOptionses.add( new MarkerOptions().position(latLng).draggable(true));
//            mMap.addMarker(markerOptionses.get(markerOptionses.lastIndexOf(markerOptionses.size()-1)));
            checkMarkSize++;
            mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                @Override
                public void onPolylineClick(Polyline polyline) {
                    polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                }
            });
            direction = true;
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
        mMap.getUiSettings().setZoomControlsEnabled(true);//enable zoom controls
        mMap.getUiSettings().setAllGesturesEnabled(true);//enable all gestures
        mMap.getUiSettings().setScrollGesturesEnabled(true);
        mMap.getUiSettings().setMapToolbarEnabled(true);
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

    protected void SetSensor() {
        List sensors = sensorManager.getSensorList(Sensor.TYPE_ORIENTATION);
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
        values = sensorEvent.values;
        Log.v("Angle Value", "angleValue(current)：" + String.valueOf(values[0]));//方向感測器的角度
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }

    private Runnable updateTimer = new Runnable() {
        public void run() {
            Log.v("Angle Value", "angleValue：" + String.valueOf(values[0]));
            angle.setCurrentAngle(values[0]);
            if (source && direction) {
                sendMessage(angle.toString());
            }
            handler.postDelayed(this, 500);

        }
    };

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

