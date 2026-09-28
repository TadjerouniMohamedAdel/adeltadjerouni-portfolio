package app.stations;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Hosts the bundled Stations UI (assets/index.html) in a full-screen WebView. */
public class MainActivity extends Activity {

    private static final int LIGHT_NAV_BAR = 0x10; // View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR (API 26)

    private WebView webView;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor("#F3EFE6"));
        window.setNavigationBarColor(Color.parseColor("#FFFDF8"));
        int flags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (Build.VERSION.SDK_INT >= 26) flags |= LIGHT_NAV_BAR;
        window.getDecorView().setSystemUiVisibility(flags);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#F3EFE6"));
        webView.setFitsSystemWindows(true);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(true);

        webView.addJavascriptInterface(new Store(getSharedPreferences("stations", Context.MODE_PRIVATE)), "StationsStore");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            @SuppressWarnings("deprecation") // compiled against API 23; newer WebViews still route here
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !url.startsWith("file:///android_asset/");
            }
        });

        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.evaluateJavascript("window.stationsRefresh && window.stationsRefresh()", null);
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript("window.stationsBack ? window.stationsBack() : false", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String handled) {
                if (!"true".equals(handled)) moveTaskToBack(true);
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    /** Local persistence for the app state (a single JSON document). */
    static final class Store {
        private static final String KEY = "state";
        private final SharedPreferences prefs;

        Store(SharedPreferences prefs) {
            this.prefs = prefs;
        }

        @JavascriptInterface
        public String load() {
            return prefs.getString(KEY, null);
        }

        @JavascriptInterface
        public void save(String json) {
            prefs.edit().putString(KEY, json).commit();
        }
    }
}
