setTimeout(function() {
    Java.perform(function() {
        console.log('');
        console.log('===');
        console.log('SSL Pinning Bypass Script');
        console.log('===');

        try {
            var okhttp3_Activity = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity.check.overload('java.lang.String', 'java.util.List').implementation = function(str, list) {
                console.log('[+] OkHttp 3.x check() called for ' + str);
                return;
            };
            console.log('[+] OkHttp 3.x SSL Pinning Bypass Success');
        } catch (err) {
            console.log('[-] OkHttp 3.x SSL Pinning Bypass Failed: ' + err);
        }

        try {
            var trustManager = Java.use('javax.net.ssl.X509TrustManager');
            var sslContext = Java.use('javax.net.ssl.SSLContext');

            var TrustManager = Java.registerClass({
                name: 'com.temp.TrustManager',
                implements: [trustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() {
                        return [];
                    }
                }
            });

            var TrustManagers = [TrustManager.$new()];
            var SSLContext_init = sslContext.init.overload(
                '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
            );
            SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
                console.log('[+] Bypassing Trustmanager (Android < 7) request');
                SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
            };
            console.log('[+] SSL Certificate Validation Bypass Success');
        } catch (err) {
            console.log('[-] SSL Certificate Validation Bypass Failed: ' + err);
        }
    });
}, 0);

/*
Usage:
1. Install Frida: pip install frida-tools
2. Install this script on the target device
3. Run the bypass:
   frida -U -f com.example.app -l ssl_bypass.js --no-pause

Note: This script needs to be customized based on the specific SSL pinning implementation used by each app.
*/ 