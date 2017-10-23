<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);
include('efficiencyFunctions.php');

function get_breaks($beg, $end) {
    $starttime = new Datetime(convert_date($beg));
    $stoptime = new Datetime(convert_date($end));
    $period = new DatePeriod($starttime, new DateInterval('PT1M'), $stoptime);
    $break_minutes = 0;
    foreach($period as $dt) {
        $hours = (int)$dt->format('H');
        $minutes = (int)$dt->format('i');
        # 15 minute breaks
        if (($hours == 12 || $hours == 14) && ($minutes >= 0 && $minutes <= 15))
            $break_minutes += 1;

        # Lunch
        if ($hours == 16 && ($minutes >= 0 && $minutes <= 30))
            $break_minutes += 1;

        # Off hours
        if ($hours == 18 && ($minutes >= 30 && $minutes <= 59))
            $break_minutes += 1;

        if (($hours >= 19 && $hours <= 23) || ($hours >= 0 && $hours <= 10))
            $break_minutes += 1;
    }
    return $break_minutes * 60;
}

function count_machines($beg, $end, $conn) {
    $machine_count = 0;
    if (isset($_REQUEST['machine'])) {
        $machine_count = 1;
        return $machine_count;
    }
    $start = convert_date($beg);
    $stop = convert_date($end);
    $qry = "SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES"; // WHERE STARTTIME > '$start' AND STOPTIME < '$stop' ORDER BY MACHNUM";
    $machine_list = $conn->query($qry);
    if ($machine_list) {
        while ($machine = $machine_list->fetch_assoc()) {
            $machine_count++;
        }
        $machine_list->free();
    }
    return $machine_count;
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
            $total_time += get_machine_time($conn, $machnum, $setup, $starttime, $stoptime) -
                         concurrent_cycles($conn, $machnum, $starttime, $stoptime);
        } else {
            $total_time += get_machine_time($conn, $machnum, $setup, $starttime, $stoptime);
        }
    }
    return $total_time;
}

// function get_time($conn, $machnum, $setup, $starttime, $stoptime) {
//     $stp = $setup ? "True" : "False";
//     $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, STARTTIME, STOPTIME)) AS DIFF FROM CUT_CYCLE_TIMES "
//          . "WHERE MACHNUM='$machnum' AND "
//          . "SETUP=$stp AND STARTTIME > '$starttime' AND STOPTIME < '$stoptime'";
//     $data = $conn->query($sql);
//     $res = 0;
//     if (!$data) {
//         return 0;
//     }
//     while ($a = $data->fetch_assoc()) {
//         $res += $a['DIFF'];
//     }
//     $data->free();
//     return $res;
// }

function get_ranges() {
    
}

function get_selected_range($beg, $end, $conn) {
    $machine_count = count_machines($beg, $end, $conn);
    $total_seconds = get_total_seconds($beg, $end, $machine_count);
    $total_setup_time = get_total_time($beg, $end, true, $conn);
    $total_cycle_time = get_total_time($beg, $end, false, $conn);
    return array( "total" => $total_seconds,
                  "setup" => $total_setup_time,
                  "cycle" => $total_cycle_time );
}

function get_last_week($conn) {
    $days = array(strtotime('last week monday 12:00 GMT'),
                  strtotime('last week tuesday 12:00 GMT'),
                  strtotime('last week wednesday 12:00 GMT'),
                  strtotime('last week thursday 12:00 GMT'),
                  strtotime('last week friday 12:00 GMT'));
    $total = 0;
    $setup = 0;
    $cycle = 0;

    foreach($days as $day) {
        $begend = ['first' => get_first_cycle($conn, $day),
                   'last' => get_last_cycle($conn, $day)];
        $total += get_total_seconds($begend['first'], $begend['last'], 4);
        $setup += get_all_time($conn, true, $begend['first'], $begend['last']);
        $cycle += get_all_time($conn, false, $begend['first'], $begend['last']);
    }
    return array( 'total' => $total,
                  'setup' => $setup,
                  'cycle' => $cycle);
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