const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PAYLOADS_DIR = path.join(__dirname, '../sample_payloads'); // Adjust if you saved them elsewhere
const WEBHOOK_URL = 'http://localhost:5000/api/webhook'; // Your local server's webhook URL

const processFiles = async () => {
    try {
        const files = fs.readdirSync(PAYLOADS_DIR);
        console.log(`Found ${files.length} payload files to process.`);

        for (const file of files) {
            if (path.extname(file) === '.json') {
                const filePath = path.join(PAYLOADS_DIR, file);
                const payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                try {
                    console.log(`Sending payload from ${file}...`);
                    await axios.post(WEBHOOK_URL, payload);
                    console.log(`-> Successfully sent ${file}.`);
                } catch (error) {
                    console.error(`-> Failed to send ${file}:`, error.response ? error.response.data : error.message);
                }
                // Add a small delay to simulate real-world timing
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        console.log('All payloads processed.');
    } catch (error) {
        console.error('Error reading payload directory:', error.message);
    }
};

processFiles();