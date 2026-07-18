# AgriRelief AI 🌾🛡️
> **AI-Powered Crop Damage Assessment & Disaster Relief Platform**
> 
> AgriRelief AI is an advanced, AI-driven disaster reporting and claim management platform designed to help farmers quickly report crop damage due to natural disasters (floods, droughts, pest infestations) and enable government officials to verify, analyze (using Google Gemini AI), and process relief claims efficiently.

---

## 🌟 Key Features

### For Farmers 🧑‍🌾
- **Dashboard**: Track claim status in real-time, view notifications, and review historical claims.
- **Report Damage**: An intuitive, step-by-step reporting form:
  - **Geotagging**: Automatic GPS coordinate capturing.
  - **Interactive Map**: Built-in Leaflet Map to preview the farm location.
  - **Weather Integration**: Automatically logs local weather conditions (temperature, humidity, wind speed) at the time of reporting.
  - **Image Upload**: Upload high-resolution images of damaged crops.
- **AI Pre-Assessment**: Get instant pre-analysis results on crop health and estimated damage severity before final submission.

### For Government Officials 🏛️
- **Admin Dashboard**: View analytics on total claims, approved cases, pending inspections, and total compensation disbursed.
- **Claim Management Table**: Filter claims by district, crop type, disaster category, or status.
- **Interactive Geo-Evidence Card**: View the exact location of the damage on a Leaflet map, cross-referenced with weather patterns at the time of claim.
- **Gemini AI Copilot**: 
  - **Automatic Image Recognition**: Detects crop types and assesses damage percentages.
  - **Disaster Verification**: Cross-references reported disaster types with visual evidence.
  - **Fraud Detection**: Flags potential inconsistencies (e.g., mismatch between claim description and photo evidence).
- **Decision Panel**: Instantly Approve, Reject, or Request Physical Inspection with custom remarks.

---

## 🛠️ Tech Stack

### Frontend 💻
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router Dom v7
- **Mapping**: Leaflet & React Leaflet
- **HTTP Client**: Axios
- **Icons**: React Icons

### Backend ⚙️
- **Runtime**: Node.js & Express
- **AI Model**: Google Gemini API (`gemini-2.5-flash` via `@google/generative-ai`)
- **File Uploads**: Multer (in-memory storage)

---

## 📂 Project Structure

```
AgriRelief-AI/
├── client/                     # React Frontend App
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Inputs, Buttons, Selects, Cards
│   │   │   ├── farmer/         # Geolocation and Farm Info components
│   │   │   └── government/     # AI Analysis, Claim Tables, Filters, Stats
│   │   ├── context/            # Auth and Analysis context providers
│   │   ├── pages/              # Farmer/Gov Dashboards, Login, Registration
│   │   ├── services/           # Axios API connectors
│   │   └── utils/              # Client validations & helpers
│   └── package.json
│
├── server/                     # Express Backend Server
│   ├── config/                 # Gemini API setup & configuration
│   ├── controllers/            # Request handlers (e.g. analysis controller)
│   ├── middlewares/            # Custom error handlers and validations
│   ├── routes/                 # REST API endpoints
│   ├── services/               # Gemini Vision integration & Prompt builders
│   ├── validators/             # Image & schema validation logic
│   └── package.json
│
└── docs/                       # Project documentation and templates
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- A Gemini API Key from Google AI Studio.

### 1. Clone & Navigate
```bash
git clone https://github.com/krishnaprasadpalle/AgriRelief-AI.git
cd AgriRelief-AI
```

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your credentials:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the backend server:
   ```bash
   # Development mode with hot-reloading
   npm run dev
   
   # Production mode
   npm start
   ```
   The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the client folder in a new terminal:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client will run on `http://localhost:5173`. Open this URL in your browser to view the application!

---

## 🤖 Gemini AI Integration Details
AgriRelief AI uses Gemini's multimodal vision features to evaluate crop photos. The backend sends the image buffer along with a structured prompt instructing the model to return a structured JSON response containing:
- **`cropType`**: Recognized crop.
- **`estimatedDamage`**: Percentage of crop destroyed (0-100%).
- **`disasterType`**: Matches with the visual symptoms of flood, drought, pests, hail, etc.
- **`severityLevel`**: Low, Medium, High, or Critical.
- **`fraudAlert`**: Flags any irregularities in the uploaded photo (e.g., stock photos, unrelated objects, or mismatched reports).
## Demo Credentials

| Role    | Route               | ID / Username     | Password      |
| ------- | ------------------- | ----------------- | ------------- |
| Farmer  | `/farmer/login`     | register first    | —             |
| Officer | `/government/login` | `AGR-TG-HYD-0001` | `password123` |
| Officer | `/government/login` | `AGR-AP-GNT-0005` | `password123` |
| Admin   | `/admin/login`      | `admin`           | `admin@2026`  |
