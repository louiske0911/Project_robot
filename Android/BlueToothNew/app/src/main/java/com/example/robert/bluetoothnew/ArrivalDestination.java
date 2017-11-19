package com.example.robert.bluetoothnew;

import android.util.Log;

import com.google.android.gms.maps.model.LatLng;

import static java.lang.Math.pow;
import static java.lang.Math.sqrt;

/**
 * Created by robert on 2017/10/28.
 */

public class ArrivalDestination {
    public LatLng direction ;
    public LatLng source ;

    public ArrivalDestination(){
        direction = null ;
        source = null;
    }
    public void setDirection(LatLng direction){
        this.direction = direction ;
    }
    public void setSource(LatLng source){
        this.source = source ;
    }
    public boolean calDistance(){
        double temp = sqrt(pow(direction.latitude-source.latitude,2)+pow(direction.longitude - source.longitude,2)) * 111100;    // 緯經度差一度差， 111.1公里
        Log.v("Direction","Direction :"+temp);
        if(temp < 5) {
            return true;
        }
        return false;
    }
}
