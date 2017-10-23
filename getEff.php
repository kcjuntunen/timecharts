<?php
include('efficiencyFunctions.php');
$tz = 'UTC';
date_default_timezone_set($tz);
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$result = array();

for ($i = 1; $i < 15; $i++) {
    $start = get_first_cycle($mysqli, strtotime("now -$i days"));
    $end = get_last_cycle($mysqli, strtotime("now -$i days"));
    if ($start == NULL) {
        $start = strtotime("today 10:00 -$i day");
    }
    // if ($end == NULL) {
    //     $end = strtotime("today 18:30 -$i day");
    // }
    $seconds = get_total_seconds($start, $end, 4);
    $result[] = array(date('d', $start), get_all_time($mysqli, false, $start, $end) / $seconds);
}
echo json_encode(array_reverse($result));
$mysqli->close();
?>