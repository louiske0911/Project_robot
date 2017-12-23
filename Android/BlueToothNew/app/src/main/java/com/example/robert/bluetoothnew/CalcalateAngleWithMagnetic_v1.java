package com.example.robert.bluetoothnew;

import com.google.android.gms.maps.model.LatLng;

/**
 *  作者： 邱皇旗
 *  e-mail : a0983080692@gmail.com
 *  Date : 2017/12/
 *  Note: 前一個座標，當下座標，下一個座標，計算轉彎的角度（未成功）
 *  problem：如果沒有校正後，此方法可行性低
 */

public class CalcalateAngleWithMagnetic_v1 {
    LatLng nextPosition,currentPosition,nextNextPosition;
    public CalcalateAngleWithMagnetic_v1(){}
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
        LatLng tempVector1 = new LatLng(nextNextPosition.latitude - nextPosition.latitude ,nextNextPosition.longitude - nextPosition.longitude);
        LatLng tempVector2 = new LatLng(nextPosition.latitude - currentPosition.latitude , nextPosition.longitude - currentPosition.longitude);
        double resultVector = (tempVector1.longitude * tempVector2.longitude) + (tempVector1.latitude * tempVector2.latitude);
        double result = resultVector/(Math.sqrt(Math.pow(tempVector1.longitude,2)+Math.pow(tempVector1.latitude,2))+Math.sqrt(Math.pow(tempVector2.longitude,2)+Math.pow(tempVector2.latitude,2)));
        double templeAngle = ((Math.acos(result)) * 180) / 3.14;

        return templeAngle;
    }
}
