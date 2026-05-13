const { google } = require('google-auth-library');
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

  const keyPath = path.join(process.cwd(), 'service-account.json');
  
  if (!fs.existsSync(keyPath)) {
    console.warn('⚠️ Warning: service-account.json not found in root.');
    console.log('To use the Indexing API, please follow these steps:');
    console.log('1. Go to Google Cloud Console.');
    console.log('2. Enable "Indexing API".');
    console.log('3. Create a Service Account, download the JSON key, and name it "service-account.json".');
    console.log('4. Add the service account email as an "Owner" in Google Search Console.');
    process.exit(1);
  }

  const client = await google.auth.getClient({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  console.log(`🚀 Notifying Google about ${urls.length} URL(s)...`);

  for (const url of urls) {
    try {
      const response = await google.indexing('v3').urlNotifications.publish({
        auth: client,
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
