package com.example.robert.myapplication.bluetoothchat;

import com.google.android.gms.maps.model.LatLng;

/**
 * Created by robert on 2017/9/24.
 */

public class CalculateAngleCurrentToGoal {
    
    protected LatLng currentPosition ,goalPosition,referPosition;
    protected float currentAngle ;
    protected Double templeAngle;
    protected static final Double LATITUDE = 90.0;
    protected String result = null;

    public CalculateAngleCurrentToGoal( ){
        this.referPosition = new LatLng(0,LATITUDE);
    }

    public CalculateAngleCurrentToGoal(LatLng currentPosition,LatLng goalPosition,float currentAngle ){
        this.referPosition = new LatLng(currentPosition.longitude,LATITUDE);
        this.currentPosition = currentPosition;
        this.goalPosition = goalPosition;
        this.currentAngle = currentAngle;
    }
    public void setCurrentPosition(LatLng currentPosition){
        this.currentPosition = currentPosition ;
        this.referPosition = new LatLng(LATITUDE,currentPosition.longitude);

    }
    public void setGoalPosition(LatLng goalPosition){
        this.goalPosition = goalPosition ;
    }
    public void setCurrentAngle(float currentAngle){
        this.currentAngle = currentAngle ;
    }
    private void CalculateAngle(){

        Double lngVector = goalPosition.longitude - currentPosition.longitude ;
        Double latVector = goalPosition.latitude - currentPosition. latitude ;
        Double lngReferVector = referPosition.longitude - currentPosition.longitude;
        Double latReferVector = referPosition.latitude - currentPosition.latitude;
        Double calculateCos = (lngVector * lngReferVector + latVector *latReferVector)/(Math.sqrt(Math.pow(lngVector, 2) + Math.pow(latVector, 2)) * (Math.sqrt(Math.pow(lngReferVector, 2) + Math.pow(latReferVector, 2)))) ;
        templeAngle = ((Math.acos(calculateCos))*180)/3.14;
    }
    private void DecideDirection(){
        if(templeAngle>currentAngle){
            result = String.valueOf(templeAngle - currentAngle);
        }
        else if(templeAngle < currentAngle){
            result = String.valueOf(templeAngle - currentAngle);
        }
        else{
            result = "0";
        }
    }
    public String toString(){
        CalculateAngle();
        DecideDirection();
        return result;
    }
}
