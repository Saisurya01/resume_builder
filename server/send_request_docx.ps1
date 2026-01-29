$payload = Get-Content -Raw -Path "test_payload.json"
Invoke-RestMethod -Uri "http://localhost:5000/api/resume/generate?format=docx" -Method Post -Body $payload -ContentType "application/json" -OutFile "final_resume.docx"
Write-Host "Resume generated: final_resume.docx"
