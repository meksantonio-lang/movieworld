<?php
// Configuration for MovieWorld
$apiToken = 'ixRQAlmIfiOD0boqhizuXMuHXMojb9Y3XOaWPxV9';
$accountId = 'a289eda8bf3a62a1fab11e999615ad55';
$databaseId = 'ca2d92bc-8c59-48ec-9d72-1516e4627cdf'; // From your screenshot

$query = "SELECT * FROM movies LIMIT 10;";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://api.cloudflare.com/client/v4/accounts/$accountId/d1/database/$databaseId/query");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['sql' => $query]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiToken",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

// Check if the query was successful
if ($data['success']) {
    $movies = $data['result'][0]['results'];
    foreach ($movies as $movie) {
        echo "Movie: " . $movie['title'] . " (" . $movie['release_year'] . ")<br>";
    }
} else {
    echo "Error connecting to MovieWorld database.";
}
?>