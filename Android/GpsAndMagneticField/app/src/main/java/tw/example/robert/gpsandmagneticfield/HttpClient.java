package tw.example.robert.gpsandmagneticfield;

/**
 * Created by robert on 2017/11/20.
 */

import android.os.AsyncTask;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by kiam on 6/16/2017.
 */

public class HttpClient extends AsyncTask<String, String, String> {
    @Override
    protected String doInBackground(String... params) {
        URL targetUrl = null;
        HttpURLConnection urlConnection = null;
        BufferedReader reader = null;
        StringBuilder stringBuilder = new StringBuilder();
        try {
            Log.v("asdasdasdas",params[0]);
            URL url = new URL(params[0]);
            urlConnection = (HttpURLConnection) url.openConnection();
            urlConnection.setRequestMethod("POST");
//            urlConnection.setRequestProperty("Content-Type", "application/json");

//            urlConnection = (HttpURLConnection) targetUrl.openConnection();
            urlConnection.setDoOutput(true);
////            urlConnection.setRequestProperty("Content-Type", "application/json");
////            reader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));//do something
            String json = "{\"phonetype\":\"N95\",\"cat\":\"WP\"}";

            JSONObject obj = null;
            try {

                obj = new JSONObject(json);

                Log.d("My App", obj.toString());

            } catch (Throwable t) {
                Log.e("My App", "Could not parse malformed JSON: \"" + json + "\"");
            }
            Log.v("http",""+HttpURLConnection.HTTP_OK+"   "+urlConnection.getResponseCode());
//            OutputStream os = urlConnection.getOutputStream();
//            os.write(input.getBytes());
//            os.flush();

            OutputStream os = urlConnection.getOutputStream();
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os));
            writer.write(obj.toString());
            writer.flush();
            writer.close();
            os.close();
            /**
             * Get
             */
//            int responseCode = urlConnection.getResponseCode();
//            StringBuilder response = new StringBuilder();
//            if(responseCode == HttpURLConnection.HTTP_OK){
//                String line ;
//                BufferedReader br = new BufferedReader( new InputStreamReader(urlConnection.getInputStream()));
////                while ((line = br.readLine()) != null){
////                    response.append(line);
////                }
////                Log.v("testt",""+response.toString());
//            }

        } catch (Exception e) {
            Log.v("test", e.toString());


        } finally {
            urlConnection.disconnect();
        }
        Log.v("test", stringBuilder.toString());

        return stringBuilder.toString();
    }

    @Override
    protected void onPostExecute(String s) {
        super.onPostExecute(s);
        onResponse(s);
        Log.v("log_tag", s);

    }

    public void onResponse(String response) {

    }
}
