package com.example.robert.bluetoothnew;

import com.google.android.gms.maps.model.LatLng;

/**
 * Created by robert on 2017/11/6.
 */

public class angle {
    LatLng nextPosition,currentPosition,nextNextPosition;
    public angle(){}
    public void setNextPosition(LatLng nextPosition){
        this.nextNextPosition = nextPosition;
    }
    public void setCurrentPosition(LatLng currentPosition){
        this.currentPosition = currentPosition;
    }
    public void setNextNextPosition(LatLng nextNextPosition){
        this.nextNextPosition = nextNextPosition;
    }
    public double expectedAction(){
        LatLng tempVector1 = new LatLng(nextNextPosition.longitude - nextPosition.longitude ,nextNextPosition.latitude - nextPosition.latitude);
        LatLng tempVector2 = new LatLng(nextPosition.longitude - currentPosition.longitude , nextPosition.latitude - currentPosition.latitude);
        double resultVector = (tempVector1.longitude * tempVector2.longitude) + (tempVector1.latitude * tempVector2.latitude);
        double result = resultVector/(Math.sqrt(Math.pow(tempVector1.longitude,2)+Math.pow(tempVector1.latitude,2))+Math.sqrt(Math.pow(tempVector2.longitude,2)+Math.pow(tempVector2.latitude,2)));
        double templeAngle = ((Math.acos(result)) * 180) / 3.14;

        return templeAngle;
    }
}
