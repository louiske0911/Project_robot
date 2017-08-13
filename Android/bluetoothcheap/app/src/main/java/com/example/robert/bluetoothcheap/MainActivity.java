package com.example.robert.bluetoothcheap;

import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
    public static final String TAG = "MainActivity";

    BluetoothAdapter mBluetoothAdapter;
    Button btn ;




    @Override
    protected void onDestroy(){
        Log.d(TAG,"onDestroy: called .");
        super.onDestroy();
        unregisterReceiver(mBoradcastReceiver1);
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        btn = (Button) findViewById(R.id.button);
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        btn.setOnClickListener(new View.OnClickListener(){

            @Override
            public void onClick(View view) {
                Log.d(TAG,"onCLick: enabling/disabling bluetooth .");
                enableDisableBT();
            }
        });
    }

    public void enableDisableBT() {
        if(mBluetoothAdapter ==null){
            Log.d(TAG,"enableDisableBT : Don`t have BT capabilities .");
        }
        if(!mBluetoothAdapter.isEnabled()){
            Log.d(TAG,"enableDisableBT: enabling BT .");
            Intent enableBTIntent =new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivity(enableBTIntent);

            IntentFilter BTIntent = new IntentFilter(BluetoothAdapter.ACTION_CONNECTION_STATE_CHANGED);
            registerReceiver(mBoradcastReceiver1,BTIntent);

            if(mBluetoothAdapter.isEnabled()){
                Log.d(TAG,"enableDisableBT: disabling BT .");

                mBluetoothAdapter.disable();

                BTIntent = new IntentFilter(BluetoothAdapter.ACTION_CONNECTION_STATE_CHANGED);
                registerReceiver(mBoradcastReceiver1,BTIntent);

            }

        }
    }

    // Create a BroadcastReceiver for ACTION_FOUND.
    private final BroadcastReceiver mBoradcastReceiver1 = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            Log.d(TAG,"test-----");
            if (action.equals(mBluetoothAdapter.ACTION_STATE_CHANGED)) {
                final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE,mBluetoothAdapter.ERROR);

                switch(state){
                    case BluetoothAdapter.STATE_OFF:
                        Log.d(TAG,"onReeive: STATE_OFF");
                        break;
                    case BluetoothAdapter.STATE_TURNING_OFF:
                        Log.d(TAG,"mBoradcastReceiver1: STATE_TURNING_OFF");
                        break;
                    case BluetoothAdapter.STATE_ON:
                        Log.d(TAG,"mBoradcastReceiver1: STATE_ON");
                        break;
                    case BluetoothAdapter.STATE_TURNING_ON:
                        Log.d(TAG,"mBoradcastReceiver1: STATE_TURNING_ON");
                        break;
                }
            }
        }
    };

}
