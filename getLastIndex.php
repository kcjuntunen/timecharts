<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);
$max_id = $mysqli->query("SELECT MAX(ID) AS MAX_ID FROM CUT_CYCLE_TIMES");
$result = $max_id->fetch_assoc();
$max_id->free();
$mysqli->close();
echo json_encode($result);
?>