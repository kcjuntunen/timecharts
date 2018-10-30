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
		// $seconds = get_total_seconds($start, $end, count($machines));
		// $all[] = array(date('Y-m-d', $start), get_all_time($mysqli, false, $start, $end) / $seconds);
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
		// $ranges[] = array('date' => $date,
		//					 'start' => $start,
		//					 'end' => $end);
		// $all[] = array(date('Y-m-d', $start), get_machine_time($mysqli, $_REQUEST['machine'],
		// 													   false,
		// 													   $start,
		// 													   $end) / get_total_seconds($start, $end, 1));
        $machnum = $_REQUEST['machine'];
		$all[] = array(date('Y-m-d', $start), get_machine_time2($mysqli, date('Y-m-d', $start),
                                                                $machnum));
	}

	$result = array( 'm' . $_REQUEST['machine'] => $all );

	// foreach ($machines as $machine) {
	//	   $m = array();
	//	   for ($i = count($result['ranges']) - 1; $i > 0; $i--) {
	//		   $start = $result['ranges'][$i]['start'];
	//		   $end = $result['ranges'][$i]['end'];
	//		   $mt = get_machine_time($mysqli, $machine, false,
	//								  $start,
	//								  $end);
	//		   $seconds = get_total_seconds($start, $end, 1);
	//		   $out = array(date('Y-m-d', $start), $mt / $seconds);
	//		   $m[] = $out;
	//	   }
	//	   $result["m" . $machine] = $m;
	// }
}

echo json_encode(array_reverse($result));
$mysqli->close();
?>
