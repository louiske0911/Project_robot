/**
 *  作者： 邱皇旗
 *  e-mail : a0983080692@gmail.com
 *  Date : 2017/12/5
 *  Note : Dijkstra 演算法（未完成）
 */
package com.example.robert.bluetoothnew;

import android.location.Location;
import android.util.Log;

import com.google.android.gms.maps.model.LatLng;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by robert on 2017/11/28.
 */

public class Dijkstra {
    LatLng start;
    LatLng end;
    public List<LatLng> resultlist = new ArrayList<LatLng>();
    public List<LatLng> positionList = new ArrayList<LatLng>();
    public float value;

    public Dijkstra() {
    }

    public Dijkstra(LatLng start, LatLng end) {
        this.start = start;
        this.end = end;
    }

    public void setStart(LatLng start) {
        this.start = start;
//        result.add(start);
    }

    public void setEnd(LatLng end) {
        this.end = end;
    }

    public void clear() {
        resultlist.clear();
        resultlist.add(start);
    }

    public void initPositionList() {
        for (int i = 0; i < DijkstraData.dijkstraPosition.length - 1; i++) {
            positionList.add(DijkstraData.dijkstraPosition[i]);
        }
    }

    public List<LatLng> path() {
        positionList.clear();

        initPositionList();
        LatLng tempStart = start;
        float [] Values = new float[1];

        int endPosition = 0;
        int startPosition = 0;
        Log.v("start",""+start +" "+positionList.size());

        Location.distanceBetween(tempStart.latitude,tempStart.longitude,end.latitude,end.longitude,Values);
           //計算 startPosition到 endPosition的距離
        int value = (int)Values[0];
        int j = 0;

        for (int i = 0; i < positionList.size() - 1; i++) {
            if (exclude(i)) {
                float[] tempValues = new float[1];
                Location.distanceBetween(positionList.get(i).latitude,positionList.get(i).longitude,end.latitude,end.longitude,tempValues);
                int tempValue = (int)tempValues[0];
                if (value > tempValue) {
                    value = tempValue;
                    j = i;
                }
            }

        }
        endPosition = j;
        value = (int)Values[0];
        for (int i = 0; i < positionList.size() - 1; i++) {
            if (exclude(i)) {
                float[] tempValues = new float[1];
                Location.distanceBetween(positionList.get(i).latitude,positionList.get(i).longitude,tempStart.latitude,tempStart.longitude,tempValues);
                int tempValue = (int)tempValues[0];
                if (value > tempValue) {
                    value = tempValue;
                    j = i;
                }
            }

        }
        startPosition = j;

        Log.v("start",""+startPosition);

        ArrayList<Integer> tt = calDijkstra(endPosition, startPosition);
        Log.v("list",""+tt);
        for (int i = 0; i < tt.size(); i++) {
            if(tt.get(i) == endPosition){
                resultlist.add(DijkstraData.dijkstraPosition[tt.get(i)]);
//                i = tt.size();
            }else{
                resultlist.add(DijkstraData.dijkstraPosition[tt.get(i)]);
            }
        }
        return resultlist;
    }

    public ArrayList<Integer> calDijkstra(int end, int start) {
        int[][] arrayPosition = new int[226][226];
        float[] distance = new float[1];
        ArrayList<Integer> result = new ArrayList<Integer>();

        for (int i = 0; i < DijkstraData.dijkstraPosition1.length; i++) {
            arrayPosition[i][0] = DijkstraData.dijkstraPosition1[i][0];
            for(int j=1;j<DijkstraData.dijkstraPosition1.length;j++){
                arrayPosition[i][j] = Integer.MAX_VALUE;
            }
        }

        int nextPoaition = start;
        int lastPoaition = 0;
        int next =0;
        boolean turnoff = false;
        for(int i=0;i<DijkstraData.dijkstraPosition1.length;i++){
            for(int j=1;j<DijkstraData.dijkstraPosition1[i].length;j++){
//                Log.v("222",""+i+" "+j+" "+DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][0]].latitude);
//                Log.v("222",""+i+" "+j+" "+DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][0]].longitude);
////                Log.v("222",""+i+" "+j+" "+DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][j]].latitude);
//                Log.v("222",""+i+" "+j+" "+DijkstraData.dijkstraPosition1[i][j]);
//                Log.v("222",""+i+" "+j+" "+DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][j]].longitude);
                Location.distanceBetween(
                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][0]-1].latitude,
                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][0]-1].longitude,
                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][j]-1].latitude,
                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[i][j]-1].longitude, distance);
                arrayPosition[i][j] = (int)distance[0];
            }
        }

        for(int i=0;i<DijkstraData.dijkstraPosition1.length;i++){
            int max = Integer.MAX_VALUE;
            for(int j=1;j<DijkstraData.dijkstraPosition1[nextPoaition].length;j++){
                if(max>arrayPosition[nextPoaition][j]){
                    max = arrayPosition[nextPoaition][j];
                    next = j;
                }
            }
            arrayPosition[nextPoaition][next] = Integer.MAX_VALUE;
            result.add(DijkstraData.dijkstraPosition1[nextPoaition][next]);
            nextPoaition = DijkstraData.dijkstraPosition1[nextPoaition][next];
        }

//        for (int i = 0; i < DijkstraData.dijkstraPosition1.length; i++) {
//            int maxValue = Integer.MAX_VALUE;
//            result.add(nextPoaition);
//            int time = compara(nextPoaition);
//            Log.v("2222",""+time);
//            for (int j = 1; j < DijkstraData.dijkstraPosition1[time].length; j++) {
//                if(lastPoaition == DijkstraData.dijkstraPosition1[time][j] && turnoff){}
//                else{
//                    Location.distanceBetween(
//                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[time][0]].latitude,
//                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[time][0]].longitude,
//                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[time][j]].latitude,
//                            DijkstraData.dijkstraPosition[DijkstraData.dijkstraPosition1[time][j]].longitude, distance);
//
//                    int currentValue = (int) distance[0];
//                    if (arrayPosition[j][1] > currentValue) {
//                        arrayPosition[j][1] = currentValue;
//                    }
//                    if (maxValue > currentValue) {
//                        maxValue = currentValue;
//                        next = DijkstraData.dijkstraPosition1[time][j];
//                    }
//                }
//                if(turnoff){
//                    lastPoaition = nextPoaition;
//                }
//                if(!turnoff){
//                    turnoff = true;
//                }
//            }
//            nextPoaition = next;
//        }


        return result;
    }

    public boolean exclude(int positionNumber) {
        for (int j = 0; j < DijkstraData.avoid.length; j++) {
            if (positionNumber == DijkstraData.avoid[j]) {
                return false;
            }
        }
        return true;
    }
    public int compara(int Value){
        for(int i=0;i<DijkstraData.dijkstraPosition1.length;i++){
            if(Value == DijkstraData.dijkstraPosition1[i][0]){
                return i;
            }
        }
        return 0;
    }
}
