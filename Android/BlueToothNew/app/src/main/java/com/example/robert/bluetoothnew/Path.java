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
    private LatLng[] position = {new LatLng(24.179012, 120.649016), new LatLng(24.179944, 120.649007), new LatLng(24.179964, 120.648269)
            , new LatLng(24.179005, 120.648316), new LatLng(24.178967, 120.647365), new LatLng(24.179615, 120.647335), new LatLng(24.179918, 120.647327)
            , new LatLng(24.180730, 120.647278), new LatLng(24.178525, 120.650162), new LatLng(24.180764, 120.648236), new LatLng(24.179625, 120.648286)
            , new LatLng(24.179623, 120.648017), new LatLng(24.179633, 120.647751), new LatLng(24.179741, 120.647499), new LatLng(120.6465861111111,24.18122222222222
    ), new LatLng(120.6481909999689,24.18186200034923
    ), new LatLng(120.6470452919897,24.18156008546125
    ), new LatLng(120.6470694444445,24.18131944444444
    ), new LatLng(120.6469637659379,24.18123611111112
    ), new LatLng(120.6472605698626,24.1812913621574
    ), new LatLng(120.6473611111111,24.18115811845514
    ), new LatLng(120.6482194444445,24.18128333333333
    ), new LatLng(120.6474722222222,24.18132222222222
    ), new LatLng(120.6471795033239,24.18078424435894
    ), new LatLng(120.6466083333333,24.18081388888889
    ), new LatLng(120.6476142538233,24.18075206496664
    ), new LatLng(120.6482058880275,24.18078286480261
    ), new LatLng(120.6466087837751,24.18031685881472
    ), new LatLng(120.6472641826713,24.18031163747797
    ), new LatLng(120.648209617275,24.18029425476785
    ), new LatLng(120.646632874008,24.17993202806168
    ), new LatLng(120.6469246787518,24.17992603687486
    ), new LatLng(120.6472003724947,24.17991812579432
    ), new LatLng(120.6473300989181,24.17990826932096
    ), new LatLng(120.6482236484862,24.17999233784844
    ), new LatLng(120.6466203841294,24.17959712366047
    ), new LatLng(120.6468892317704,24.17956476820713
    ), new LatLng(120.64730968536,24.17960455725339
    ), new LatLng(120.6482899956542,24.17961946298939
    ), new LatLng(120.6466289181874,24.17914074319237
    ), new LatLng(120.6473515466257,24.17922069773672
    ), new LatLng(120.6482992354,24.17917528512395
    ), new LatLng(120.6466637961441,24.17896118275781
    ), new LatLng(120.6469282609729,24.17897772201846
    ), new LatLng(120.6473589499996,24.17898424026517
    ), new LatLng(120.6483055184189,24.17900672105982
    ), new LatLng(120.6466990738936,24.17872366772426
    ), new LatLng(120.6469822609353,24.17872505670046
    ), new LatLng(120.6473647913087,24.17873070074213
    ), new LatLng(120.647658607523,24.17873878211244
    ), new LatLng(120.6478838224967,24.17872260220492
    ), new LatLng(120.6478830861447,24.17898467809041
    ), new LatLng(120.6480954905807,24.17899420656344
    ), new LatLng(120.6483882683866,24.17892801718514
    ), new LatLng(120.6485720033264,24.1789254685852
    ), new LatLng(120.6480881522858,24.17876224422344
    ), new LatLng(120.6483954281339,24.17872306864687
    ), new LatLng(120.6485722444161,24.17872935221843
    ), new LatLng(120.6466862427862,24.17844046406602
    ), new LatLng(120.6473291387204,24.17845009433626
    ), new LatLng(120.647893150398,24.17848791058166
    ), new LatLng(120.6482237444666,24.17849426350049
    ), new LatLng(120.6485605215786,24.17850516126813
    ), new LatLng(120.6467357891668,24.17819334803434
    ), new LatLng(120.6473678529242,24.17821138703848
    ), new LatLng(120.6478638978638,24.17823466057989
    ), new LatLng(120.6486283676537,24.17834689893117
    ), new LatLng(120.648262855497,24.18137651155918
    ), new LatLng(120.6486807620403,24.18134124358059
    ), new LatLng(120.6490310620029,24.18145016108749
    ), new LatLng(120.648312767915,24.18126089680565
    ), new LatLng(120.6490313153069,24.18132545204828
    ), new LatLng(120.6498037061396,24.18132246787822
    ), new LatLng(120.6483511359401,24.18080737586667
    ), new LatLng(120.649035134088,24.18084653353629
    ), new LatLng(120.6498821504242,24.1808452582211
    ), new LatLng(120.6483645094259,24.18050204228485
    ), new LatLng(120.6490892088694,24.18047169734087
    ), new LatLng(120.6496836067477,24.18046263461916
    ), new LatLng(120.6488347058546,24.18025408223056
    ), new LatLng(120.6491262955695,24.18024082976349
    ), new LatLng(120.6497005608728,24.18028946216966
    ), new LatLng(120.6489342430712,24.17993736163443
    ), new LatLng(120.6495147859197,24.17994589694155
    ), new LatLng(120.6501027777778,24.17991944444444
    ), new LatLng(120.6486273133122,24.1795393726978
    ), new LatLng(120.648966270993,24.17961377086195
    ), new LatLng(120.6495498735288,24.17963623228225
    ), new LatLng(120.6500616759784,24.17964691990812
    ), new LatLng(120.648625588762,24.17936907156429
    ), new LatLng(120.6489615947087,24.17943623644489
    ), new LatLng(120.6490917044274,24.17952808063993
    ), new LatLng(120.6495429296868,24.17951778412466
    ), new LatLng(120.6500761371955,24.17954684309479
    ), new LatLng(120.6486698976773,24.17899929858724
    ), new LatLng(120.6490171413316,24.17900971599801
    ), new LatLng(120.6493051527896,24.17900536132791
    ), new LatLng(120.6495587629607,24.17900796440795
    ), new LatLng(120.6501055555556,24.17900833333334
    ), new LatLng(120.6493073730021,24.17878850203862
    ), new LatLng(120.6496934395279,24.1787006341724
    ), new LatLng(120.6501109734758,24.17872985017766
    ), new LatLng(120.6493048027808,24.17858546994245
    ), new LatLng(120.6493126463282,24.17846114368696
    ), new LatLng(120.6496001398641,24.17853949198673
    ), new LatLng(120.6497994323686,24.17851980797544
    ), new LatLng(120.6501179940677,24.17853617716676
    ), new LatLng(120.6468694444444,24.18154444444444
    )};
    public Path(){}
    public Path(LatLng start , LatLng end){

        this.start = start;
        this.end = end;
    }
    public void setStart(LatLng start){
        this.start = start;
        result.add(start);
    }
    public void setEnd(LatLng end){
        this.end = end;
    }
    public List<LatLng> path() {
        double startPositionLa = start.latitude;   //取得startPosition的緯度
        double startPositionLo = start.longitude;  //取得startPosition的經度
        double endPositionLa = end.latitude;     //取得endPosition的緯度
        double endPositionLo = end.longitude;    //取得endPosition的經度

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
        int a = 0;
        while (a<10) {
            double tempLongitude = 0;
            double tempLatitude = 0;
            int controlLa1 = 0;
            int controlLo1 = 0;
            double tempMaxValue = maxValue;

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

            result.add(new LatLng(startPositionLa,startPositionLo));
            Log.v("position",""+new LatLng(startPositionLa,startPositionLo));
            if (new LatLng(startPositionLa,startPositionLo) == end) { //判斷參考點是否等於終點
                isFinish = true;
                Log.v("position","1111");

            }
        }
        return result;
    }
}
