<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);

function returnRawLog($start, $stop, $machine, $conn) {
    $output = array();
    $sql = "SELECT MACHINE, TS, EVENT FROM CUT_CYCLE_EVENTS ";
    if (($start != NULL) && ($stop != NULL)) {
        $sql .= "WHERE TS > '$start' AND TS < '$stop' ";
        if ($machine != NULL) {
            $sql .= "AND MACHINE = '$machine' ";
        }
    } else {
        // $sql .= "ORDER BY ID DESC LIMIT 50";
    }
    $sql .= "ORDER BY ID DESC ";
    $res = $conn->query($sql);
    while ($a = $res->fetch_assoc()) {
        $output[] = array(
            'MACHINE' => $a['MACHINE'],
            'TS' => str_replace('-', '/', $a['TS'] . " UTC"),
            'EVENT' => $a['EVENT']);
    }
    return json_encode($output);
}

if (isset($_REQUEST['start']) && isset($_REQUEST['end'])) {
    $beg = date('Y-m-d\TH:i:s', strtotime($_REQUEST['start']));
    $end = date('Y-m-d\TH:i:s', strtotime($_REQUEST['end']));
    if (isset($_REQUEST['machine'])) {
        $machine = $mysqli->real_escape_string($_REQUEST['machine']);
    } else {
        $machine = NULL;
    }
    echo returnRawLog($beg, $end, $machine, $mysqli);
} else {
    echo returnRawLog(NULL, NULL, NULL, $mysqli);
}
?>
