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

package tw.example.robert.myapplication.bluetoothchat;

import android.app.ActionBar;
import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.support.v4.app.FragmentActivity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Toast;

import com.example.robert.myapplication.R;
import com.google.android.gms.maps.model.LatLng;

import java.io.Serializable;
import java.util.List;

import tw.example.robert.myapplication.common.logger.Log;
import tw.example.robert.myapplication.maps.MapsActivity;

import static android.content.Context.SENSOR_SERVICE;


/**
 * This fragment controls Bluetooth to communicate with other devices.
 */
public class BluetoothChatFragment extends Fragment implements Serializable, SensorEventListener {

    private static final String TAG = "BluetoothChatFragment";
    private Long startTime;
    private Handler handler = new Handler();
    public float[] values ={0};
    // Intent request codes
    private static final int REQUEST_CONNECT_DEVICE_SECURE = 1;
    private static final int REQUEST_CONNECT_DEVICE_INSECURE = 2;
    private static final int REQUEST_ENABLE_BT = 3;
    public int a =0;

    /**
     * Name of the connected device
     */
    private String mConnectedDeviceName = null;

    /**
     * Array adapter for the conversation thread
     */

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


    Broadcast broadcast;
    public final static String BLUETOOTH_ACTION_DIRECTION = "BLUETOOTH_ACTION_DIRECTION";
    public final static String BLUETOOTH_ACTION_SOURCE = "BLUETOOTH_ACTION_SOURCE";
    public static LatLng Desition = null;
    public static LatLng Source = null;

    private SensorManager sensorManager;

    String startSource = "",startDirection = "";

    CalculateAngleCurrentToGoal calculateAngleCurrentToGoal = new CalculateAngleCurrentToGoal();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);

        FragmentManager ft = getFragmentManager();
        FragmentTransaction transaction = ft.beginTransaction();

        MapsActivity fragment = new MapsActivity();
        transaction.replace(R.id.googleMaps, fragment);
        transaction.commit();

        startTime = System.currentTimeMillis();
        handler.removeCallbacks(updateTimer);
        //設定Delay的時間
        handler.postDelayed(updateTimer, 1000);
        handler.removeCallbacks(ahead);
        //設定Delay的時間
        handler.postDelayed(ahead, 1000);


        // Get local Bluetooth adapter
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        // If the adapter is null, then Bluetooth is not supported
        if (mBluetoothAdapter == null) {
            FragmentActivity activity = (FragmentActivity) getActivity();
            Toast.makeText(activity, "Bluetooth is not available", Toast.LENGTH_LONG).show();
            activity.finish();
        }    // No bluetooth service

        registerBrocast();

        sensorManager = (SensorManager)getActivity().getSystemService(SENSOR_SERVICE);
    }

    public void registerBrocast(){
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(BLUETOOTH_ACTION_SOURCE);
        intentFilter.addAction(BLUETOOTH_ACTION_DIRECTION);
        broadcast = new Broadcast(){
            @Override
            public void msg(LatLng latLng,String name) {
                super.msg(latLng,name);
                if(name.equals("source")){
                    startSource = "source";
                    calculateAngleCurrentToGoal.setCurrentPosition(latLng);
                }else if(name.equals("direction")){
                    startDirection = "direction";
                    calculateAngleCurrentToGoal.setGoalPosition(latLng);
                }
//                sendMessage(msg);
            }
        };

        getActivity().registerReceiver(broadcast, intentFilter);

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


        SetSensor();
        getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        return inflater.inflate(R.layout.fragment_bluetooth_chat, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {

    }    //   For fragment_bluetooth_chat view ,this is initialization .

    /**
     * Set up the UI and background operations for chat.
     */
    private void setupChat() {
        Log.d(TAG, "setupChat()");
        // Initialize the BluetoothChatService to perform bluetooth connections
        mChatService = new BluetoothChatService(getActivity(), mHandler);

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
        Log.v("ccc",message);
        Log.v("ddd",""+BluetoothChatService.STATE_CONNECTED);
        Log.v("ddd",""+mChatService.getState() );
        // Check that we're actually connected before trying anything
        if (mChatService.getState() != BluetoothChatService.STATE_CONNECTED) {    //STATE_CONNECTED = 3
            Toast.makeText(getActivity(),R.string.not_connected, Toast.LENGTH_SHORT).show();
            return;
        }
        // Check that there's actually something to send
        if (message.length() > 0) {
            // Get the message bytes and tell the BluetoothChatService to write
            byte[] send = message.getBytes();   //
            Log.v("ccc",""+send);
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
        FragmentActivity activity = (FragmentActivity) getActivity();
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
        FragmentActivity activity = (FragmentActivity) getActivity();
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
            FragmentActivity activity = (FragmentActivity) getActivity();
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
                    Log.v("writeMessage",writeMessage);
                    break;
                case Constants.MESSAGE_READ:
                    byte[] readBuf = (byte[]) msg.obj;
                    // construct a string from the valid bytes in the buffer
                    String readMessage = new String(readBuf, 0, msg.arg1);
                    Log.v("writeMessage",readMessage);
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
                    Toast.makeText(getActivity(),R.string.bt_not_enabled_leaving,
                            Toast.LENGTH_SHORT).show();
                    getActivity().finish();
                }
        }
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

    protected void SetSensor()
    {
        List sensors = sensorManager.getSensorList(Sensor.TYPE_ORIENTATION);
        //如果有取到該手機的方位感測器，就註冊他。
        if (sensors.size()>0)
        {
            //registerListener必須要implements SensorEventListener，
            //而SensorEventListener必須實作onAccuracyChanged與onSensorChanged
            //感應器註冊
            sensorManager.registerListener(this, (Sensor) sensors.get(0), SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent sensorEvent) {
        values = sensorEvent.values;
        Log.v("abc","X：" + String.valueOf(values[0]));      //方向感測器的角度

    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }

    public static class Broadcast extends BroadcastReceiver implements Serializable{
        BluetoothChatService mChatService;
        StringBuffer mOutStringBuffer;

        public Broadcast() {
        }

        public Broadcast(BluetoothChatService mChatService) {
            mOutStringBuffer = new StringBuffer("");
            this.mChatService = mChatService;
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action.equals(BLUETOOTH_ACTION_SOURCE)) {
                Log.v("lat",intent.getDoubleExtra("LATITUDE1",0)+" ,"+intent.getDoubleExtra("LONGITUDE1",0));
                msg(new LatLng(intent.getDoubleExtra("LATITUDE1",0),intent.getDoubleExtra("LONGITUDE1",0)),"source");   //ＧＰＳ定位 ，提供經緯度
            }else if(action.equals(BLUETOOTH_ACTION_DIRECTION)){
                Log.v("lat",intent.getDoubleExtra("LATITUDE",0)+" ,"+intent.getDoubleExtra("LONGITUDE",0));
                msg(new LatLng(intent.getDoubleExtra("LATITUDE",0),intent.getDoubleExtra("LONGITUDE",0)),"direction");  //點擊地圖，提供目的地的經緯度
            }
        }

        public void msg(LatLng latLng,String name){

        }
    }
    private Runnable updateTimer = new Runnable() {
        public void run() {
            Log.v("aaaa","X：" + String.valueOf(values[0]));

            if((startDirection.equals("direction")&&(startSource.equals("source")))){
                Log.v("aaaa","X：" + String.valueOf(values[0]));
                calculateAngleCurrentToGoal.setCurrentAngle(values[0]);
                Log.v("aaaaaa",calculateAngleCurrentToGoal.toString());
//                sendMessage("999");
                sendMessage(calculateAngleCurrentToGoal.toString());
            }
            else if ((startDirection.equals("direction")&&(!startSource.equals("source")))){
//                sendMessage("900");
            }
            else if ((!startDirection.equals("direction")&&(startSource.equals("source")))){
//                sendMessage("900");

            }
            else{
//                sendMessage("900");
            }
            handler.postDelayed(this, 7000);

        }
    };
    private Runnable ahead = new Runnable() {
        public void run() {

            if(a%7!=0){
//                Log.v("aaaa","999");
//                sendMessage("999");
            }
            a++;
            handler.postDelayed(this, 1000);

        }
    };


}
