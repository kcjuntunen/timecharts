<?php
$tz = 'UTC';
date_default_timezone_set($tz);
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$result = array();

function get_time($conn, $setup, $starttime, $stoptime) {
    $stp = $setup ? "True" : "False";
    $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, STARTTIME, STOPTIME)) AS DIFF FROM CUT_CYCLE_TIMES "
         . "WHERE SETUP=$stp AND STARTTIME > '$starttime' AND STOPTIME < '$stoptime'";
    $data = $conn->query($sql);
    $res = 0;
    if (!$data) {
        return 0;
    }
    while ($a = $data->fetch_assoc()) {
        $res += $a['DIFF'];
    }
    $data->free();
    return $res;
}

function convert_date($time) {
    return date('Y-m-d\TH:i:s', $time);
}
function get_total_seconds($beg, $end, $machine_count) {
    $raw_diff = ($end - $beg);
    $total_seconds = $raw_diff * $machine_count;
    if ($total_seconds < 1) {
        return 1;
    } else {
        return $total_seconds;
    }
}

function get_first_cycle($conn, $t) {
    $wt = date('Y-m-d', $t);
    $q = $conn->query("SELECT STARTTIME FROM CUT_CYCLE_TIMES WHERE STARTTIME > '$wt 12:00:00' AND "
                      . "STOPTIME < '$wt 23:59:59' ORDER BY ID ASC LIMIT 1");
    $res = $q->fetch_assoc();
    $q->free();
    return strtotime($res['STARTTIME']);
}

function get_last_cycle($conn, $t) {
    $wt = date('Y-m-d', $t);
    $q = $conn->query("SELECT STOPTIME FROM CUT_CYCLE_TIMES WHERE STARTTIME > '$wt 12:00:00' AND "
                      . "STOPTIME < '$wt 23:59:59' ORDER BY ID DESC LIMIT 1");
    $res = $q->fetch_assoc();
    $q->free();
    return strtotime($res['STOPTIME']);
}

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
    $result[] =  array(date('d', $start), get_time($mysqli, false, convert_date($start), convert_date($end)) / $seconds);
}
echo json_encode(array_reverse($result));
$mysqli->close();
?>