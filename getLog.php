<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);

function returnRawLog($conn) {
    $output = array();
    $sql = "SELECT MACHINE, TS, EVENT FROM CUT_CYCLE_EVENTS ORDER BY ID DESC LIMIT 100";
    $res = $conn->query($sql);
    while ($a = $res->fetch_assoc()) {
        $output[] = $a;
    }
    return json_encode($output);
}

echo returnRawLog($mysqli);
?>
