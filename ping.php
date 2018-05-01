<?php
$config = parse_ini_file('/etc/cycles.conf');
$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);

function ping($host) {
    // $time = shell_exec('ping -q -c1 -W 1' . $host .' | grep "rtt min" | sed s/"^[[:print:]]* = \([0-9]*\)ms$"/\\\1/g | awk -F\'/\' \'{print $6}\'');
    $cmd = "fping -q -c1 -t300 $host 2>&1 | awk -F \"/\" '{print $9}'";
    $time = str_replace("\n", "", shell_exec($cmd));
    if (strlen($time) < 1) {
        return 0;
    } else {
        return $time;
    }
}

if (isset($_REQUEST['machine'])) {
    $res = array();
    $machine = $_REQUEST['machine'];
    $qres = $mysqli->query("SELECT * FROM MACHINE_IPS WHERE MACHNUM = \"$machine\"");
    $ip = $qres->fetch_assoc()['IP'];
    $res[$machine] = str_replace("\n", "", ping($ip));
    echo(json_encode($res));
} else {
    $res = array();
    $qres = $mysqli->query("SELECT * FROM MACHINE_IPS");
    $machines = array_keys($ips);
    while ($item = $qres->fetch_assoc()) {
        $res[$item['MACHNUM']] = str_replace("\n", "", ping($item['IP']));
    }
    echo(json_encode($res));
}
?>
