<?php
include('efficiencyFunctions.php');
$tz = 'UTC';
date_default_timezone_set($tz);
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
$all = array();
$machines = collect_machines($mysqli);
$noofdays = 15;

if (!isset($_REQUEST["machine"])) {
	for ($i = 1; $i < $noofdays; $i++) {
		$r = get_first_last_cycles($mysqli, strtotime("now -$i days"));
		$start = $r['first'];
		$end = $r['last'];
		if ($start == NULL) {
			$start = strtotime("today 10:00 -$i day");
		}
		if ($end == NULL) {
			$end = strtotime("today 18:30 -$i day");
		}
		$date = date('Y-m-d', $start);
        $all[] = array(date('Y-m-d', $start), get_efficiency_time($mysqli, $start));
		$ranges[] = array('date' => $date,
						  'start' => $start,
						  'end' => $end);
	}

	$result = array('ranges' => $ranges,
					'machines' => $machines,
					'all' => array_reverse($all),
	);
} else {
	for ($i = 1; $i < $noofdays; $i++) {
		$r = get_first_last_cycles($mysqli, strtotime("now -$i days"));
		$start = $r['first'];
		$end = $r['last'];
		if ($start == NULL) {
			$start = strtotime("today 10:00 -$i day");
		}
		if ($end == NULL) {
			$end = strtotime("today 18:30 -$i day");
		}
		$date = date('Y-m-d', $start);
        $machnum = $_REQUEST['machine'];
		$all[] = array(date('Y-m-d', $start), get_machine_time2($mysqli, date('Y-m-d', $start),
                                                                $machnum));
	}

	$result = array( 'm' . $_REQUEST['machine'] => $all );
}

echo json_encode(array_reverse($result));
$mysqli->close();
?>
