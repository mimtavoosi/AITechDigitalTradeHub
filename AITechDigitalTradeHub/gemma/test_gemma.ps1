$ErrorActionPreference = "Stop"

$body = @{
    model = "gemma4"
    messages = @(
        @{
            role = "user"
            content = "Introduce yourself briefly in Persian."
        }
    )
    temperature = 0.7
    max_tokens = 256
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod `
    -Uri "http://127.0.0.1:8000/v1/chat/completions" `
    -Method Post `
    -ContentType "application/json; charset=utf-8" `
    -Body ([Text.Encoding]::UTF8.GetBytes($body))

$response.choices[0].message.content
