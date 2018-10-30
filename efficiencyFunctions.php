<?php
function count_machines($conn) {
    $machine_count = 0;
    if (isset($_REQUEST['machine'])) {
        $machine_count = 1;
        return $machine_count;
    }
    $qry = "SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES";
    $machine_list = $conn->query($qry);
    if ($machine_list) {
        while ($machine = $machine_list->fetch_assoc()) {
            $machine_count++;
        }
        $machine_list->free();
    }
    return $machine_count;
}

function collect_machines($conn) {
    $machines = array();
    $qry = "SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES";
    $machine_list = $conn->query($qry);
    if ($machine_list) {
        while ($machine = $machine_list->fetch_assoc()) {
            $machines[] = $machine['MACHNUM'];
        }
        $machine_list->free();
    }
    return $machines;
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
        if ($cycle_seconds) {
            while ($a = $cycle_seconds->fetch_assoc()) {
                $res += $a['DIFF'];
            }
            $cycle_seconds->free();
        }
    }
    return $res;
}

function get_all_time($conn, $setup, $starttime, $stoptime) {
    $stp = $setup ? "True" : "False";
    $beg = convert_date($starttime);
    $end = convert_date($stoptime);
    $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, STARTTIME, STOPTIME)) AS DIFF FROM CUT_CYCLE_TIMES "
         . "WHERE SETUP=$stp AND STARTTIME > '$beg' AND STOPTIME < '$end'";
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

function get_all_time2($conn, $setup, $starttime, $stoptime) {
    $stp = $setup ? "True" : "False";
    $beg = convert_date($starttime);
}

function get_all_time3($conn, $dt) {
    $sql = "SELECT SUM(TOTAL_CYCLE_TIME) AS TOTAL FROM DAYREPORT "
         . "WHERE DT = '" . date('Y-m-d', $dt) . "';";
    $data = $conn->query($sql);
    $res = $data->fetch_assoc()['TOTAL'];
    $data->free();
    return $res;
}

function get_efficiency_time($conn, $dt) {
    $sql = "SELECT AVG(PERCENT_USAGE) AS TOTAL FROM DAYREPORT "
         . "WHERE DT = '" . date('Y-m-d', $dt) . "';";
    $data = $conn->query($sql);
    $res = $data->fetch_assoc()['TOTAL'];
    $data->free();
    return $res;
}

function get_machine_time($conn, $machnum, $setup, $start, $stop) {
    $stp = $setup ? "True" : "False";
    $starttime = convert_date($start);
    $stoptime = convert_date($stop);
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

function get_machine_time2($conn, $dt, $machnum) {
    $sql = "SELECT PERCENT_USAGE AS TOTAL FROM DAYREPORT "
         . "WHERE DT = '$dt' AND MACHNUM = '$machnum'";
    $data = $conn->query($sql);
    $res = 0;
    if (!$data) {
        return 0;
    }
    while ($a = $data->fetch_assoc()) {
        $res += $a['TOTAL'] ;
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

function get_total_seconds2($conn, $dt) {
    $sql = "SELECT SUM(DAY_LENGTH) AS TOTAL FROM DAYREPORT WHERE DT='" . date('Y-m-d', $dt). "';";
    $data = $conn->query($sql);
    $res = 0;
    while ($a = $data->fetch_assoc()) {
        $res = $a['TOTAL'];
    }
    $data->free();
    return $res;
}

function get_day_range($conn, $t) {
    return ['first' => get_first_cycle($conn, $t),
            'last' => get_last_cycle($conn, $t)];
}

function get_first_last_cycles($conn, $t) {
    $wt = date('Y-m-d', $t);
    $q = $conn->query("SELECT  "
                      . "(SELECT STARTTIME FROM CUT_CYCLE_TIMES WHERE STARTTIME > '$wt 00:00:00' AND "
                      . "STOPTIME < '$wt 23:59:59' ORDER BY ID ASC LIMIT 1) AS 'first', "
                      . "(SELECT STOPTIME FROM CUT_CYCLE_TIMES WHERE STARTTIME > '$wt 00:00:00' AND "
                      . "STOPTIME < '$wt 23:59:59' ORDER BY ID DESC LIMIT 1) AS 'last'");
    $res = $q->fetch_assoc();
    $out = ['first' => strtotime($res['first']),
            'last'  => strtotime($res['last'])];
    $q->free();
    return $out;
}

function get_first_cycle($conn, $t) {
    $wt = date('Y-m-d', $t);
    $q = $conn->query("SELECT STARTTIME FROM CUT_CYCLE_TIMES WHERE STARTTIME > '$wt 00:00:00' AND "
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
?>
