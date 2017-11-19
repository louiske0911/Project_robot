package com.example.robert.bluetoothnew;

import com.google.android.gms.maps.model.LatLng;

/**
 * Created by robert on 2017/11/11.
 */

public class CalcalateAngleWithMagnetic_v2 {
    LatLng lastPosition = null,currentPosition =null,directionPosition =null;
    double xVector,yVector;
    double y = 0.0;
    public CalcalateAngleWithMagnetic_v2(){}
    public void setLastPosition(LatLng lastPosition){
        this.lastPosition = lastPosition;
    }
    public void setCurrentPosition(LatLng currentPosition){
        this.currentPosition = currentPosition;
    }
    public void setDirectionPosition(LatLng directionPosition){
        this.directionPosition = directionPosition;
    }
    public void expectedAction(){
        double slope_v1 = (directionPosition.longitude - lastPosition.longitude)/(directionPosition.latitude - lastPosition.latitude);
        double constant_V1 = directionPosition.longitude - (slope_v1 * directionPosition.latitude);
        double slope_v2 = -slope_v1;
        double constant_V2 = currentPosition.longitude - (slope_v2 * currentPosition.latitude);
        double x= (constant_V2 - constant_V1)/(slope_v1 - slope_v2);
        y = (x * slope_v2) + constant_V2;

//        LatLng tempVector = new LatLng(directionPosition.latitude - currentPosition.latitude , directionPosition.longitude - currentPosition.longitude);
//        double constant1 = (tempVector.latitude * lastPosition.latitude) + (tempVector.longitude * lastPosition.longitude);
//        double constant2 = (tempVector.longitude * currentPosition.latitude) - (tempVector.latitude * currentPosition.longitude);
//        xVector = ((constant1 * tempVector.latitude) + (constant2 * tempVector.longitude))/((tempVector.latitude * tempVector.latitude)+(tempVector.longitude * tempVector.longitude));
//        yVector = ((tempVector.latitude * constant2) - (tempVector.longitude * constant1))/((tempVector.latitude * tempVector.latitude)+(tempVector.longitude * tempVector.longitude));
    }
    public int direction(){
        if(y - currentPosition.longitude < 0){
            return 0;   //左
        }else{
            return 1;   //右
        }
    }
    public double modifyAngle(){
        LatLng lastToDir = new LatLng(directionPosition.latitude - currentPosition.latitude,directionPosition.longitude - currentPosition.longitude);
        LatLng dirToCur = new LatLng(currentPosition.latitude - lastPosition.latitude,currentPosition.longitude - lastToDir.longitude);
        double resultVector = (lastToDir.longitude * dirToCur.longitude) + (lastToDir.latitude * dirToCur.latitude);
        double result = resultVector/(Math.sqrt(Math.pow(lastToDir.longitude,2)+Math.pow(lastToDir.latitude,2))+Math.sqrt(Math.pow(dirToCur.longitude,2)+Math.pow(dirToCur.latitude,2)));
        double templeAngle = ((Math.acos(result)) * 180) / 3.14;
        int dir = direction();
        if(dir == 1){
            templeAngle = -templeAngle;
        }

        return templeAngle;
    }
}
