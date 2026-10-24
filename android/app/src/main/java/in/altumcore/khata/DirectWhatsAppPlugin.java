package in.altumcore.khata;

import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import java.io.File;

@CapacitorPlugin(name = "DirectWhatsApp")
public class DirectWhatsAppPlugin extends Plugin {

    @PluginMethod
    public void shareImageToNumber(PluginCall call) {
        String rawPhone = call.getString("phone");
        String message = call.getString("message", "");
        String filePath = call.getString("filePath");

        if (rawPhone == null || filePath == null) {
            call.reject("Phone number and filePath are required");
            return;
        }

        try {
            String cleanPhone = rawPhone.replaceAll("[^0-9]", "");
            if (cleanPhone.length() == 10) {
                cleanPhone = "91" + cleanPhone;
            }

            File file = new File(filePath.replace("file://", ""));
            if (!file.exists()) {
                call.reject("File does not exist: " + filePath);
                return;
            }

            Uri contentUri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
            );

            // Attempt direct launch into WhatsApp
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/*");
            intent.setPackage("com.whatsapp");
            intent.putExtra("jid", cleanPhone + "@s.whatsapp.net");
            intent.putExtra(Intent.EXTRA_STREAM, contentUri);
            intent.putExtra(Intent.EXTRA_TEXT, message);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getContext().startActivity(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            // Fallback for WhatsApp Business if standard WhatsApp is not installed
            try {
                String cleanPhone = rawPhone.replaceAll("[^0-9]", "");
                if (cleanPhone.length() == 10) cleanPhone = "91" + cleanPhone;

                File file = new File(filePath.replace("file://", ""));
                Uri contentUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    file
                );

                Intent businessIntent = new Intent(Intent.ACTION_SEND);
                businessIntent.setType("image/*");
                businessIntent.setPackage("com.whatsapp.w4b");
                businessIntent.putExtra("jid", cleanPhone + "@s.whatsapp.net");
                businessIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                businessIntent.putExtra(Intent.EXTRA_TEXT, message);
                businessIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                businessIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                getContext().startActivity(businessIntent);

                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception ex) {
                call.reject("WhatsApp launch failed: " + ex.getMessage());
            }
        }
    }
}
