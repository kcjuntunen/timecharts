<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);

function convert_date($time) {
    return date('Y-m-d\TH:i:s', $time);
}
function count_machines($conn) {
    $machine_count = 0;
    if (isset($_REQUEST['machine'])) {
        $machine_count = 1;
        return $machine_count;
    }

    $machine_list = $conn->query('SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES ORDER BY MACHNUM');
    while ($machine = $machine_list->fetch_assoc()) {
        $machine_count++;
    }
    $machine_list->free();
    return $machine_count;
}

function get_total_seconds($beg, $end, $machine_count) {
    $total_seconds = ($end - $beg) * $machine_count;
    $days = ceil($total_seconds / 60 / 60 / 24);
    // remove breaks
    // $total_seconds = $total_seconds - ($days * (30 + 15 + 15) * 60);
    // remove off hours
    if ($days > 1) {
        $total_seconds = $total_seconds - (($days - 1) * (16 * 60) * 60);
        $total_seconds = $total_seconds - (60 * 60 * ($days - 1));
    }
    return $total_seconds;
}

function get_total_time($beg, $end, $setup, $conn) {
    $total_time = 0;
    $starttime = convert_date($beg);
    $stoptime = convert_date($end);
    $machines = array();

    if (isset($_REQUEST['machine'])) {
        $machines[] = $conn->real_escape_string($_REQUEST['machine']);
    } else {
        $machine_list = $conn->query('SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES');
        while ($a = $machine_list->fetch_assoc()) {
            $machines[] = $a['MACHNUM'];
        }
        $machine_list->free();
    }

    foreach ($machines as &$machnum) {
        if ($setup) {
            $total_time += get_time($conn, $machnum, $setup, $starttime, $stoptime);
        } else {
            $total_time += get_time($conn, $machnum, $setup, $starttime, $stoptime) -
                         concurrent_cycles($conn, $machnum, $starttime, $stoptime);
        }
    }
    return $total_time;
}

function get_time($conn, $machnum, $setup, $starttime, $stoptime) {
    $stp = $setup ? "True" : "False";
    $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, STARTTIME, STOPTIME)) AS DIFF FROM CUT_CYCLE_TIMES "
         . "WHERE MACHNUM='$machnum' AND "
         . "SETUP=$stp AND STARTTIME > '$starttime' AND STOPTIME < '$stoptime'";
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

function concurrent_cycles($conn, $machnum, $starttime, $stoptime) {
    $res = 0;
    $setups = array();
    $sql = "SELECT STARTTIME, STOPTIME FROM CUT_CYCLE_TIMES "
         . "WHERE MACHNUM='$machnum' AND "
         . "SETUP=True AND STARTTIME > '$starttime' AND STOPTIME < '$stoptime'";
    $setups_res = $conn->query($sql);
    while ($s = $setups_res->fetch_assoc()) {
        $setups[] = $s;
    }
    $setups_res->free();
    foreach ($setups as &$setup) {
        $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, STARTTIME, STOPTIME)) AS DIFF FROM CUT_CYCLE_TIMES "
             . "WHERE MACHNUM=$machnum AND "
             . "SETUP=False AND STARTTIME > '{$setup['STARTTIME']}' AND STOPTIME < '{$setup['STOPTIME']}'";
        $cycle_seconds = $conn->query($sql);
        while ($a = $cycle_seconds->fetch_assoc()) {
            $res += $a['DIFF'];
        }
        $cycle_seconds->free();
    }
    return $res;
}

function get_selected_range($beg, $end, $conn) {
    $machine_count = count_machines($conn);
    $total_seconds = get_total_seconds($beg, $end, $machine_count);
    $total_setup_time = get_total_time($beg, $end, true, $conn);
    $total_cycle_time = get_total_time($beg, $end, false, $conn);
    return array( "total" => $total_seconds,
                  "setup" => $total_setup_time,
                  "cycle" => $total_cycle_time );
}

function get_last_week($conn) {
    $beg = strtotime('last week monday 06:00');
    $end = strtotime('last week friday 14:30');
    return get_selected_range($beg, $end, $conn);
}

if (isset($_REQUEST['start']) && isset($_REQUEST['end'])) {
    $beg = strtotime($_REQUEST['start']);
    $end = strtotime($_REQUEST['end']);
    echo json_encode(
        array(
            get_selected_range($beg, $end, $mysqli),
            get_last_week($mysqli)
        )
    );
    $mysqli->close();
}
?>