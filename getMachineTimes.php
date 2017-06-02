<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);
$machine_list_data = $mysqli->query("SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES");
$beg = date('Y-m-d\TH:i:s', strtotime($_REQUEST["start"]));
$end = date('Y-m-d\TH:i:s', strtotime($_REQUEST["end"]));

$output = '{ "data": [';
if (isset($_REQUEST['machine'])) {
    $machnum = $mysqli->real_escape_string($_REQUEST['machine']);
    $s = "SELECT * FROM CUT_CYCLE_TIMES WHERE MACHNUM = '$machnum' AND STARTTIME > " .
       "'$beg' AND STOPTIME < '$end'";
    // "CONVERT_TZ('" . $beg . "', @@session.time_zone, '+00:00') AND STOPTIME < " .
    // "CONVERT_TZ('" . $end . "', @@session.time_zone, '+00:00')";
    $rawdata = $mysqli->query($s);
    while ($datum = $rawdata->fetch_assoc()) {
        $display_name = $datum['PROGRAM'];
        if ($datum['SETUP']) {
            $display_name .= " Setup";
        }
        $starttime = $datum['STARTTIME'];
        $stoptime = $datum['STOPTIME'];

        $output .= "[ \"{$datum['MACHNUM']}\", \"$display_name\", \"$starttime UTC\", \"$stoptime UTC\" ],";
    }
} else {
    while ($machnum = $machine_list_data->fetch_assoc()) {
        $mach = $machnum['MACHNUM'];
        $s = "SELECT * FROM CUT_CYCLE_TIMES WHERE MACHNUM = '$mach' AND STARTTIME > " .
           "'$beg' AND STOPTIME < '$end'";
        // "CONVERT_TZ('" . $beg . "', @@session.time_zone, '+00:00') AND STOPTIME < " .
        // "CONVERT_TZ('" . $end . "', @@session.time_zone, '+00:00')";
        $rawdata = $mysqli->query($s);
        while ($datum = $rawdata->fetch_assoc()) {
            $display_name = $datum['PROGRAM'];
            if ($datum['SETUP']) {
                $display_name .= " Setup";
            }
            $starttime = $datum['STARTTIME'];
            $stoptime = $datum['STOPTIME'];

            $output .= "[ \"{$datum['MACHNUM']}\", \"$display_name\", \"$starttime UTC\", \"$stoptime UTC\" ],";
        }
    }
}
$machine_list_data->free();
$rawdata->free();
$mysqli->close();
$output .= "]}";
$res = str_replace(',]', ']', $output);
echo $res;
?>
