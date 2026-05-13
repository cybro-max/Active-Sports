const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * ActiveSports Google Indexing API Utility
 * Used to notify Google of new/updated URLs for near-instant indexing.
 * 
 * Usage: npx tsx scripts/ping-google.ts <url1> <url2> ...
 */
async function pingGoogle() {
  const urls = process.argv.slice(2);
  
  if (urls.length === 0) {
    console.error('❌ Error: Please provide at least one URL to index.');
    process.exit(1);
  }

  let authClient;
  const keyPath = path.join(process.cwd(), 'service-account.json');
  
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      // Support JSON string from environment (GitHub Secrets)
      const keys = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      authClient = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/indexing']
      );
    } catch (e: any) {
      console.error('❌ Error parsing GOOGLE_SERVICE_ACCOUNT_JSON:', e.message);
      process.exit(1);
    }
  } else if (fs.existsSync(keyPath)) {
    authClient = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
  } else {
    console.warn('⚠️ Warning: service-account.json or GOOGLE_SERVICE_ACCOUNT_JSON not found.');
    console.log('To use the Indexing API, please follow these steps:');
    console.log('1. Go to Google Cloud Console.');
    console.log('2. Enable "Indexing API".');
    console.log('3. Create a Service Account, download the JSON key, and name it "service-account.json" or set GOOGLE_SERVICE_ACCOUNT_JSON secret.');
    console.log('4. Add the service account email as an "Owner" in Google Search Console.');
    process.exit(1);
  }

  console.log(`🚀 Notifying Google about ${urls.length} URL(s)...`);

  const indexing = google.indexing('v3');

  for (const url of urls) {
    try {
      const response = await indexing.urlNotifications.publish({
        auth: authClient,
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });
      console.log(`✅ Success: ${url} (Status: ${response.status})`);
    } catch (error: any) {
      console.error(`❌ Failed: ${url} - ${error.message}`);
    }
  }
}

pingGoogle().catch(console.error);
