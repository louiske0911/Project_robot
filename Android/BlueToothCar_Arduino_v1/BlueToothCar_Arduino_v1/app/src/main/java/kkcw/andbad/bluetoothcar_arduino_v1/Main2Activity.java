package kkcw.andbad.bluetoothcar_arduino_v1;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.pm.ActivityInfo;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;

import java.util.Set;

public class Main2Activity extends AppCompatActivity {
    private ListView listView;
    private ArrayAdapter mBTArrayAdapter;
    private BluetoothAdapter mBTAdapter;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main2);
        listView = (ListView)findViewById(R.id.listView);
        mBTAdapter = BluetoothAdapter.getDefaultAdapter();  /* get a handle on the bluetooth radio  */
        mBTArrayAdapter = new ArrayAdapter(this, android.R.layout.simple_list_item_1);
        lisetPairedDevices();

    }
    private void lisetPairedDevices(){
        // Find and set up the ListView for paired devices

        listView.setAdapter(mBTArrayAdapter);
        listView.setOnItemClickListener(mDeviceClickListener);

        // If there are paired devices, add each one to the ArrayAdapter
        Set<BluetoothDevice> pairedDevides = mBTAdapter.getBondedDevices();  //get the pairedDevices

        if(pairedDevides.size() > 0){
            for(BluetoothDevice device : pairedDevides)
                mBTArrayAdapter.add(device.getName() + "\n" + device.getAddress());

        }else{
            mBTArrayAdapter.add("未找到已配對裝置");
        }
    }

    private AdapterView.OnItemClickListener mDeviceClickListener
            = new AdapterView.OnItemClickListener() {
        public void onItemClick(AdapterView<?> av, View v, int arg2, long arg3) {

        }
    };



}
