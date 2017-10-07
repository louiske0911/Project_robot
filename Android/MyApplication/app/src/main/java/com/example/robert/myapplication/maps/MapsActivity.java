package com.example.robert.myapplication.maps;

import android.app.Fragment;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.example.robert.myapplication.R;
import com.example.robert.myapplication.bluetoothchat.BluetoothChatFragment;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapFragment;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.PolylineOptions;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


public class MapsActivity extends Fragment implements OnMapReadyCallback, Serializable {
    Button start_button, btnClear;
    static int Min_second = 1000;
    static int m5 = 0;
    EditText startpoint;
    EditText endpoint;
    public static LatLng sydney = new LatLng(24.1803, 120.6507);
    TextView mTapTextView;
    private GoogleMap mMap;
    private Polyline mMutablePolyline;
    LocationManager lms;
    Broadcast broadcast;
    public final static String MAP_ACTION = "MAP_ACTION";
    public final static String MAP = "MAP";

    private boolean mLogShown;

    private LatLng[] position = {new LatLng(24.179012, 120.649016), new LatLng(24.179944, 120.649007), new LatLng(24.179964, 120.648269)
            , new LatLng(24.179005, 120.648316), new LatLng(24.178967, 120.647365), new LatLng(24.179615, 120.647335), new LatLng(24.179918, 120.647327)
            , new LatLng(24.180730, 120.647278), new LatLng(24.178525, 120.650162), new LatLng(24.180764, 120.648236)};


    public int checkMarkSize = 1;

    ArrayList<MarkerOptions> markerOptionses = new ArrayList<MarkerOptions>();
    ArrayList<PolylineOptions> polylineOptionses = new ArrayList<PolylineOptions>();


    public MapsActivity() {
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);

    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {

        ViewGroup viewGroup = (ViewGroup) inflater.inflate(R.layout.activity_maps, container, false);
        MapFragment fragment = (MapFragment) getChildFragmentManager().findFragmentById(R.id.map);
        fragment.getMapAsync(this);
        btnClear = (Button) viewGroup.findViewById(R.id.clear);
        mTapTextView = (TextView) viewGroup.findViewById(R.id.message);
        start_button = (Button) viewGroup.findViewById(R.id.start);
        startpoint = (EditText) viewGroup.findViewById(R.id.startpoint);
        endpoint = (EditText) viewGroup.findViewById(R.id.endpoint);
        // Obtain the SupportMapFragment and get notified when the map is ready to be used.


        start_button.setOnClickListener(new View.OnClickListener() {

            public void onClick(View w) {
                sendRequest();
            }
        });
        btnClear.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                checkMarkSize = 1;
                markerOptionses.remove(1);
                mMap.clear();
                mMap.addMarker(markerOptionses.get(0));
                BluetoothChatFragment.Desition = null;
                BluetoothChatFragment.Source = null;
            }
        });


        return viewGroup;
    }


    private void sendRequest() {
        mMap.clear();

//        float []values = senior.getSensorChanged();
//        Log.v("senior",values[0]+"");


        String start = startpoint.getText().toString();
        String end = endpoint.getText().toString();
        if (start.isEmpty()) {
            Toast.makeText(getActivity(), "Please enter start address .", Toast.LENGTH_SHORT).show();
        } else if (end.isEmpty()) {
            Toast.makeText(getActivity(), "Please enter end address .", Toast.LENGTH_SHORT).show();
        } else {
            for (int j = 0; j < 10; j++) {
                mMap.addMarker(new MarkerOptions().position(position[j]).draggable(true).icon(BitmapDescriptorFactory.fromResource(R.drawable.init_mark_robot)));
            }

            Handler handler = new Handler();

            handler.post(new Runnable() {
                @Override
                public void run() {
                /*
                *路線規劃
                 * strings[0] = startPosition
                 * strings[1] = endPosition
                */
                    int start = Integer.parseInt(startpoint.getText().toString());
                    int end = Integer.parseInt(endpoint.getText().toString());
                    path pathresult = new path(start, end);
                    List<Integer> temp = pathresult.path();
                    int length = temp.size();
                    /*
                    *交換參考點
                    */
                    for (int i = 1; i < length - 1; i++) {
                        LatLng temp1 = position[temp.get(i - 1)];
                        LatLng temp2 = position[temp.get(i)];
                        mMap.addPolyline(new PolylineOptions()  //畫線
                                .add(temp1, temp2)    //參考點和下一個參考點相連
                                .width(2)
                                .color(Color.BLUE)
                                .clickable(true));
//
                        mMap.addMarker(new MarkerOptions().position(temp2).draggable(true));    //在google map上畫一個marker


                        mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                            @Override
                            public void onPolylineClick(Polyline polyline) {
                                polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                            }
                        });

                    }
                }
            });


        }
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Add a markerOptionses in Sydney and move the camera

        mMap.addMarker(new MarkerOptions().position(sydney).title("Marker in Sydney"));
        mMap.moveCamera(CameraUpdateFactory.newLatLng(sydney));
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(sydney, 16));

        mMap.setOnMapClickListener(onMapClickListener);
        broadcast = new Broadcast(googleMap, mTapTextView, markerOptionses, polylineOptionses){
            @Override
            public void position(LatLng latLng) {
                super.position(latLng);

                mTapTextView.setText("longitude:" + latLng.longitude + " latitude:" + latLng.latitude);

                marker.add(0, new MarkerOptions().position(latLng).draggable(true));

                polylineOptionses.add(0,new PolylineOptions()
                        .add(sydney, latLng)
                        .width(2)
                        .color(Color.BLUE)
                        .clickable(true));


                googleMap.addPolyline(polylineOptionses.get(0));


                googleMap.addMarker(marker.get(0));
                sydney = latLng;
                Log.v("lll","longitude:" + latLng.longitude + " latitude:" + latLng.latitude);
                Intent broadcasetIntent = new Intent();
                broadcasetIntent.setAction(BluetoothChatFragment.BLUETOOTH_ACTION_SOURCE);
                broadcasetIntent.putExtra("LATITUDE1", latLng.latitude);
                broadcasetIntent.putExtra("LONGITUDE1", latLng.longitude);
                getActivity().sendBroadcast(broadcasetIntent);


                googleMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                    @Override
                    public void onPolylineClick(Polyline polyline) {
                        polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                    }
                });

            }
        };





        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(MAP_ACTION);
        getActivity().registerReceiver(broadcast, intentFilter);

    }

    GoogleMap.OnMapClickListener onMapClickListener = new GoogleMap.OnMapClickListener() {
        @Override
        public void onMapClick(LatLng latLng) {
//            if (checkMarkSize > 1) {
//                return;
//            }
            Log.v("onMapClick", "1111");
            Log.v("onMapClick", latLng.latitude+" "+latLng.longitude);
            mTapTextView.setText("經緯度 :" + latLng);

//            mMutablePolyline = mMap.addPolyline(new PolylineOptions()
//                    .add(sydney, latLng)
//                    .width(2)
//                    .color(Color.BLUE)
//                    .clickable(true));

//            mMap.addMarker(new MarkerOptions().position(latLng).draggable(true));
            markerOptionses.add(0, new MarkerOptions().position(latLng).draggable(true));
            mMap.addMarker(markerOptionses.get(0));
            checkMarkSize++;

            Intent broadcasetIntent = new Intent();
            broadcasetIntent.setAction(BluetoothChatFragment.BLUETOOTH_ACTION_DIRECTION);
            broadcasetIntent.putExtra("LATITUDE", latLng.latitude);
            broadcasetIntent.putExtra("LONGITUDE", latLng.longitude);
            getActivity().sendBroadcast(broadcasetIntent);


//            onGoogleMapListener.onGoogleMapListener(latLng);

            mMap.setOnPolylineClickListener(new GoogleMap.OnPolylineClickListener() {
                @Override
                public void onPolylineClick(Polyline polyline) {
                    polyline.setColor(polyline.getColor() ^ 0x00ffffff);
                }
            });
        }
    };


    public static class Broadcast extends BroadcastReceiver implements Serializable {
        GoogleMap googleMap;
        TextView mTapTextView;
        ArrayList<MarkerOptions> marker;
        ArrayList<PolylineOptions> polylineOptionses;

        public Broadcast() {
        }

        public Broadcast(GoogleMap googleMap, TextView mTapTextView, ArrayList<MarkerOptions> marker, ArrayList<PolylineOptions> polylineOptionses) {
            this.googleMap = googleMap;
            this.mTapTextView = mTapTextView;
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

        public void position(LatLng latLng){

        }
    }


}
