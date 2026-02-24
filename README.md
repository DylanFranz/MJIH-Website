# My Joy is Heavy - Photo Upload System

A web-based photo upload and cropping system for theatrical productions. Allows audience members to upload photos from their phones, crop them to 480×640, and automatically upload to Dropbox.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Dropbox:**
   - Copy `.env.example` to `.env`
   - Add your Dropbox access token
   - Set your Dropbox folder path

3. **Run the server:**
   ```bash
   npm start
   ```

4. **Access the app:**
   - Local: `http://localhost:3000`
   - Network: `http://[YOUR_IP]:3000`

## Full Setup Instructions

See [SETUP.md](SETUP.md) for complete installation and deployment instructions.

## Features

- Mobile-friendly interface
- Live image cropping with 480×640 aspect ratio locked
- Progress indicators during upload
- Automatic upload to Dropbox
- No user authentication required
- Runs locally on Mac Mini (no hosting costs)

## Tech Stack

- **Backend:** Node.js + Express
- **Image Processing:** Sharp
- **Cropping:** Cropper.js
- **Storage:** Dropbox API
- **Deployment:** Local Mac Mini server

## Project Structure

```
photo-upload-app/
├── server.js           # Express server with Dropbox integration
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
├── public/
│   ├── index.html      # Frontend UI
│   └── app.js          # Client-side JavaScript
├── SETUP.md            # Detailed setup guide
└── README.md           # This file
```

## License

MIT
