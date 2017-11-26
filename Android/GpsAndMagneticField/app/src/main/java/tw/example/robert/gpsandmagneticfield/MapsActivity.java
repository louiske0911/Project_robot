package tw.example.robert.gpsandmagneticfield;

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
import android.provider.Settings;
import android.support.v4.app.FragmentActivity;
import android.support.v4.content.ContextCompat;
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
import java.util.HashMap;
import java.util.List;

public class MapsActivity extends FragmentActivity implements OnMapReadyCallback, SensorEventListener {

    private GoogleMap mMap;
    ArrayList<MarkerOptions> markerOptionses = new ArrayList<MarkerOptions>();
    ArrayList<PolylineOptions> polylineOptionses = new ArrayList<PolylineOptions>();
    public Broadcast broadcast;
    public static final String MAP_ACTION = "MAP_ACTION";

    LocationManager lms;
    private SensorManager sensorManager;
    public float orientationValue = 0;
    public float gyroscopeValue = 0;
    public float[] accelerometerValue = null;
    public float[] tesla = null;
    double magnitude = 0.0;
    LatLng sydney = new LatLng(24.1803, 120.6507);
    HttpCall httpCallPost;
    HashMap<String, String> params = new HashMap<String, String>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_maps);
        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        SetSensormagnetic();
        SetSensorAccelerometer();
//        postToServer();
        getArticle();
        initLocationService();
        mapFragment.getMapAsync(this);
    }

    public void initLocationService() {
        Log.v("initLocationService", "initLocationService");
        Intent intent = new Intent(this, LocationService.class);
        startService(intent);
    }

    protected void SetSensormagnetic() {            //磁力
        List sensors = sensorManager.getSensorList(Sensor.TYPE_MAGNETIC_FIELD);
        //如果有取到該手機的方位感測器，就註冊他。
        if (sensors.size() > 0) {
            //registerListener必須要implements SensorEventListener，
            //而SensorEventListener必須實作onAccuracyChanged與onSensorChanged
            //感應器註冊
            sensorManager.registerListener(this, (Sensor) sensors.get(0), SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    protected void SetSensorAccelerometer() {       //加速度
        List sensors = sensorManager.getSensorList(Sensor.TYPE_ACCELEROMETER);
        //如果有取到該手機的方位感測器，就註冊他。
        if (sensors.size() > 0) {
            //registerListener必須要implements SensorEventListener，
            //而SensorEventListener必須實作onAccuracyChanged與onSensorChanged
            //感應器註冊
            sensorManager.registerListener(this, (Sensor) sensors.get(0), SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    public void postToServer() {
        new HttpClient() {
            @Override
            public void onResponse(String response) {
                super.onResponse(response);
                Log.v("testing123", response);
            }
        }.execute("http://0f80eca9.ngrok.io/api/fcu/location");
    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
        LocationManager status = (LocationManager) (this.getSystemService(Context.LOCATION_SERVICE));

        if (status.isProviderEnabled(LocationManager.GPS_PROVIDER) || status.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {

            enableMyLocation();
            setMapAction(mMap);
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(MAP_ACTION);
            registerReceiver(broadcast, intentFilter);
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(sydney, 16));

//            mMap.setOnMapClickListener(onMapClickListener);
            broadcast = new Broadcast(googleMap, markerOptionses, polylineOptionses) {
                @Override
                public void position(LatLng latLng) {
                    super.position(latLng);
                    if (magnitude != 0) {
                        params.put("", "");
                        params.put("Lat", "" + latLng.latitude);
                        params.put("Lng", "" + latLng.longitude);
                        params.put("magnitude", "" + magnitude);
                        Log.v("111", "2222");
                        Toast.makeText(MapsActivity.this, "Date : (" + latLng.latitude + "," + latLng.longitude + ")" + "magnitude : " + magnitude
                                , Toast.LENGTH_SHORT).show();
                    }
                    postToServer(httpCallPost);

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

        } else {
            Toast.makeText(this, "請開啟定位服務", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));    //開啟設定
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

    private void enableMyLocation() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
        } else if (mMap != null) {
            // Access to the location has been granted to the app.
            mMap.setMyLocationEnabled(true);
        }
    }
//
//    private void getLocation(Location location) {
//        params.clear();
//
//        Log.v("111","3333");
//
//        if(accelerometerValue !=null && magnitude != 0) {
////            params.put("","");
//            params.put("Lat",""+location.getLatitude());
//            params.put("Lng",""+location.getLongitude());
//            params.put("X",""+accelerometerValue[0]);
//            params.put("Y",""+accelerometerValue[1]);
//            params.put("Z",""+accelerometerValue[2]);
//            params.put("magnitude",""+magnitude);
//            Log.v("111","2222");
//            Toast.makeText(this, "Date : (" + location.getLatitude() + "," + location.getLongitude() + ")" + "magnitude : " + magnitude + " X :" + accelerometerValue[0] + " Y :" + accelerometerValue[1] + " Z :" + accelerometerValue[2], Toast.LENGTH_SHORT).show();
//        }
//        postToServer(httpCallPost);
//        broadcast = new Broadcast(location, markerOptionses, polylineOptionses) {
//
//            public void position(LatLng latLng) {
//                super.position(latLng);
//                Log.v("111","3333");
//
//
//                polylineOptionses.add(0, new PolylineOptions()
//                        .add(sydney, latLng)
//                        .width(6)
//                        .color(Color.RED)
//                        .clickable(false));
//
//
//                googleMap.addPolyline(polylineOptionses.get(0));
//
//                sydney = latLng;
//                Log.v("Position", "longitude:" + latLng.longitude + " latitude:" + latLng.latitude);
//
//                googleMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
//                    @Override
//                    public void onPolylineClick(Polyline polyline) {
//                        polyline.setColor(polyline.getColor() ^ 0x00ffffff);
//                    }
//                });
//            }
//        };
////        if (location != null) {
////            Double longitude = location.getLongitude();
////            Double latitude = location.getLatitude();
////
////            LatLng pointl = new LatLng(latitude, longitude);
////
////            mMap.addPolyline(new PolylineOptions()
////                    .add(sydney, pointl)
////                    .width(2)
////                    .color(Color.BLUE)
////                    .clickable(true));
//////            mMap.clear();
////            mMap.addMarker(new MarkerOptions().position(pointl).draggable(true));
////            sydney = pointl;
////
////            mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
////                @Override
////                public void onPolylineClick(Polyline polyline) {
////                    polyline.setColor(polyline.getColor() ^ 0x00ffffff);
////                }
////            });
////
////
////        } else {
////            Toast.makeText(this, "無法定位座標", Toast.LENGTH_LONG).show();
////
////        }
//    }
//


//    public void onLocationChanged(Location location) {
//
//        getLocation(location);
//    }
//
//
//    public void onStatusChanged(String s, int i, Bundle bundle) {
//
//    }
//
//
//    public void onProviderEnabled(String s) {
//
//    }
//
//
//    public void onProviderDisabled(String s) {
//
//    }


    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        if (sensorEvent.sensor.getType() == Sensor.TYPE_ORIENTATION) {
            float[] temp = sensorEvent.values.clone();
            Log.v("AngleValue", "angleValue(current) ： " + String.valueOf(temp[0]));//方向感測器的 X 角度
            orientationValue = temp[0];
        } else if (sensorEvent.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            float[] temp = sensorEvent.values.clone();
            tesla = temp;
            float azimuth = Math.round(temp[0]);
            float pitch = Math.round(temp[1]);
            float roll = Math.round(temp[2]);
            magnitude = Math.sqrt((azimuth * azimuth) + (pitch * pitch) + (roll * roll));
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

    public void getArticle() {
        httpCallPost = new HttpCall();
        httpCallPost.setMethodtype(HttpCall.POST);
        httpCallPost.setUrl("http://1eec6559.ngrok.io/api/fcu/location");

        httpCallPost.setParams(params);
    }

    public void postToServer(HttpCall httpCallPost) {
        new HttpRequest() {
            @Override
            public void onResponse(String response) {
                super.onResponse(response);
                final String result = response;
                Log.v("response", response);
                Toast.makeText(getApplicationContext(), "response :" + result, Toast.LENGTH_SHORT).show();
            }
        }.execute(httpCallPost);
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
                Log.d("abc", "123");
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
