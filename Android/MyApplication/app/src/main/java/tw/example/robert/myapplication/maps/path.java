package tw.example.robert.myapplication.maps;

import com.google.android.gms.maps.model.LatLng;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by robert on 2017/6/21.
 */

public class path implements Serializable {
    int start =0;
    int end =0;
    public List<Integer> result = new ArrayList<Integer>();
    private  LatLng[] position= {new LatLng(24.179012,120.649016), new LatLng(24.179944, 120.649007),new LatLng(24.179964, 120.648269)
            ,new LatLng(24.179005, 120.648316),new LatLng(24.178967, 120.647365),new LatLng(24.179615, 120.647335),new LatLng(24.179918, 120.647327)
            ,new LatLng(24.180730, 120.647278),new LatLng(24.178525, 120.650162),new LatLng(24.180764, 120.648236),new LatLng(24.179625, 120.648286)
            ,new LatLng(24.179623, 120.648017),new LatLng(24.179633, 120.647751),new LatLng(24.179741, 120.647499)};

    public path(int start , int end){

        this.start = start;
        this.end = end;
    }
    public List<Integer> path() {
        double startPositionLa = position[start].latitude;   //取得startPosition的緯度
        double startPositionLo = position[start].longitude;  //取得startPosition的經度
        double endPositionLa = position[end].latitude;     //取得endPosition的緯度
        double endPositionLo = position[end].longitude;    //取得endPosition的經度

        int controlLa = 0;
        int controlLo = 0;
        double maxValue = Math.sqrt(Math.pow(startPositionLa - endPositionLa, 2) + Math.pow(startPositionLo - endPositionLo, 2));   //計算 startPosition到 endPosition的距離


        if ((startPositionLa - endPositionLa) < 0) {
            controlLa = 1;  //  endPositionLa 在 startPosition在 的北方
        }
        if ((startPositionLo - endPositionLo) < 0) {
            controlLo = 1;  //endPositionLa 在 startPosition在 的東方
        }


        int tempPosition = 0;   //預選點的位置


        boolean isFinish = false;

        result.add(start);
        int a =0;
        while (a<3) {
            double tempLongitude = 0;
            double tempLatitude = 0;
            int controlLa1 = 0;
            int controlLo1 = 0;
            double tempMaxValue = maxValue; //
            a++;


            for (int i = 0; i < position.length; i++) {

                tempLongitude = position[i].longitude;
                tempLatitude = position[i].latitude;
                controlLa1 = 0;
                controlLo1 = 0;


                if ((startPositionLa - tempLatitude) < 0) {
                    controlLa1 = 1; //tempLatitude在startPositionLa 的 北方
                }
                if ((startPositionLo - tempLongitude) < 0) {
                    controlLo1 = 1; //tempLatitude在startPositionLa 的 東方
                }

                if (controlLa == controlLa1 && controlLo == controlLo1) { //判斷方向是不是相同
                    double temp = Math.sqrt(Math.pow(startPositionLa - tempLatitude, 2) + Math.pow(startPositionLo - tempLongitude, 2));
                    if (tempMaxValue >= temp && temp != 0) {  //找出距離參考點最短距離的節點
                        tempMaxValue = temp;
                        tempPosition = i;

                    }
                }
            }

            startPositionLa = position[tempPosition].latitude;
            startPositionLo = position[tempPosition].longitude;
            result.add(tempPosition);

            if (tempPosition == end) { //判斷參考點是否等於終點
                isFinish = true;
            }
        }
        return result;
    }
}
