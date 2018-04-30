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
				 .chart {
						 width: 1090px;
						 height: auto;
						 margin: 0 auto;
						 padding: 5px;
						 position: relative;
						 opacity: 0.8;
				 }
				 .google-visualization-table-table td {
						 font-size: 0.8em;
						 border: solid #eee;
						 border-width: 0 1px 1px 0;
						 padding: 2px .35em;
				}
				</style>
				<!-- <script type="text/javascript" src="./js/efficiency.js"> </script> -->
				<script type="text/javascript">
				 $(document).ready(
						 function() {
								 $.backstretch("./img/stolen-bg.jpg");
								 $('#start').datetimepicker({
										 format: 'YYYY/MM/DD h:mm A'
								 });
								 $('#end').datetimepicker({
										 format: 'YYYY/MM/DD h:mm A'
								 });
								 $('button#load').on('click', makeTable);
								 makeTable();
						 });
				</script>
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
												<li id="LinkHome" class="inactive"><a href="/machine/">Home</a></li>
										</ul>

										<!-- <ul class="nav navbar-nav">
												 <li id="allMachines" class="active"><a href="#">All</a></li>
												 </ul> -->
										<!-- <ul class="nav navbar-nav nav-right">
												 </ul> -->
								</div>
						</nav>
				</header>
				<div class="container">
						<div class="col-md-6">
								<div class="panel panel-primary">
										<div class="panel-heading">Amstore Machine Cycle Time</div>
										<div class="panel-body">
												<script type="text/javascript" >
												 var formatDate = function(d) {
														 var day = d.getDate();

														 if (day < 10) {
																 day = "0" + day;
														 }

														 var month = d.getMonth() + 1;

														 if (month < 10) {
																 month = "0" + month;
														 }

														 var year = d.getFullYear();
														 var hours = d.getHours();
														 var ampm = hours >= 12 ? 'PM' : 'AM';
														 hours = hours % 12;
														 hours = hours ? hours : 12;
														 /* if (hours < 10) {
															*			hours = "0" + hours;
															* }*/

														 var minutes = d.getMinutes();

														 if (minutes < 10) {
																 minutes = "0" + minutes;
														 }

														 return year + "/" + month + "/" + day + " " + hours + ":" + minutes + " " + ampm;
												 };
												 var sixTillNow = function() {
														 var start = new Date();
														 var end = new Date();
														 if (start.getHours() <= 6)
																 start.setHours(start.getHours() - 1);
														 else
																 start.setHours(6);
														 start.setMinutes(0);
														 start.setSeconds(0);

														 end.setHours(end.getHours() + 1);
														 end.setMinutes(0);
														 end.setSeconds(0);
														 $('#start').val(formatDate(start));
														 $('#end').val(formatDate(end));
														 $('#timeMenu').html('Today <b class="caret"></b>');
												 };

												 var today =	function() {
														 var start = new Date();
														 var end = new Date();
														 start.setHours(6);
														 start.setMinutes(0);
														 start.setSeconds(0);

														 end.setHours(14);
														 end.setMinutes(30);
														 end.setSeconds(0);
														 $('#start').val(formatDate(start));
														 $('#end').val(formatDate(end));
														 $('#timeMenu').html('Today <b class="caret"></b>');
												 };
												 var yesterday =	function() {
														 var start = new Date();
														 var end = new Date();
														 start.setHours(6);
														 start.setMinutes(0);
														 start.setSeconds(0);
														 start.setDate(start.getDate() - 1);

														 end.setHours(14);
														 end.setMinutes(30);
														 end.setSeconds(0);
														 end.setDate(end.getDate() - 1);

														 $('#start').val(formatDate(start));
														 $('#end').val(formatDate(end));
														 $('#timeMenu').html('Yesterday <b class="caret"></b>');
												 };
												 var thisHour = function() {
														 var start = new Date();
														 var end = new Date();
														 // start.setHours(start.getHours() - 1);
														 start.setMinutes(0);
														 start.setSeconds(0);

														 end.setMinutes(59);
														 end.setSeconds(0);

														 $('#start').val(formatDate(start));
														 $('#end').val(formatDate(end));
														 $('#timeMenu').html('This Hour <b class="caret"></b>');
												 };
												 var thisWeek = function() {
														 var start = new Date();
														 var end = new Date();
														 start.setDate(start.getDate() - (start.getDay() - 2));
														 start.setHours(6);
														 start.setMinutes(0);
														 start.setSeconds(0);
														 start.setDate(start.getDate() - 1);

														 /* end.setDate(end.getDate() + (6 - end.getDay()));*/
														 end.setHours(14);
														 end.setMinutes(30);
														 end.setSeconds(0);
														 end.setDate(end.getDate() - 1);

														 $('#start').val(formatDate(start));
														 $('#end').val(formatDate(end));
														 $('#timeMenu').html('This Week <b class="caret"></b>');
												 };
												 var lastWeek = function() {
														 var start = new Date();
														 var end = new Date();
														 start.setDate(start.getDate() - (start.getDay() - 2) - 7);
														 start.setHours(6);
														 start.setMinutes(0);
														 start.setSeconds(0);
														 start.setDate(start.getDate() - 1);

														 end.setDate(end.getDate() + (6 - end.getDay()) - 7);
														 end.setHours(14);
														 end.setMinutes(30);
														 end.setSeconds(0);
														 end.setDate(end.getDate() - 1);

														 $('#start').val(formatDate(start));
														 $('#end').val(formatDate(end));
														 $('#timeMenu').html('Last Week <b class="caret"></b>');

												 };
												 var userSpec = function() {
														 $('#timeMenu').html('User Specified <b class="caret"></b>');
												 };
												</script>
												<div id="timeButtons" class="dropdown" style="padding-bottom: 20px;">
														<a href="#" id="timeMenu" data-toggle="dropdown" class="dropdown-toggle" >Time Presets <b class="caret"></b></a>
														<ul class="dropdown-menu">
																<li><a href="#" onclick="today();">Today</a></li>
																<li><a href="#" onclick="yesterday();">Yesterday</a></li>
																<li><a href="#" onclick="thisHour();">This Hour</a></li>
																<li><a href="#" onclick="thisWeek();">This Week</a></li>
																<li><a href="#" onclick="lastWeek();">Last Week</a></li>
														</ul>
												</div>
												<fieldset class="row">
														<div class="form-group">
																<label for="start"><span class="glyphicon glyphicon-time"></span> Start time</label>
																<input type="datetime" id="start" class="form-control" name="start" onclick="userSpec();" value="<?php
																																																																 if (!isset($_COOKIE["start"])) {
																																																																		 echo date('Y-m-d H:i T', time() - (60 * 60));
																																																																 } else {
																																																																		 $hm = date('H:i T', $_COOKIE["start"]);
																																																																		 echo date('Y-m-d H:i T', strtotime("$hm now"));
																																																																 }
																																																																 ?>">
														</div>
														<div class="form-group">
																<label for="end"><span class="glyphicon glyphicon-time"></span> End time</label>
																<input type="datetime" id="end" class="form-control" name="end" onclick="userSpec();" value="<?php
																																																														 if (!isset($_COOKIE["end"])) {
																																																																 echo date('Y-m-d H:i T', time());
																																																														 } else {
																																																																 $hm = date('H:i T', $_COOKIE["end"]);
																																																																 echo date('Y-m-d H:i T', strtotime("$hm now"));
																																																														 }
																																																														 ?>"></input>
														</div>
														<button id="load" class="btn btn-primary" action="submit"><span class="glyphicon glyphicon-search"></span> <i>Load</i></button>
														<input style="opacity: 0;" type="text" value= "" id="machineClicked"></input>
												</fieldset>
										</div>
								</div>
						</div>
						<div class="col-xs-12 col-sm-12 col-md-122 col-md-12">
								<div class="panel panel-default">
										<div class="panel-heading">Log</div>
										<div id="panel-body" style="padding: 20px;">
												<div id="logtbl" class="chart">
												</div>
										</div>
								</div>
						</div>
				</div>
		</body>
</html>
