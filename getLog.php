<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);

function returnRawLog($conn) {
    $json = '';
    $output = array();
    $sql = "SELECT MACHINE, TS, EVENT FROM CUT_CYCLE_EVENTS ORDER BY ID DESC LIMIT 100";
    $res = $conn->query($sql);
    while ($a = $res->fetch_assoc()) {
        $output[] = $a;
    }
    //echo var_dump($output[0]);
    $json .= "[ ";
    for ($i = 0; $i < count($output); $i++) {
        $event = $output[$i]['EVENT'];
        $event = str_replace('"', '', $event);
        $json .= "{ \"timestamp\": \"{$output[$i]['TS']}\", \"machine\": \"{$output[$i]['MACHINE']}\", \"event\": \"$event\" },";
    }

    $json .= " ]";
    $output = str_replace(', ]', ' ]', $json);
    return $output;
}


echo returnRawLog($mysqli);
?>