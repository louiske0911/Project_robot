package com.example.root12_31.demo_google;

import android.*;
import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.icu.util.Calendar;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.provider.Settings;
import android.support.annotation.RequiresApi;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentActivity;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

//import com.google.android.gms.location.LocationListener;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.PolylineOptions;

import static com.example.root12_31.demo_google.R.id.map;

public class MapsActivity extends FragmentActivity implements OnMapReadyCallback,LocationListener, GoogleMap.OnMapClickListener{
    Button start_button ;
    static int Min_second = 1000;
    static int m5 = 0;
    EditText startpoint;
    EditText endpoint;
    private GoogleMap mMap;
    TextView mTapTextView;

    private Polyline mMutablePolyline;
    LocationManager lms;
    public static LatLng sydney = new LatLng(24.1803, 120.6507);
    private  LatLng[] position= {new LatLng(24.179012,120.649016), new LatLng(24.179944, 120.649007),new LatLng(24.179964, 120.648269)
            ,new LatLng(24.179005, 120.648316),new LatLng(24.178967, 120.647365),new LatLng(24.179615, 120.647335),new LatLng(24.179918, 120.647327)
            ,new LatLng(24.180730, 120.647278),new LatLng(24.178525, 120.650162),new LatLng(24.180764, 120.648236)};

    private pathServer pathServer = null;

    private ServiceConnection mServiceConnection = new ServiceConnection()
    {

        public void onServiceConnected(ComponentName name, IBinder serviceBinder)
        {
            // TODO Auto-generated method stub
            pathServer = ((pathServer.LocalBinder)serviceBinder).getService();
        }

        public void onServiceDisconnected(ComponentName name)
        {
            // TODO Auto-generated method stub
        }
    };



//    public static LatLng temp1 =new LatLng(24.179012,120.649016);	//圖書館和資電的轉角
//    public static LatLng temp2 =new LatLng(24.179944, 120.649007);	//資電和球場的轉角
//    public static LatLng temp3 =new LatLng(24.179964, 120.648269);	//人鹽和球場的轉角
//    public static LatLng temp4 =new LatLng(24.179005, 120.648316);	//校內7-11
//    public static LatLng temp5 =new LatLng(24.178967, 120.647365);	//忠勤和工學院的轉角
//    public static LatLng temp6 =new LatLng(24.179615, 120.647335);	//忠勤和語文的轉角
//    public static LatLng temp7 =new LatLng(24.179918, 120.647327);	//語文和育樂館的轉角
//    public static LatLng temp8 =new LatLng(24.180730, 120.647278);	//理學院和土木的轉角(偏育樂館)
//    public static LatLng temp9 =new LatLng(24.178525, 120.650162);	//東門
//    public static LatLng temp0 =new LatLng(24.180764, 120.648236);	//操場和理學院的轉角

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_maps);
        mTapTextView = (TextView) findViewById(R.id.message);
        start_button = (Button) findViewById(R.id.start);
        startpoint = (EditText) findViewById(R.id.startpoint);
        endpoint = (EditText) findViewById(R.id.endpoint);

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(map);
        mapFragment.getMapAsync(this);




        start_button.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View w){
                sendRequest();

            }
        });
    }



    private void sendRequest() {
        String start = startpoint.getText().toString();
        String end = endpoint.getText().toString();
        if(start.isEmpty()){
            Toast.makeText(this,"Please enter start address .",Toast.LENGTH_SHORT).show();
        }
        else if(end.isEmpty()){
            Toast.makeText(this,"Please enter end address .",Toast.LENGTH_SHORT).show();
        }else{
            mMap.clear();
//            for(int i=0;i<10;i++){
//                mMap.addMarker(new MarkerOptions().position(position[i]).draggable(true).icon(BitmapDescriptorFactory.fromResource(R.drawable.init_mark_robot)));
//            }
            pathPlan(start,end);

        }

    }
    public void pathPlan(String start , String end){
        pathServer = null;
        Intent it = new Intent(MapsActivity.this, pathServer.class);
        startService(it); //開始Service
        it = new Intent(MapsActivity.this, pathServer.class);
        bindService(it, mServiceConnection, BIND_AUTO_CREATE); //綁定Service


        int  finish = 0;
        int tempPosition = 0;
        while(finish<2){
    finish++;
//

            if (pathServer != null)
            tempPosition = pathServer.path(start,end,position);
//                finish = pathServer.isFinish(end,tempPosition);
//            }


            mMap.addPolyline(new PolylineOptions()
                    .add(position[Integer.parseInt(start)],position[tempPosition])
                    .width(2)
                    .color(Color.RED)
                    .clickable(true));

            mMap.addMarker(new MarkerOptions().position(position[tempPosition]).draggable(true));

            position[Integer.parseInt(start)]= position[tempPosition];

        }
        pathServer = null;
        unbindService(mServiceConnection); //解除綁定Service
        pathServer = null;
        it = new Intent(MapsActivity.this, pathServer.class);
        stopService(it); //結束Service
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

//        mMap.setMapType(GoogleMap.MAP_TYPE_SATELLITE);  //改變地圖型態
        mMap.addMarker(new MarkerOptions().position(sydney).title("起點 ").snippet("簡介").draggable(true));
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(sydney, 20));
        LocationManager status = (LocationManager) (this.getSystemService(Context.LOCATION_SERVICE));
        mMap.setMyLocationEnabled(true);

        if (status.isProviderEnabled(LocationManager.GPS_PROVIDER) || status.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
            lms = (LocationManager) getSystemService(LOCATION_SERVICE);
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                return;
            }

            Location location = lms.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);//使用GPS
            lms.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,Min_second,m5, MapsActivity.this);
            getLocation(location);
        } else {
            Toast.makeText(this, "請開啟定位服務", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));    //開啟設定
        }

        mMap.setOnMapClickListener(this);

    }



    private void getLocation(Location location) {

        if(location != null) {
            Double longitude = location.getLongitude();
            Double latitude = location.getLatitude();
            LatLng pointl = new LatLng(latitude,longitude);

            mTapTextView.setText("longitude:" + String.valueOf(longitude) + " latitude:" + String.valueOf(latitude));

            mMap.addPolyline(new PolylineOptions()
                    .add(sydney,pointl)
                    .width(2)
                    .color(Color.BLUE)
                    .clickable(true));
//            mMap.clear();
            mMap.addMarker(new MarkerOptions().position(pointl).draggable(true));
            sydney = pointl;

            mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                @Override
                public void onPolylineClick(Polyline polyline) {
                    polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                }
            });
        }
        else {
            Toast.makeText(this, "無法定位座標", Toast.LENGTH_LONG).show();
        }
    }



    public void onLocationChanged(Location location) {
//        if(mMap != null) {
//            setCamera(location);
//            setMarker(location);
//            setPolyLine(location);
//        }

        getLocation(location);
    }


    public void onStatusChanged(String provider, int status, Bundle extras) {

    }


    public void onProviderEnabled(String provider) {

    }


    public void onProviderDisabled(String provider) {

    }
    public void onMapClick(LatLng point){

        mTapTextView.setText("經緯度 :"+point);
        mMutablePolyline = mMap.addPolyline(new PolylineOptions()
                .add(sydney,point)
                .width(2)
                .color(Color.BLUE)
                .clickable(true));

        mMap.addMarker(new MarkerOptions().position(point).draggable(true));
        sydney = point;

        mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
            @Override
            public void onPolylineClick(Polyline polyline) {
                polyline.setColor(polyline.getColor() ^ 0x00ffffff);
            }
        });

    }



}
