$payload = Get-Content -Raw -Path "test_payload.json"
Invoke-RestMethod -Uri "http://localhost:5000/api/resume/generate?format=pdf" -Method Post -Body $payload -ContentType "application/json" -OutFile "final_resume.pdf"
Write-Host "Resume generated: final_resume.pdf"
