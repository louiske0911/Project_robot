package com.example.robert.bluetoothnew;

import com.google.android.gms.maps.model.LatLng;

/**
 *  作者： 邱皇旗
 *  e-mail : a0983080692@gmail.com
 *  Date : 2017/12/5
 *  Note: 利用直角坐標系 L（當下座標 & 下一個座標），先算出垂直於L的線性方程式（未成功）
 *  problem: 行進過程中會有偏差
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
