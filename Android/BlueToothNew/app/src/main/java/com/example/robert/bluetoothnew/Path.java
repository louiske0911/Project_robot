/**
 *  作者： 邱皇旗
 *  e-mail : a0983080692@gmail.com
 *  Date : 2017/12/5
 *
 */
package com.example.robert.bluetoothnew;

import android.util.Log;

import com.google.android.gms.maps.model.LatLng;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by robert on 2017/6/21.
 */

public class Path implements Serializable {
    LatLng start ;
    LatLng end ;
    public List<LatLng> result = new ArrayList<LatLng>();
    public List<LatLng> positionList = new ArrayList<LatLng>();
    public Path(){}
    public Path(LatLng start , LatLng end){
        this.start = start;
        this.end = end;
    }
    public void setStart(LatLng start){
        this.start = start;
//        result.add(start);
    }
    public void setEnd(LatLng end){
        this.end = end;
    }
    public void clear(){
        result.clear();
        result.add(start);
    }
    public void initPositionList(){
        for(int i = 0;i<Constants.position.length;i++){     //刪掉 -1
            positionList.add(Constants.position[i]);
        }
    }
    public List<LatLng> path() {
        result.clear();
        positionList.clear();

        initPositionList();
        int controlLa = 0;
        int controlLo = 0;
        double Value = 0.0;

        LatLng tempStart = start;

        Value = Math.sqrt(Math.pow(tempStart.longitude - end.longitude, 2) + Math.pow(tempStart.latitude - end.latitude, 2));   //計算 startPosition到 endPosition的距離
        int j =0;
        double maxValue = Value;

        for(int i=0;i < positionList.size();i++){             //找最近的結束點
            double tempValue = Math.sqrt(Math.pow(positionList.get(i).longitude - end.longitude, 2) + Math.pow(positionList.get(i).latitude - end.latitude, 2));   //計算 startPosition到 endPosition的距離
            if(Value > tempValue){
                Value = tempValue ;
                j = i;
            }
        }

        end = positionList.get(j);

        if ((tempStart.latitude - end.latitude) < 0) {
            controlLa = 1;  //  endPositionLa 在 startPosition在 的北方
        }
        if ((tempStart.longitude - end.longitude) < 0) {
            controlLo = 1;  //endPositionLa 在 startPosition在 的東方
        }


//        int tempPosition = 0;   //預選點的位置
//        int tempPosition_v2 = 0;   //預選點的位置
//        int tempPosition_v3 = 0;   //預選點的位置

        boolean stop = false;
        while (!stop) {
            int tempPosition = 0;   //預選點的位置
            int tempPosition_v2 = 0;   //預選點的位置
            int tempPosition_v3 = 0;   //預選點的位置

            int controlLa1 = 0;
            int controlLo1 = 0;
            double tempMaxValue = maxValue;
            double tempMaxValue_v2 = maxValue;
            double tempMaxValue_v3 = maxValue;


            for (int i = 0; i < positionList.size(); i++) {         //刪除 -1

                controlLa1 = 0;
                controlLo1 = 0;

                if ((tempStart.latitude - positionList.get(i).latitude) < 0) {
                    controlLa1 = 1; //tempLatitude在startPositionLa 的 北方
                }
                if ((tempStart.longitude - positionList.get(i).longitude) < 0) {
                    controlLo1 = 1; //tempLatitude在startPositionLa 的 東方
                }
                double temp = Math.sqrt(Math.pow(tempStart.latitude - positionList.get(i).latitude, 2) + Math.pow(tempStart.longitude - positionList.get(i).longitude, 2));

                if (controlLa == controlLa1 && controlLo == controlLo1) { //判斷方向是不是相同
                    if (tempMaxValue >= temp && temp != 0) {  //找出距離參考點最短距離的節點
                        tempMaxValue = temp;
                        tempPosition = i;
                    }
                }
                if(controlLa == controlLa1 || controlLo == controlLo1){
                    if (tempMaxValue_v2 >= temp && temp != 0) {  //找出距離參考點最短距離的節點
                        tempMaxValue_v2 = temp;
                        tempPosition_v2 = i;
                    }
                }
                if (tempMaxValue_v3 >= temp && temp != 0) {  //找出距離參考點最短距離的節點
                    tempMaxValue_v3 = temp;
                    tempPosition_v3 = i;
                }
            }
            if(tempStart.equals(end)){
                stop = true;
                result.add(end);
                Log.v("QWE",""+end);
            }else {
                int index =0;
                index = tempPosition;
                /**
                 * 詳細看文件的三個規則
                 */
                if((tempMaxValue * 111100)>3){
                    index = tempPosition_v2;
                    if((tempMaxValue_v2 * 111100)>10){
                        index = tempPosition_v3;
                        if((tempMaxValue_v3 * 111100)>12){
                            index = tempPosition;
                        }
                    }
                }

                controlLa = 0;
                controlLo = 0;
                if ((positionList.get(index).latitude - end.latitude) < 0) {
                    controlLa = 1;  //  endPositionLa 在 startPosition在 的北方
                }
                if ((positionList.get(index).longitude - end.longitude) < 0) {
                    controlLo = 1;  //endPositionLa 在 startPosition在 的東方
                }
                tempStart = positionList.get(index);

                result.add(tempStart);
                Log.v("position",""+tempStart+"    "+end);
                positionList.remove(index);
            }

        }

        return result;
    }
}
