# My Joy is Heavy - Photo Upload Setup Guide

This guide will help you set up the photo upload system on your Mac Mini.

## Prerequisites

1. Mac Mini with macOS
2. Node.js installed (version 16 or higher)
3. Dropbox account

---

## Step 1: Install Node.js (if not already installed)

1. Open Terminal on your Mac Mini
2. Check if Node.js is installed:
   ```bash
   node --version
   ```
3. If not installed, download and install from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Run the installer and follow the prompts

---

## Step 2: Get Dropbox Access Token

1. Go to https://www.dropbox.com/developers/apps
2. Click "Create app"
3. Choose:
   - **API**: Scoped access
   - **Access type**: Full Dropbox
   - **App name**: "My Joy is Heavy Photos" (or any unique name)
4. Click "Create app"
5. On the app settings page:
   - Scroll to "Permissions" tab
   - Enable: `files.content.write` and `files.content.read`
   - Click "Submit"
6. Go back to "Settings" tab
7. Under "OAuth 2", find "Generated access token"
8. Click "Generate" button
9. **COPY THIS TOKEN** - you'll need it in the next step
10. Create the folder `/My Joy is Heavy Photos` in your Dropbox (or choose a different path)

---

## Step 3: Set Up the Server

1. Copy the `photo-upload-app` folder to your Mac Mini
2. Open Terminal and navigate to the folder:
   ```bash
   cd /path/to/photo-upload-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file:
   ```bash
   nano .env
   ```
   
   Replace with your values:
   ```
   DROPBOX_ACCESS_TOKEN=your_actual_token_from_step_2
   DROPBOX_FOLDER=/My Joy is Heavy Photos
   PORT=3000
   PERFORMANCES=[{"id": "2025-03-15-7pm", "display": "March 15, 2025 - 7:00 PM"}, {"id": "2025-03-16-2pm", "display": "March 16, 2025 - 2:00 PM"}, {"id": "2025-03-16-7pm", "display": "March 16, 2025 - 7:00 PM"}]
   ```
   
   **Performance Configuration:**
   - Each performance needs an `id` (used as the Dropbox subfolder name) and `display` (shown to users)
   - The `id` should be URL-friendly (no spaces, use dashes)
   - Format: `[{"id": "folder-name", "display": "User-Friendly Name"}, ...]`
   - Example IDs: `2025-03-15-matinee`, `opening-night`, `march-20-evening`
   - Photos will be saved to: `/My Joy is Heavy Photos/{id}/photo_xxxxx.jpg`
   
   Press `Ctrl+X`, then `Y`, then `Enter` to save

---

## Step 4: Test the Server

1. Start the server:
   ```bash
   npm start
   ```

2. You should see:
   ```
   Server running on port 3000
   Access the app at http://localhost:3000
   ```

3. Open a web browser and go to: `http://localhost:3000`
4. Try uploading and cropping a test photo
5. Check your Dropbox folder to verify the upload worked

---

## Step 5: Find Your Mac Mini's IP Address

1. While still in Terminal, run:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Look for an IP address like `192.168.1.X` or `10.0.0.X`
3. This is your local IP address

---

## Step 6: Test from a Phone

1. Make sure your phone is on the SAME WiFi network as the Mac Mini
2. Open your phone's browser
3. Go to: `http://[YOUR_MAC_IP]:3000`
   - Example: `http://192.168.1.150:3000`
4. Test uploading a photo

---

## Step 7: Keep the Server Running (Production)

Install PM2 to keep the server running even after you close Terminal:

1. Install PM2:
   ```bash
   npm install -g pm2
   ```

2. Start the server with PM2:
   ```bash
   pm2 start server.js --name "photo-upload"
   ```

3. Save the PM2 process list:
   ```bash
   pm2 save
   ```

4. Set PM2 to start on Mac Mini boot:
   ```bash
   pm2 startup
   ```
   - Follow the command it gives you (copy/paste and run it)

5. Useful PM2 commands:
   ```bash
   pm2 status          # Check if server is running
   pm2 logs            # View server logs
   pm2 restart photo-upload   # Restart the server
   pm2 stop photo-upload      # Stop the server
   ```

---

## Step 8: During the Show

1. Make sure the Mac Mini is on and connected to the venue WiFi
2. Check that PM2 is running:
   ```bash
   pm2 status
   ```

3. Find your IP address again (it may change):
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

4. Share the URL with the audience:
   - You can print QR codes pointing to `http://[YOUR_IP]:3000`
   - Or project the URL on stage
   - Or add it to the program

---

## Troubleshooting

### "Cannot connect" from phones
- Check that the Mac Mini and phones are on the same WiFi network
- Check that the server is running: `pm2 status`
- Check the firewall isn't blocking port 3000

### "Dropbox upload failed"
- Verify your access token is correct in `.env`
- Check that the Dropbox folder exists
- Check the server logs: `pm2 logs`

### Photos not appearing in Dropbox
- Check the folder path in `.env` matches your Dropbox folder
- Verify the access token has write permissions
- Photos are organized in subfolders by performance (e.g., `/My Joy is Heavy Photos/2025-03-15-7pm/`)
- Check the specific performance subfolder, not just the main folder

### Performance dropdown is empty
- Check that `PERFORMANCES` is properly formatted in `.env`
- Must be valid JSON format: `[{"id": "...", "display": "..."}, ...]`
- Check server logs for JSON parsing errors: `pm2 logs`

### Server stopped running
- Restart with: `pm2 restart photo-upload`
- Check logs: `pm2 logs`

---

## File Size Considerations

- Each cropped photo will be around 50-200KB (JPEG compressed)
- With 100 audience members, expect around 10-20MB total
- Monitor your Dropbox space if you expect many submissions

---

## Need Help?

Check the logs for error messages:
```bash
pm2 logs photo-upload
```

Or restart the server:
```bash
pm2 restart photo-upload
```
