# Manual Testing Instructions for Resume Analysis

## Prerequisites
✅ Backend server running on port 5000 (already started)
✅ Frontend dev server running on port 5173 (already running)

## Test Steps

### 1. Open Browser
Navigate to: `http://localhost:5173`

### 2. Navigate to Optimize Resume
- Look for "Optimize Resume" or "Optimize" link in the navigation
- Click on it

### 3. Upload Test Resume
- Click "Choose File" or "Upload Current Resume"
- Select the test file: `d:\vibe_coding\resume_builder\server\verify_test.pdf`
- Or use any PDF/DOCX resume you have

### 4. Enter Job Description
Paste this sample job description:
```
We are seeking a Full Stack Developer with experience in React, Node.js, MongoDB, and Express.
Strong knowledge of JavaScript, TypeScript, REST APIs, and cloud deployment required.
Experience with Docker, Kubernetes, AWS, and CI/CD pipelines is a plus.
Must have excellent problem-solving skills and ability to work in agile teams.
```

### 5. Click "Analyze & Optimize"
- Click the green "Analyze & Optimize" button
- Watch for loading spinner

## Expected Results ✅

### Browser Console (F12 → Console tab)
You should see:
```
📤 Uploading resume for text extraction...
✅ Resume uploaded successfully
🎯 Analyzing resume against job description...
✅ Analysis complete
```

### Backend Console (Terminal running npm start)
You should see:
```
📤 [UPLOAD] Resume upload request received
📄 [UPLOAD] Processing file: verify_test.pdf
📊 [UPLOAD] MIME type: application/pdf, Size: X.XX KB
🔍 [UPLOAD] Parsing PDF...
✅ [UPLOAD] PDF parsed successfully, extracted XXXX characters
✅ [UPLOAD] Successfully extracted XXXX characters
🎯 [OPTIMIZE] Resume optimization request received
📝 [OPTIMIZE] Resume length: XXXX chars
📋 [OPTIMIZE] JD length: XXX chars
✅ [OPTIMIZE] Analysis complete. Found X missing keywords
```

### UI Display
You should see:
- ✅ "Optimization Report" card appears (green border)
- ✅ "Suggestions:" section with missing keywords
- ✅ "Missing Keywords:" list with items in red
- ✅ "Go to Resume Builder" button at bottom
- ❌ NO generic error alert popup

## Failure Indicators ❌

If you see any of these, something is wrong:
- ❌ Alert popup: "Error analyzing resume. Please check your connection and try again."
- ❌ Alert popup: "Cannot connect to server..."
- ❌ Console error: "CORS policy" or "blocked by CORS"
- ❌ Console error: Network request to render.com instead of localhost
- ❌ Backend shows no logs (means request didn't reach backend)
- ❌ 404 or 500 error in Network tab

## Network Tab Verification (F12 → Network tab)

### Request 1: Upload
- URL: `http://localhost:5000/api/resume/upload`
- Method: POST
- Status: 200 OK
- Request Headers: `Content-Type: multipart/form-data`
- Response: `{"text": "..."}`

### Request 2: Optimize
- URL: `http://localhost:5000/api/resume/optimize`
- Method: POST
- Status: 200 OK
- Request Headers: `Content-Type: application/json`
- Response: `{"suggestions": "...", "missingKeywords": [...]}`

## Troubleshooting

### If you get "Cannot connect to server"
1. Check backend is running: `netstat -ano | findstr :5000`
2. Restart backend: `cd d:\vibe_coding\resume_builder\server && npm start`

### If you get CORS error
1. Check backend console shows CORS config includes `http://localhost:5173`
2. Restart backend server

### If frontend still points to production
1. Check `.env` file: `Get-Content d:\vibe_coding\resume_builder\client\.env`
2. Should show: `VITE_API_URL=http://localhost:5000`
3. Restart frontend dev server (Ctrl+C and `npm run dev`)

## Success Criteria

All of these must be true:
- [x] Backend server running on port 5000
- [x] Frontend running on port 5173
- [x] Frontend `.env` points to localhost:5000
- [ ] Resume upload succeeds (200 OK)
- [ ] Analysis completes successfully (200 OK)
- [ ] Results display in UI
- [ ] No error alerts appear
- [ ] Backend logs show emoji-formatted messages
- [ ] Works without MongoDB connection
