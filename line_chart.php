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
				<script type="text/javascript" src="./js/events.js"></script>
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
												<li id="LinkHome" class="inactive"><a href="/..">Home</a></li>
										</ul>

										<ul class="nav navbar-nav">
												<li id="allMachines" class="active"><a href="#">All</a></li>
										</ul>
										<ul class="nav navbar-nav nav-right">
												<script type="text/javascript">var machines = [];</script>
												<?php
												$config = parse_ini_file('/etc/cycles.conf');
												$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
												if ($mysqli->connect_errno) {
														echo "{$mysqli->connect_errno}: {$mysqli->connect_error}";
												}
												/* $result = $mysqli->query("SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES ORDER BY MACHNUM"); */
												$result = $mysqli->query("SELECT DISTINCT MACHINE AS MACHNUM FROM CUT_CYCLE_EVENTS ORDER BY MACHINE");
												while ($c = $result->fetch_assoc()) {
														$machnum = $c['MACHNUM'];
														$machines[] = $machnum;
														echo "<li id='$machnum'><a href='#'>$machnum</a></li>" . "\n";
												}
												$result->free();
												$mysqli->close();
												?>
												<script type='text/javascript'>
												 $('#allMachines').on('click', function () {
														 $('li').removeClass('active');
														 $('#allMachines').addClass('active');
														 $('#machineClicked').text('');
												 });
												 <?php
												 foreach ($machines as $machine) {
														 echo "$(\"#{$machine}\").on(\"click\", function () { $(\"li\").removeClass(\"active\");\n",
														 "$(\"#{$machine}\").addClass(\"active\");\n",
														 "$(\"#machineClicked\").text(\"{$machine}\");\n});\n";
														 echo "machines.push('$machine');\n";
												 }
												 ?>
												</script>
												<script type="text/javascript">checkMachines();</script>
										</ul>
								</div>
						</nav>
				</header>
				<div class="col-xs-24 col-sm-24 col-md-12 col-md-12">
						<div id="piepanel" class="panel panel-default">
								<div class="panel-heading">Usage over time</div>
								<div class="panel-body"> <!-- style="height: 252px;"> -->
										<div id="piecontainer" class="col-xs-24 xol-sm24 col-md-12">
                        <div id="chart_div" style="width: auto; height: 1000px"></div>
										</div>

								</div>
						</div>
				</div>

        <?php
        function get_percents() {
            $tz = 'UTC';
            date_default_timezone_set($tz);
            $config = parse_ini_file('/etc/cycles.conf');
            $mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
            $sql = "SELECT DT, MACHNUM, PERCENT_USAGE*100 AS PERCENT_USAGE FROM DAYREPORT WHERE DT > '2018-06-01' ORDER BY DT ASC";

            $res = array();
            $data = $mysqli->query($sql);
            while($row = $data->fetch_object()) {
                array_push($res, $row);
            }
            echo json_encode($res);
        }
        ?>

        <script type="text/javascript">
         google.charts.load('current', {packages: ['corechart', 'line']});
         google.charts.setOnLoadCallback(drawLogScales);

         function drawLogScales() {
						 $.backstretch("./img/stolen-bg.jpg");
             var machines = ['008', '107', '1283', '1659', '1937', '2436'];
             var data = new google.visualization.DataTable();
             data.addColumn('date', 'X');
             for (var i = 0; i < machines.length; i++) {
                 console.log('Added ' + machines[i]);
                 data.addColumn('number', machines[i]);
             }
             var jsn = JSON.parse('<?php get_percents(); ?>');
             var dt = new Date(jsn[0]['DT']);
             var row_array = [dt, 0, 0, 0, 0, 0, 0];
             for (var i = 0; i < jsn.length; i++) {
                 var new_date = false;
                 if ("" + new Date(jsn[i]['DT']) !== "" + dt) {
                     dt = new Date(jsn[i]['DT']);
                     new_date = true;
                     row_array[0] = dt;
                 }
                 if (!new_date) {
                     switch(jsn[i]['MACHNUM']) {
                         case '008':
                             row_array[1] = Math.floor(jsn[i]['PERCENT_USAGE']);
                             break;
                         case '107':
                             row_array[2] = Math.floor(jsn[i]['PERCENT_USAGE']);
                             break;
                         case '1283':
                             row_array[3] = Math.floor(jsn[i]['PERCENT_USAGE']);
                             break;
                         case '1659':
                             row_array[4] = Math.floor(jsn[i]['PERCENT_USAGE']);
                             break;
                         case '1937':
                             row_array[5] = Math.floor(jsn[i]['PERCENT_USAGE']);
                             break;
                         case '2436':
                             row_array[6] = Math.floor(jsn[i]['PERCENT_USAGE']);
                             break;
                         default:
                             break;
                     }
                 } else {
                     new_date = false;
                     data.addRow(row_array);
                 }
             }

             var options = {
                 /* curveType: 'function',  */
                 hAxis: {
                     title: 'Time',
                     logScale: false
                 },
                 vAxis: {
                     title: 'Usage %',
                     logScale: true
                 },
                 colors: ['#f3f01e', '#108a00', '#e60000', '#a52714', '#097138', '#ff0000', '#000ff0']
             };

             var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
             chart.draw(data, options);
         };

        </script>
    </body>
</html>
