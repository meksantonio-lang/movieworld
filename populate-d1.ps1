$apiToken = 'tboH0WzyuQwbf59Iqs-WqLCeejVxeqhxfeIare9j'
$accountId = 'a289eda8bf3a62a1fab11e999615ad55'
$databaseId = 'ca2d92bc-8c59-48ec-9d72-1561e4627cdf'
$headers = @{'Authorization' = 'Bearer ' + $apiToken; 'Content-Type' = 'application/json'}
$baseUrl = 'https://api.cloudflare.com/client/v4/accounts/' + $accountId + '/d1/database/' + $databaseId + '/query'
Write-Host 'Creating table...'
$sql1 = 'CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, genre TEXT, cover TEXT, release_year INTEGER)'
Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body (ConvertTo-Json @{sql=$sql1})
Write-Host 'Inserting movies...'
$sql2 = "INSERT INTO movies (title, genre, cover, release_year) VALUES ('Inception', 'Sci-Fi', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500', 2010), ('The Dark Knight', 'Action', 'https://images.unsplash.com/photo-1495632066640-f1d475d6b18f?w=500', 2008), ('Interstellar', 'Sci-Fi', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500', 2014), ('Pulp Fiction', 'Crime', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500', 1994), ('The Matrix', 'Sci-Fi', 'https://images.unsplash.com/photo-1516573024350-2ea5fec44e47?w=500', 1999)"
Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body (ConvertTo-Json @{sql=$sql2})
Write-Host 'Verifying...'
$sql3 = 'SELECT COUNT(*) as count FROM movies'
Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body (ConvertTo-Json @{sql=$sql3}) | ConvertTo-Json -Depth 5
Write-Host 'Done!'
