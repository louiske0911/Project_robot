package com.example.root12_31.demo_google;

import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;

import com.google.android.gms.maps.model.LatLng;

/**
 * Created by root12-31 on 2017/5/21.
 */
import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;

import com.google.android.gms.maps.model.LatLng;


public class pathServer extends Service
{
    public class LocalBinder extends Binder //宣告一個繼承 Binder 的類別 LocalBinder
    {
        pathServer getService()
        {
            return  pathServer.this;
        }
    }
    private LocalBinder mLocBin = new LocalBinder();

    @Override
    public IBinder onBind(Intent arg0)
    {
        // TODO Auto-generated method stub
        return  mLocBin;
    }

    @Override
    public void onCreate()
    {
        super.onCreate();
        // TODO Auto-generated method stub
    }
    public boolean isFinish( String end,int currentPosition){
        if(currentPosition == Integer.parseInt(end))
            return true;
        return false;
    }
    public int path(String start , String end,LatLng position[])
    {
        double startPositionLa = position[Integer.parseInt(start)].latitude;
        double startPositionLo = position[Integer.parseInt(start)].longitude;
        double endPositionLa = position[Integer.parseInt(end)].latitude;
        double endPositionLo = position[Integer.parseInt(end)].longitude;
        int controlLa = 0;
        int controlLo = 0;
        double maxValue = Math.sqrt(Math.pow(startPositionLa - endPositionLa,2)+Math.pow(startPositionLo - endPositionLo,2));
        boolean finish = false;
        if((startPositionLa - endPositionLa) <= 0){ //在北方
            controlLa = 1;
            if((startPositionLo - endPositionLo) <= 0){ //在東邊
                controlLo = 1;
            }
        }

        boolean choose = false;
        int tempPosition = 0;
        double tempLo = 0;
        double tempLa = 0;

        for(int i=0 ; i<10;i++){
//                Toast.makeText(this, position[i].toString(), Toast.LENGTH_LONG).show();
            tempLo = position[i].longitude;
            tempLa = position[i].latitude;
            int controlLa1 = 0;
            int controlLo1 = 0;

            if((tempLa - endPositionLa) <= 0){ //在北方
                controlLa1 = 1;
                if((tempLo - endPositionLo) <= 0){ //在東邊
                    controlLo1 = 1;
                }else{
                    controlLo1 = 0;
                }
            }else{
                controlLa1 = 0;
            }
            if(controlLa == controlLa1 && controlLo == controlLo1){
                double temp =Math.sqrt(Math.pow(tempLa - endPositionLa,2)+Math.pow(tempLo - endPositionLo,2));
                if(maxValue>temp){
                    maxValue = temp;
                    tempPosition = i;
                    choose = true;
                }
            }
        }

        return tempPosition;
    }

    public int onStartCommand(Intent intent, int flags, int startId)
    {
        // TODO Auto-generated method stub
        return super.onStartCommand(intent, flags, startId);
    }


    public boolean onUnbind(Intent intent)
    {
        // TODO Auto-generated method stub
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy()
    {
        super.onDestroy();
        // TODO Auto-generated method stub
    }
}