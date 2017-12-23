/*
 * Copyright (C) 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 *  作者： 邱皇旗
 *  e-mail : a0983080692@gmail.com
 */
package com.example.robert.bluetoothnew;

import android.app.ActionBar;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.speech.tts.TextToSpeech;
import android.support.annotation.Nullable;
import android.support.annotation.RequiresApi;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.PolylineOptions;

import java.util.ArrayList;
import java.util.Locale;


/**
 * This fragment controls Bluetooth to communicate with other devices.
 */
public class BluetoothChatFragment extends Fragment{

    private static final String TAG = "BluetoothChatFragment";
    public static final String MAP_ACTION = "MAP_ACTION";
    public static final String CallWeb = "CallWeb";


    // Intent request codes
    private static final int REQUEST_CONNECT_DEVICE_SECURE = 1;
    private static final int REQUEST_CONNECT_DEVICE_INSECURE = 2;
    private static final int REQUEST_ENABLE_BT = 3;
    private static final int CloseMap = 4;

    public final static String BLUETOOTH_ACTION_SOURCE = "BLUETOOTH_ACTION_SOURCE";
    public final static String BLUETOOTH_ACTION_DIRECTION = "BLUETOOTH_ACTION_DIRECTION";
    /**
     * Name of the connected device
     */
    private String mConnectedDeviceName = null;


    /**
     * String buffer for outgoing messages
     */
    private StringBuffer mOutStringBuffer;

    /**
     * Local Bluetooth adapter
     */
    private BluetoothAdapter mBluetoothAdapter = null;

    /**
     * Member object for the chat services
     */
    private BluetoothChatService mChatService = null;

    public Broadcast broadcast;
    WebView myWebView;

    SingleTonTemp singleTonTemp;
    private TextToSpeech tts = null;

    public void initSingleTonTemp() {
        singleTonTemp = SingleTonTemp.getInstance();
    }

    int count = 0;
    private Handler handler = new Handler();
    private Long startTime;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);
        // Get local Bluetooth adapter
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        initSingleTonTemp();
        // If the adapter is null, then Bluetooth is not supported
        intiCallWeb();
        toWebPosition();
        if (mBluetoothAdapter == null) {
            FragmentActivity activity = getActivity();
            Toast.makeText(activity, "Bluetooth is not available", Toast.LENGTH_LONG).show();
            activity.finish();
        }    // No bluetooth service


        tts = new TextToSpeech(getActivity(), new TextToSpeech.OnInitListener() {
            @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
            @Override
            public void onInit(int status) {
                Log.v("abasdasd","status 123");

                if (status == TextToSpeech.SUCCESS) {

                    int result = tts.setLanguage(Locale.TAIWAN);

                    if (result == TextToSpeech.LANG_MISSING_DATA
                            || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                        Log.e("TTS", "This Language is not supported");
                    } else {

                    }

                } else {
                    Log.e("TTS", "Initilization Failed!");
                }
            }
        });
    }
    public void toWebPosition(){
        startTime = System.currentTimeMillis();
        handler.removeCallbacks(WebPosition);
        Log.v("startTime", "" + startTime);
        //設定Delay的時間
        handler.postDelayed(WebPosition, 500);
    }
    private Runnable WebPosition = new Runnable() {
        public void run() {
//            Log.v("222233","11111"+singleTonTemp.Gps);
//            if(singleTonTemp.Gps!=null){
//                myWebView.loadUrl("javascript: GetLocation('"+singleTonTemp.Gps.latitude+"','"+singleTonTemp.Gps.longitude+"')");
//            }
            handler.postDelayed(this, 500);

        }
    };


    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_bluetooth_chat, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        initLocationService();
        initWebView(view);
        intiBroadCast();
    }    //   For fragment_bluetooth_chat view ,this is initialization .

    public void initWebView(View view) {
        myWebView = (WebView) view.findViewById(R.id.webview);
        myWebView.getSettings().setJavaScriptEnabled(true);
        WebSettings settings = myWebView.getSettings();
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.SINGLE_COLUMN);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        myWebView.requestFocus();
        myWebView.setWebViewClient(new MyWebViewClient());
//        myWebView.loadUrl("http://10.21.22.34:3000/index.html");
//        myWebView.loadUrl("http://00efacc5.ngrok.io/index.html");
        myWebView.loadUrl("http://172.20.10.8:3000/index.html");
//        myWebView.loadUrl("http://140.134.26.31/Bluetooth/Bluetooth.html");
        myWebView.addJavascriptInterface(new JavaScriptInterface(getActivity()), "JSInterface");
    }

    public void initLocationService() {
        Log.v("initLocationService", "initLocationService");
        Intent intent = new Intent(getActivity(), LocationService.class);
        getActivity().startService(intent);
    }

    public void intiBroadCast() {
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(MAP_ACTION);
        getActivity().registerReceiver(broadcast, intentFilter);

        broadcast = new Broadcast() {
            @Override
            public void position(LatLng latLng) {
                super.position(latLng);

                Log.v("latLng", "" + latLng);
                myWebView.loadUrl("javascript:test('Hello World!')");
            }
        };
        intentFilter.addAction(MAP_ACTION);
        getActivity().registerReceiver(broadcast, intentFilter);

    }
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public void speakOut(String content) {
        CharSequence text = content;
        tts.setPitch(0.5f);
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null,content);

    }
    public class JavaScriptInterface {
        private Context context;

        public JavaScriptInterface(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void showToast() {
            Intent i = new Intent(context, Main2Activity.class);
            startActivityForResult(i, CloseMap);
        }

        @JavascriptInterface
        public void setDirection(String lat,String lng) {
            Intent broadcasetIntent = new Intent();
            broadcasetIntent.setAction("DO_SOME_THING");
            singleTonTemp.planPath.clear();
            LatLng latLng = new LatLng(Double.parseDouble(lat),Double.parseDouble(lng));
            broadcasetIntent.putExtra("LATITUDE", lat);
            broadcasetIntent.putExtra("LONGITUDE", lng);
            singleTonTemp.tempstatus = true;
            getActivity().sendBroadcast(broadcasetIntent);
        }

        @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
        @JavascriptInterface
        public void setTTS(String string) {
            Log.v("@@@@@", string);
//            tts.shutdown();
            tts.stop();

            speakOut(string);
        }

        @JavascriptInterface
        public void sendWebviewURL(String url) {
            Intent i = new Intent(context, Main3Activity.class);
            Log.v("111", "222222");
            i.putExtra("URL", url);
            context.startActivity(i);
        }
        @JavascriptInterface
        public void closeDialog() {
            Log.v("444444","kr g8");
            Intent broadcasetIntent = new Intent();
            broadcasetIntent.setAction("close");
            getActivity().sendBroadcast(broadcasetIntent);
        }
    }


    @Override
    public void onStart() {
        super.onStart();
        // If BT is not on, request that it be enabled.
        // setupChat() will then be called during onActivityResult
        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableIntent, REQUEST_ENABLE_BT);
            // Otherwise, setup the chat session
        } else if (mChatService == null) {
            setupChat();
        }
    }

    /**
     * Set up the UI and background operations for chat.
     */
    private void setupChat() {
        Log.d(TAG, "setupChat()");

        // Initialize the BluetoothChatService to perform bluetooth connections
        mChatService = BluetoothChatService.getInstance(getActivity());
        mChatService.setmHandler(mHandler);
        // Initialize the buffer for outgoing messages
        mOutStringBuffer = new StringBuffer("");
    }

    /**
     * Makes this device discoverable.
     */
    private void ensureDiscoverable() {
        if (mBluetoothAdapter.getScanMode() !=
                BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE) {
            Intent discoverableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
            discoverableIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300);
            startActivity(discoverableIntent);
        }
    }

    /**
     * Sends a message.
     *
     * @param message A string of text to send.
     */
    private void sendMessage(String message) {

        // Check that we're actually connected before trying anything
        if (mChatService.getState() != BluetoothChatService.STATE_CONNECTED) {    //STATE_CONNECTED = 3
            Toast.makeText(getActivity(), R.string.not_connected, Toast.LENGTH_SHORT).show();
            return;
        }

        // Check that there's actually something to send
        if (message.length() > 0) {
            Log.v("abc", "abc");
            // Get the message bytes and tell the BluetoothChatService to write
            byte[] send = message.getBytes();
            mChatService.write(send);

            // Reset out string buffer to zero and clear the edit text field
            mOutStringBuffer.setLength(0);
        }
    }

    /**
     * Updates the status on the action bar.
     *
     * @param resId a string resource ID
     */
    private void setStatus(int resId) {
        FragmentActivity activity = getActivity();
        if (null == activity) {
            return;
        }
        final ActionBar actionBar = activity.getActionBar();
        if (null == actionBar) {
            return;
        }
        actionBar.setSubtitle(resId);
    }

    /**
     * Updates the status on the action bar.
     *
     * @param subTitle status
     */
    private void setStatus(CharSequence subTitle) {
        FragmentActivity activity = getActivity();
        if (null == activity) {
            return;
        }
        final ActionBar actionBar = activity.getActionBar();
        if (null == actionBar) {
            return;
        }
        actionBar.setSubtitle(subTitle);
    }

    /**
     * The Handler that gets information back from the BluetoothChatService
     */
    private final Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            FragmentActivity activity = getActivity();
            switch (msg.what) {
                case Constants.MESSAGE_STATE_CHANGE:
                    switch (msg.arg1) {
                        case BluetoothChatService.STATE_CONNECTED:
                            setStatus(getString(R.string.title_connected_to, mConnectedDeviceName));
                            break;
                        case BluetoothChatService.STATE_CONNECTING:
                            setStatus(R.string.title_connecting);
                            break;
                        case BluetoothChatService.STATE_LISTEN:
                        case BluetoothChatService.STATE_NONE:
                            setStatus(R.string.title_not_connected);
                            break;
                    }
                    break;
                case Constants.MESSAGE_WRITE:
                    byte[] writeBuf = (byte[]) msg.obj;
                    // construct a string from the buffer
                    String writeMessage = new String(writeBuf);
                    break;
                case Constants.MESSAGE_READ:
                    byte[] readBuf = (byte[]) msg.obj;
                    // construct a string from the valid bytes in the buffer
                    String readMessage = new String(readBuf, 0, msg.arg1);
                    break;
                case Constants.MESSAGE_DEVICE_NAME:
                    // save the connected device's name
                    mConnectedDeviceName = msg.getData().getString(Constants.DEVICE_NAME);
                    if (null != activity) {
                        Toast.makeText(activity, "Connected to "
                                + mConnectedDeviceName, Toast.LENGTH_SHORT).show();
                    }
                    break;
                case Constants.MESSAGE_TOAST:
                    if (null != activity) {
                        Toast.makeText(activity, msg.getData().getString(Constants.TOAST),
                                Toast.LENGTH_SHORT).show();
                    }
                    break;
            }
        }
    };

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        switch (requestCode) {
            case REQUEST_CONNECT_DEVICE_SECURE:
                // When DeviceListActivity returns with a device to connect
                if (resultCode == Activity.RESULT_OK) {
                    connectDevice(data, true);
                }
                break;
            case REQUEST_CONNECT_DEVICE_INSECURE:
                // When DeviceListActivity returns with a device to connect
                if (resultCode == Activity.RESULT_OK) {
                    connectDevice(data, false);
                }
                break;
            case REQUEST_ENABLE_BT:
                // When the request to enable Bluetooth returns
                if (resultCode == Activity.RESULT_OK) {
                    // Bluetooth is now enabled, so set up a chat session
                    setupChat();
                } else {
                    // User did not enable Bluetooth or an error occurred
                    Log.d(TAG, "BT not enabled");
                    Toast.makeText(getActivity(), R.string.bt_not_enabled_leaving,
                            Toast.LENGTH_SHORT).show();
                    getActivity().finish();
                }
                break;
            case CloseMap:
                myWebView.loadUrl("javascript:CloseMap()");
                break;
        }
    }

    public void intiCallWeb() {
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(CallWeb);
        getActivity().registerReceiver(broadcast, intentFilter);
        broadcast = new Broadcast() {
            @Override
            public void callWeb(String type,String id) {
                super.callWeb(type,id);
                Log.v("WebViewActivity", "UA: " + myWebView.getSettings().getUserAgentString());
                if(!type.equals("0")){
                    String call = "javascript:Navigation('"+type+"','"+id+"')";
                    myWebView.loadUrl(call);     //javascript:[webFunctionName]([parameter])
                }
            }
        };
        intentFilter.addAction(MAP_ACTION);
        getActivity().registerReceiver(broadcast, intentFilter);

    }

    /**
     * Establish connection with other divice
     *
     * @param data   An {@link Intent} with {@link DeviceListActivity#EXTRA_DEVICE_ADDRESS} extra.
     * @param secure Socket Security type - Secure (true) , Insecure (false)
     */
    private void connectDevice(Intent data, boolean secure) {
        // Get the device MAC address
        String address = data.getExtras()
                .getString(DeviceListActivity.EXTRA_DEVICE_ADDRESS);
        // Get the BluetoothDevice object
        BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);
        // Attempt to connect to the device
        mChatService.connect(device, secure);
    }

    @Override
    public void onCreateOptionsMenu(Menu menu, MenuInflater inflater) {
        inflater.inflate(R.menu.bluetooth_chat, menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.secure_connect_scan: {
                // Launch the DeviceListActivity to see devices and do scan
                Intent serverIntent = new Intent(getActivity(), DeviceListActivity.class);
                startActivityForResult(serverIntent, REQUEST_CONNECT_DEVICE_SECURE);
                return true;
            }
            case R.id.insecure_connect_scan: {
                // Launch the DeviceListActivity to see devices and do scan
                Intent serverIntent = new Intent(getActivity(), DeviceListActivity.class);
                startActivityForResult(serverIntent, REQUEST_CONNECT_DEVICE_INSECURE);
                return true;
            }
            case R.id.discoverable: {
                // Ensure this device is discoverable by others
                ensureDiscoverable();
                return true;
            }
        }
        return false;
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mChatService != null) {
            mChatService.stop();
        }
    }    //stop the application

    @Override
    public void onResume() {
        super.onResume();

        // Performing this check in onResume() covers the case in which BT was
        // not enabled during onStart(), so we were paused to enable it...
        // onResume() will be called when ACTION_REQUEST_ENABLE activity returns.
        if (mChatService != null) {
            // Only if the state is STATE_NONE, do we know that we haven't started already
            if (mChatService.getState() == BluetoothChatService.STATE_NONE) {    //STATE_NONE = 0
                // Start the Bluetooth chat services
                mChatService.start();
            }
        }
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
            } else if (action.equals(CallWeb)) {
                String type = intent.getStringExtra("type");
                String id = intent.getStringExtra("id");
                callWeb(type,id);
            }
        }

        public void position(LatLng latLng) {

        }

        public void callWeb(String type,String id) {

        }

    }
}
