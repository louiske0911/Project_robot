package kkcw.andbad.bluetoothcar_arduino_v1;


import android.app.Dialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.ActivityInfo;
import android.nfc.Tag;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.provider.SyncStateContract;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnTouchListener;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Set;
import java.util.UUID;

public class MainActivity extends AppCompatActivity {
    private Button btForward, btBack, btRight, btLeft, btStop;
    private Button btConnect, btEnd;
    private BluetoothAdapter mBTAdapter;
    private ArrayAdapter  mBTArrayAdapter;
    private ListView lv_PairedDevice;
    private Dialog dlg_BT;

    private Handler mHandler; // Our main handler that will receive callback notifications
    private ConnectThread connectThread;
    private ConnectedThread connectedThread;
    private  OutputStream mmOutStream = null;
    private boolean Con;

    private static final UUID BTMODULEUUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    public static final int CONNECTING_STATUS = 3, MESSAGE_READ = 2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);        /*讓手機螢幕保持直立模式*/

        /*user define*/
        InitDialog();
        InitListview();
        initHandler();
        buildViews();
        lv_PairedDevice.setOnItemClickListener(mDeviceClickListener);

    }

    public void InitDialog(){
        dlg_BT = new Dialog(MainActivity.this,R.style.MyDialog);
        dlg_BT.setContentView(R.layout.dlg_bluetooth);
        dlg_BT.setCancelable(true);          /*點擊Dialog外可回到上一頁*/
    }

    public void InitListview() {
        lv_PairedDevice = (ListView) dlg_BT.findViewById(R.id.lvId_PairedDevice);
        mBTAdapter = BluetoothAdapter.getDefaultAdapter();           /* get a handle on the bluetooth radio  */
        mBTArrayAdapter = new ArrayAdapter(MainActivity.this, android.R.layout.simple_list_item_1);
        lv_PairedDevice.setAdapter(mBTArrayAdapter);
    }

    public void initHandler(){
        mHandler = new Handler(){
            public void handleMessage(Message msg){
             /*   if(msg.what == MESSAGE_READ){
                    String readMessage = null;
                    try {
                        readMessage = new String((byte[]) msg.obj, "UTF-8");
                    } catch (UnsupportedEncodingException e) {
                        e.printStackTrace();
                    }
                    Toast.makeText(MainActivity.this, readMessage , Toast.LENGTH_SHORT).show();
                }*/
                switch(msg.what){
                    case CONNECTING_STATUS:
                        Toast.makeText(getApplicationContext(), "Connected to Device: " , Toast.LENGTH_SHORT).show();
                        break;
                }
            }
        };
    }

    private void buildViews() {
        btForward = (Button)findViewById(R.id.btIdForward) ;
        btBack = (Button)findViewById(R.id.btIdBack);
        btRight = (Button)findViewById(R.id.btIdRight);
        btLeft = (Button)findViewById(R.id.btIdLeft);
        btStop = (Button)findViewById(R.id.btIdStop);
        btConnect = (Button)findViewById(R.id.btIdConnect);
        btEnd = (Button)findViewById(R.id.btIdEnd);


        btConnect.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {

                dlg_BT.show();
                mBTArrayAdapter.clear();

                Set<BluetoothDevice> pairedevides = mBTAdapter.getBondedDevices();  /*get the pairedDevices */
                //Toast.makeText(this,""+pairedDevides,Toast.LENGTH_LONG);
                if(pairedevides.size() > 0){
                    for(BluetoothDevice device : pairedevides) {
                        mBTArrayAdapter.add(device.getName() + "\n" + device.getAddress());
                    }
                }else{
                    mBTArrayAdapter.add("未找到已配對裝置");
                }
            }
        });
        
            btStop.setOnTouchListener(new OnTouchListener() {
                @Override
                public boolean onTouch(View view, MotionEvent motionEvent) {
                    if(motionEvent.getAction() == KeyEvent.ACTION_DOWN){
                        connectedThread.write("5");
                    }
                    return false;
                }
            });
            btForward.setOnTouchListener(new OnTouchListener() {
                @Override
                public boolean onTouch(View view, MotionEvent motionEvent) {
                    if(motionEvent.getAction() == KeyEvent.ACTION_MULTIPLE){
                            connectedThread.write("1");
                    }
                    else if(motionEvent.getAction() == KeyEvent.ACTION_UP){
                        connectedThread.write("5");
                    }
                    return true;
                }
            });
        btBack.setOnTouchListener(new OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == KeyEvent.ACTION_MULTIPLE){
                    connectedThread.write("2");
                }
                else if(motionEvent.getAction() == KeyEvent.ACTION_UP){
                    connectedThread.write("5");
                }
                return false;
            }
        });
        btRight.setOnTouchListener(new OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == KeyEvent.ACTION_MULTIPLE){
                    connectedThread.write("3");
                }
                return true;
            }
        });
        btLeft.setOnTouchListener(new OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == KeyEvent.ACTION_MULTIPLE){
                    connectedThread.write("4");
                }
                return true;
            }
        });
    }


//    private AdapterView.OnItemClickListener mDeviceClickListener= new AdapterView.OnItemClickListener() {
//        public void onItemClick(AdapterView<?> av, View v, int arg2, long arg3) {
//            String info = ((TextView) v).getText().toString();
//            final String address = info.substring(info.length() - 17);
//            final String name = info.substring(0,info.length() - 17);
//
//           /*Toast.makeText(MainActivity.this,address,Toast.LENGTH_SHORT).show();*/
//
//            BluetoothDevice device = mBTAdapter.getRemoteDevice(address);
//            connectThread = new ConnectThread(device, name);
//            connectThread.start();
//        }
//    };
//
//    private void connected(){
//        mHandler.obtainMessage(CONNECTING_STATUS);
//    }
//    public class ConnectThread extends Thread {
//        private final BluetoothSocket BTSocket;
//        private final BluetoothDevice BTDevice;
//        private final String mName;
//
//        public ConnectThread(BluetoothDevice device, String name) {
//            // Use a temporary object that is later assigned to mmSocket,
//            // because mmSocket is final
//            BluetoothSocket tmp = null;
//            BTDevice = device;
//            mName = name;
//
//            // Get a BluetoothSocket to connect with the given BluetoothDevice
//            try {
//                // MY_UUID is the app's UUID string, also used by the server code
//                tmp = device.createRfcommSocketToServiceRecord(BTMODULEUUID);
//            } catch (IOException e) { }
//            BTSocket = tmp;
//        }
//
//        public void run() {
//            // Cancel discovery because it will slow down the connection
//            mBTAdapter.cancelDiscovery();
//
//            try {
//                // Connect the device through the socket. This will block
//                // until it succeeds or throws an exception
//                BTSocket.connect();
//            } catch (IOException connectException) {
//                // Unable to connect; close the socket and get out
//                try {
//                    BTSocket.close();
//                } catch (IOException closeException) { }
//                return;
//            }
//            /*
//            Do work to manage the connection (in a separate thread)
//            TODO
//            manageConnectedSocket(mmSocket);
//            */
//           /* Looper.prepare();
//            Toast.makeText(MainActivity.this, "Message", Toast.LENGTH_SHORT).show();
//            Looper.loop();*/
//
//           // mHandler.obtainMessage(CONNECTING_STATUS, mName);
//            connected();
//            connectedThread = new ConnectedThread(BTSocket);
//            connectedThread.start();
//
//        }
//        /** Will cancel an in-progress connection, and close the socket */
//        public void cancel() {
//            try {
//                BTSocket.close();
//            } catch (IOException e) { }
//        }
//    }
//
//
//    public class ConnectedThread extends Thread {
//        private final BluetoothSocket mmSocket;
//        private final InputStream mmInStream;
//
//        public ConnectedThread(BluetoothSocket socket) {
//            mmSocket = socket;
//            InputStream tmpIn = null;
//            OutputStream tmpOut = null;
//
//            // Get the input and output streams, using temp objects because
//            // member streams are final
//            try {
//                tmpIn = socket.getInputStream();
//                tmpOut = socket.getOutputStream();
//            } catch (IOException e) { }
//
//            mmInStream = tmpIn;
//            mmOutStream = tmpOut;
//        }
//
//        public void run() {
//            byte[] buffer = new byte[1024];  // buffer store for the stream
//            int bytes; // bytes returned from read()
//
//            // Keep listening to the InputStream until an exception occurs
//            while (true) {
//                try {
//                    // Read from the InputStream
//                    bytes = mmInStream.read(buffer);
//
//                    // Send the obtained bytes to the UI activity
//
//                   /* mHandler.obtainMessage(MESSAGE_READ, bytes, -1, buffer)
//                            .sendToTarget();*/
//                } catch (IOException e) {
//                    break;
//                }
//            }
//        }
//
//        /* Call this from the main activity to send data to the remote device */
//        public void write(String input) {
//            byte[] bytes = input.getBytes();
//            try {
//               //Thread.sleep(100);
//                mmOutStream.write(bytes);
//            } catch (IOException e) { }/* catch (InterruptedException e) {
//                    e.printStackTrace();
//            }*/
//        }
//
//        /* Call this from the main activity to shutdown the connection */
//        public void cancel() {
//            try {
//                mmSocket.close();
//            } catch (IOException e) { }
//        }
//    }
//}