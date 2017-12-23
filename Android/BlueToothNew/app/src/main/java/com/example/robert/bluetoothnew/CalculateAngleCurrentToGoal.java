package com.example.robert.bluetoothnew;

import com.google.android.gms.maps.model.LatLng;

/**
 *  作者： 邱皇旗
 *  e-mail : a0983080692@gmail.com
 *  Date : 2017/12/5
 *  Note:詳細請看文件
 */

public class CalculateAngleCurrentToGoal {

    protected LatLng currentPosition = null, goalPosition = null, referPosition=null;
    protected float currentAngle;
    protected Double templeAngle;
    protected static final Double LATITUDE = 90.0;
    protected String result = null;

    public CalculateAngleCurrentToGoal() {
        this.referPosition = new LatLng(0, LATITUDE);
    }

    public CalculateAngleCurrentToGoal(LatLng currentPosition, LatLng goalPosition, float currentAngle) {
        this.referPosition = new LatLng(currentPosition.longitude, LATITUDE);
        this.currentPosition = currentPosition;
        this.goalPosition = goalPosition;
        this.currentAngle = currentAngle;
    }

    public void setCurrentPosition(LatLng currentPosition) {
        this.currentPosition = currentPosition;
        this.referPosition = new LatLng(LATITUDE, currentPosition.longitude);

    }

    public void setGoalPosition(LatLng goalPosition) {
        this.goalPosition = goalPosition;
    }

    public void setCurrentAngle(float currentAngle) {
        this.currentAngle = currentAngle;
    }

    private void CalculateAngle() {

        Double lngVector = goalPosition.longitude - currentPosition.longitude;
        Double latVector = goalPosition.latitude - currentPosition.latitude;
        Double lngReferVector = referPosition.longitude - currentPosition.longitude;
        Double latReferVector = referPosition.latitude - currentPosition.latitude;
        Double calculateCos = (lngVector * lngReferVector + latVector * latReferVector) / (Math.sqrt(Math.pow(lngVector, 2) + Math.pow(latVector, 2)) * (Math.sqrt(Math.pow(lngReferVector, 2) + Math.pow(latReferVector, 2))));
        templeAngle = ((Math.acos(calculateCos)) * 180) / 3.14;
    }

    private void DecideDirection() {
        int positiveX = 0;

        if((goalPosition.latitude - currentPosition.latitude) > 0){
            positiveX = 1;  //goalPosition 在 currentPosition 的東方
        }

        if(positiveX == 1){
            if (templeAngle > currentAngle) {       //右轉
                if (((templeAngle - currentAngle) > 0) && ((templeAngle - currentAngle) < 15)) {
                    result = "999";

                } else {
                    result = String.valueOf(templeAngle - currentAngle);
                }
            } else if (templeAngle < currentAngle) { //左轉

                if (((templeAngle - currentAngle) < 0) && ((templeAngle - currentAngle) > -15)) {
                    result = "999";

                } else {
                    result = String.valueOf(templeAngle - currentAngle);
                }

            } else {
                result = "999";
            }
        }else{
            if (templeAngle < currentAngle) {       //右轉
                if (((templeAngle - currentAngle) < 0) && ((templeAngle - currentAngle) > -15)) {
                    result = "999";

                } else {
                    result = String.valueOf(templeAngle - currentAngle);
                }
            } else if (templeAngle > currentAngle) { //左轉

                if (((templeAngle - currentAngle) > 0) && ((templeAngle - currentAngle) < 15)) {
                    result = "999";

                } else {
                    result = String.valueOf(templeAngle - currentAngle);
                }

            } else {
                result = "999";
            }

        }


    }

    public String toString() {
        CalculateAngle();
        DecideDirection();
        return result;
    }
}

