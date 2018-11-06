<?php
function get_percents($months) {
    $tz = 'UTC';
    date_default_timezone_set($tz);
    $config = parse_ini_file('/etc/cycles.conf');
    $mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
    $sql = "SELECT DT, MACHNUM, DAY_LENGTH, TOTAL_CYCLE_TIME/60/60 AS TOTAL_CYCLE_TIME FROM DAYREPORT WHERE DT >= NOW()-INTERVAL $months MONTH ORDER BY DT ASC";

    $res = array();
    $data = $mysqli->query($sql);
    while($row = $data->fetch_object()) {
        array_push($res, $row);
    }
    echo json_encode($res);
		$data->free();
		$mysqli->close();
}

function get_machines() {
    $tz = 'UTC';
    $config = parse_ini_file('/etc/cycles.conf');
    $mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
		if ($mysqli->connect_errno) {
				echo "{$mysqli->connect_errno}: {$mysqli->connect_error}";
		}
		$data = $mysqli->query("SELECT DISTINCT MACHNUM FROM DAYREPORT WHERE MACHNUM ORDER BY MACHNUM;");
    $res = array();
		while ($row = $data->fetch_assoc()) {
        $res[] = $row['MACHNUM'];
		}
    echo json_encode($res);
		$data->free();
		$mysqli->close();
}
?>
<!doctype html>
<html lang="en">
		<head>
				<title>Amstore Machine Cycle Time</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
				<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
				<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-backstretch/2.0.4/jquery.backstretch.min.js"></script>
				<script type="text/javascript" src="./bootstrap/js/bootstrap.min.js"></script>
				<script type="text/javascript" src="./js/moment-with-locales.min.js"></script>
				<script src="//cdn.rawgit.com/Eonasdan/bootstrap-datetimepicker/e8bddc60e73c1ec2475f827be36e1957af72e2ea/src/js/bootstrap-datetimepicker.js"></script>
				<script type="text/javascript" src="./js/efficiency.js"></script>
				<link href="./bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen">
				<link href="./bootstrap/css/bootstrap-theme.css" rel="stylesheet" media="screen">
				<link rel="icon" type="image/png" href="./favicon.png" />
				<style>
				 body, fieldset {
						 background: url(./img/cork-wallet.png) repeat 0 0;
				 }
				 .datepicker, .table-condensed {
						 cursor: pointer;
				 }
				 #timeMenu {
						 padding: 7px;
						 border-radius: 3px;
						 border-width: thin;
						 border-style: solid;
				 }
				 #timeMenu:hover {
						 background-color: lightgrey;
						 text-decoration: none;
				 }
				 fieldset {
						 padding: 10px;
				 }
				 chart {
						 opacity: 0.8;
						 width: 800px;
						 height: auto;
						 max-height: 2000px;
				 }
				 timeline {
						 opacity: 0.8;
						 height: auto;
				 }
				 .chart {
						 width: 800px;
						 height: auto;
						 margin: 0 auto;
						 padding: 20px;
						 position: relative;
						 opacity: 0.8;
				 }
				 .comment {
						 font-style: italic;
						 text-align: right;
						 style: italic;
						 opacity: 0.5;
				 }
				</style>
    </head>
    <body>
				<header>
						<nav role="navigation" class="navbar navbar-default">
								<!-- Brand and toggle get grouped for better mobile display -->
								<div class="navbar-header">
										<button type="button" data-target="#navbarCollapse" data-toggle="collapse" class="navbar-toggle">
												<span class="sr-only">Toggle navigation</span>
												<span class="icon-bar"></span>
												<span class="icon-bar"></span>
												<span class="icon-bar"></span>
										</button>
										<a href="#" class="navbar-brand">Machines</a>
								</div>
								<!-- Collection of nav links and other content for toggling -->
								<div id="navbarCollapse" class="collapse navbar-collapse">
										<ul class="nav navbar-nav">
												<li id="LinkHome" class="inactive"><a href="/machine">Back</a></li>
										</ul>

										<ul class="nav navbar-nav">
												<li><a href="?months=1">1 month</a></li>
												<li><a href="?months=3">3 months</a></li>
												<li><a href="?months=6">6 months</a></li>
												<li><a href="?months=12">12 months</a></li>
										</ul>
										<ul class="nav navbar-nav nav-right">
										</ul>
								</div>
						</nav>
				</header>
				<div class="col-xs-12 col-sm-12 col-md-12 col-md-12">
						<div id="piepanel" class="panel panel-default">
                <?php
                $months = '3';
                if (isset($_REQUEST['months']) && preg_match('/^\d+$/', $_REQUEST['months'])) {
                    if (intval($_REQUEST['months']) > 0) {
                        $months = $_REQUEST['months'];
                    }
                }
                $timeword = intval($months) > 1 ? "months" : "month";
				        echo("<div class='panel-heading'>Usage over time <span class='comment'>($months $timeword)</span></div>");
                ?>
								<div class="panel-body"> <!-- style="height: 252px;"> -->
										<div id="piecontainer" class="col-xs-24 xol-sm24 col-md-12">
                        <div id="chart_div" style="width: auto; height: 1000px"></div>
										</div>

								</div>
						</div>
				</div>

        <script type="text/javascript">

         function getRandomColor() {
             var letters = '0123456789ABCDEF';
             var color = '#';
             for (var i = 0; i < 6; i++) {
                 color += letters[Math.floor(Math.random() * 16)];
             }
             return color;
         }

         google.charts.load('current', {packages: ['corechart', 'line']});
         google.charts.setOnLoadCallback(drawLogScales);

         function drawLogScales() {
						 $.backstretch("./img/stolen-bg.jpg");
             var machines = JSON.parse('<?php get_machines(); ?>');
             var data = new google.visualization.DataTable();
             data.addColumn('date', 'X');
             data.addColumn('number', 'Day Length (hrs)');
             for (var i = 0; i < machines.length; i++) {
                 data.addColumn('number', machines[i]);
             }
             var jsn = JSON.parse('<?php get_percents($months); ?>');
             var dt = new Date(jsn[0]['DT']);
             var row_array = Array.apply(0, Array(machines.length + 2)).map(function() {return 0;});
             row_array[0] = dt;
             var days = 0;
             for (var i = 0; i < jsn.length; i++) {
                 var new_date = false;
                 if ("" + new Date(jsn[i]['DT']) !== "" + dt) {
                     dt = new Date(jsn[i]['DT']);
                     new_date = true;
                     row_array[0] = dt;
                     days++;
                 }
                 row_array[1] = jsn[i]['DAY_LENGTH'] / 60 / 60;
                 if (!new_date) {
                     row_array[0] = dt;
                     if(machines.indexOf(jsn[i]['MACHNUM']) > -1) {
                         row_array[machines.indexOf(jsn[i]['MACHNUM']) + 2] = parseFloat(jsn[i]['TOTAL_CYCLE_TIME']);
                     }
                 } else {
                     new_date = false;
                     data.addRow(row_array);
                     row_array = Array.apply(0, Array(machines.length + 2)).map(function() {return 0;})
                 }
             }

             var options = {
                 hAxis: {
                     title: 'Time',
                     logScale: false
                 },
                 vAxis: {
                     title: 'Usage (total hours of cycling)',
                     logScale: true
                 },
                 pointSize: 5,
                 series: {
                     0: { pointShape: 'circle' },
                     1: { pointShape: 'triangle' },
                     2: { pointShape: 'square' },
                     3: { pointShape: 'diamond' },
                     4: { pointShape: 'star' },
                     5: { pointShape: 'polygon' }
                 },
                 colors: Array.apply(0, Array(machines.length + 2)).map( function() { return getRandomColor(); })
             };

             var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
             chart.draw(data, options);
         }

        </script>
    </body>
</html>
