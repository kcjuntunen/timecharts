<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$tz = 'UTC';
date_default_timezone_set($tz);
lastWeekStart = strtotime();
lastWeekEnd = strtotime();
total_cycleSQL = "SELECT SUM(STOPTIME-STARTTIME)/60 FROM CUT_CYCLE_TIMES WHERE STARTTIME > '2017-05-25 10:00' AND STOPTIME < '2017-05-25 18:30' AND NOT SETUP=True;";
total_setupSQL = "SELECT SUM(STOPTIME-STARTTIME)/60 FROM CUT_CYCLE_TIMES WHERE STARTTIME > '2017-05-25 10:00' AND STOPTIME < '2017-05-25 18:30' AND SETUP=True;";


?>