package com.example.robert.tts;

import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
    Button btn;
    MyTTS myTTS = new MyTTS(this);
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        btn = (Button) findViewById(R.id.button);
        btn.setOnClickListener(new Button.OnClickListener() {
            @Override
            public void onClick(View view) {
//                sendNotification();
                myTTS.onInit(0);
                myTTS.queueSpeak("apple");
            }
        });
    }
    private void sendNotification()
    {
        int notificationId = 001;
        //決定這個notification的辨識編號

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this)
                        .setContentTitle("Title")
                        .setContentText("內容bjbdsjbjksbbjb");
        //利用NotificationCompat.Builder來建立其內容

        NotificationManagerCompat notificationManager =
                NotificationManagerCompat.from(this);
        //取得NotificationManagerCompat的實體

        notificationManager.notify(notificationId, notificationBuilder.build());
        //填入辨識編號及notification後，即可發送出去
    }
//    private void sendNotification() {
//        int notificationId = 001;
//        //決定這個notification的辨識編號
//
//        String[] replyLabels = {"Apple" , "Banana" , "Cat" , "Dog" , "Frog"};
//        //給使用者的預設選項 最多五個
//
//        NotificationCompat.Builder notificationBuilder =
//                new NotificationCompat.Builder(this)
//                        .setContentTitle("Title")
//                        .setContentText("內容");
//
//        RemoteInput remoteInput = new RemoteInput.Builder("extra_voice_reply")
//                .setLabel("請說...")
//                .setChoices(replyLabels)
//                .build();
//        //創建語音輸入物件，並丟入一個辨識的字串  設定顯示的文字及預設選項
//
//        Intent replyIntent = new Intent(this , MainActivity.class);
//        //語音輸入結束後必須執行Intent，可以開啟一個Activity或BroadcastReceiver
//
//        PendingIntent replyPendingIntent = PendingIntent.getActivity(this , 0 ,replyIntent , PendingIntent.FLAG_UPDATE_CURRENT);
//        //使用PendingIntent來等待執行這個Intent
//
//
//        NotificationCompat.Action action = new NotificationCompat.Action.Builder(R.mipmap.ic_launcher ,
//                "Reply" , replyPendingIntent)
//                .addRemoteInput(remoteInput).build();
//        //創建一個Action物件，並決定Icon，顯示的文字，以及要執行的Intent
//
//        Notification notification = new NotificationCompat.Builder(this)
//                .setSmallIcon(R.mipmap.ic_launcher)
//                .setContentText("語音輸入")
//                .setContentTitle("語音～～")
//                .extend(new NotificationCompat.WearableExtender().addAction(action))
//                .build();
//        //透過extend加入到wear的通知之中
//
//        NotificationManagerCompat notificationManager =
//                NotificationManagerCompat.from(this);
//        //取得NotificationManagerCompat的物件
//
//        notificationManager.notify(notificationId, notification);
//        //發送這則通知
//    }
}
