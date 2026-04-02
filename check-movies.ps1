$apiToken = "tboH0WzyuQwbf59Iqs-WqLCeejVxeqhxfeIare9j"
$accountId = "a289eda8bf3a62a1fab11e999615ad55"
$databaseId = "ca2d92bc-8c59-48ec-9d72-1561e4627cdf"

$sql = "SELECT COUNT(*) as count FROM movies;"

$body = @{
    sql = $sql
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $apiToken"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/d1/database/$databaseId/query" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"

Write-Host "Response Status: $($response.StatusCode)"
Write-Host "Movie Count:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
