$apiToken = "tboH0WzyuQwbf59Iqs-WqLCeejVxeqhxfeIare9j"
$accountId = "a289eda8bf3a62a1fab11e999615ad55"
$databaseId = "ca2d92bc-8c59-48ec-9d72-1561e4627cdf"

# Step 1: Create table if it doesn't exist
$createTableSql = @"
CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  genre TEXT,
  cover TEXT,
  release_year INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"@

$body1 = @{
    sql = $createTableSql
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $apiToken"
    "Content-Type" = "application/json"
}

Write-Host "Creating table..."
$response1 = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/d1/database/$databaseId/query" `
    -Method POST `
    -Headers $headers `
    -Body $body1 `
    -ContentType "application/json"

Write-Host "Table creation response: $($response1.StatusCode)"

# Step 2: Insert sample movies
$insertSql = @"
INSERT INTO movies (title, genre, cover, release_year) VALUES
('Inception', 'Sci-Fi', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop', 2010),
('The Dark Knight', 'Action', 'https://images.unsplash.com/photo-1495632066640-f1d475d6b18f?w=500&h=750&fit=crop', 2008),
('Interstellar', 'Sci-Fi', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop', 2014),
('Pulp Fiction', 'Crime', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop', 1994),
('The Matrix', 'Sci-Fi', 'https://images.unsplash.com/photo-1516573024350-2ea5fec44e47?w=500&h=750&fit=crop', 1999),
('Forrest Gump', 'Drama', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop', 1994),
('The Shawshank Redemption', 'Drama', 'https://images.unsplash.com/photo-1489599849228-bed96c3ee647?w=500&h=750&fit=crop', 1994),
('The Godfather', 'Crime', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop', 1972),
('Avatar', 'Sci-Fi', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop', 2009),
('Titanic', 'Romance', 'https://images.unsplash.com/photo-1489599849228-bed96c3ee647?w=500&h=750&fit=crop', 1997);
"@

$body2 = @{
    sql = $insertSql
} | ConvertTo-Json

Write-Host "Inserting movies..."
$response2 = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/d1/database/$databaseId/query" `
    -Method POST `
    -Headers $headers `
    -Body $body2 `
    -ContentType "application/json"

Write-Host "Insert response: $($response2.StatusCode)"
$result = $response2.Content | ConvertFrom-Json
Write-Host ($result | ConvertTo-Json -Depth 10)

# Step 3: Verify
Write-Host "`nVerifying movies were added..."
$verifySql = "SELECT COUNT(*) as count FROM movies;"
$body3 = @{
    sql = $verifySql
} | ConvertTo-Json

$response3 = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/d1/database/$databaseId/query" `
    -Method POST `
    -Headers $headers `
    -Body $body3 `
    -ContentType "application/json"

Write-Host "Verify response: $($response3.StatusCode)"
$verifyResult = $response3.Content | ConvertFrom-Json
Write-Host ($verifyResult | ConvertTo-Json -Depth 10)
