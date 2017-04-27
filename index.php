<?php
date_default_timezone_set('America/Detroit');
?>
<!doctype html>
<html lang="en">
    <head>
        <title>Amstore Machine Cycle Time</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
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
        </style>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-backstretch/2.0.4/jquery.backstretch.min.js"></script>
        <script type="text/javascript" src="./bootstrap/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="./js/moment-with-locales.min.js"></script>
        <script src="//cdn.rawgit.com/Eonasdan/bootstrap-datetimepicker/e8bddc60e73c1ec2475f827be36e1957af72e2ea/src/js/bootstrap-datetimepicker.js"></script>
        <script type="text/javascript" src="./js/events.js"></script>
        <script type="text/javascript">
         $(document).ready(
             function () {
                 var machine_clicked = null;
                 $.backstretch("./img/stolen-bg.jpg");
                 $('#start').datetimepicker({
                     format: 'YYYY-MM-DD h:mm A'
                 });
                 $('#end').datetimepicker({
                     format: 'YYYY-MM-DD h:mm A'
                 });
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
                        <li id="allMachines" class="active"><a href="#">All</a></li>
                    </ul>
                    <ul class="nav navbar-nav nav-right">
                        <?php
                        $config = parse_ini_file('/etc/cycles.conf');
                        $mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
                        if ($mysqli->connect_errno) {
                            echo "{$mysqli->connect_errno}: {$mysqli->connect_error}";
                        }
                        $result = $mysqli->query("SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES");
                        while ($c = $result->fetch_assoc()) {
                            $machnum = $c['MACHNUM'];
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
                         $config = parse_ini_file('/etc/cycles.conf');
                         $mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
                         if ($mysqli->connect_errno) {
                             echo "{$mysqli->connect_errno}: {$mysqli->connect_error}";
                         }
                         $result = $mysqli->query("SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES");

                         while ($b = $result->fetch_assoc()) {
                             // echo "$('#$c').on('click', function () { $('li').removeClass('active');\n $('#$c').addClass('active');\n $('#machineClicked').text('$c');\n });\n";
                             echo "$(\"#{$b['MACHNUM']}\").on(\"click\", function () { $(\"li\").removeClass(\"active\");\n"
                                 , "$(\"#{$b['MACHNUM']}\").addClass(\"active\");\n"
                                   , "$(\"#machineClicked\").text(\"{$b['MACHNUM']}\");\n"
                                     , "});\n";
                         }
                         $result->free();
                         $mysqli->close();

                         ?>                        </script>
                    </ul>
                </div>
            </nav>
        </header>
        <div class="container">
            <div class="col-xs-12 col-sm-12 col-md-6 col-md-6">
                <div class="panel panel-default">
                    <div class="panel-heading">Amstore Machine Cycle Time</div>
                    <div class="panel-body">
                        <fieldset class="row">
                            <div class="form-group">
                                <label for="start"><span class="glyphicon glyphicon-time"></span> Start time</label>
                                <input type="datetime" id="start" class="form-control" name="start" value="<?php echo date('Y-m-d H:i T', time() - (60 * 60)); ?>">
                            </div>
                            <div class="form-group">
                                <label for="end"><span class="glyphicon glyphicon-time"></span> End time</label>
                                <input type="datetime" id="end" class="form-control" name="end" value="<?php echo date('Y-m-d H:i T', time()); ?>"></input>
                            </div>
                            <button id="load" class="btn btn-primary" action="submit"><span class="glyphicon glyphicon-search"></span> <i>Load</i></button>
                            <input style="opacity: 0;" type="text" value= "" id="machineClicked"></input>
                        </fieldset>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-6 col-md-6">
                <div class="panel panel-default">
                    <div class="panel-heading">Time Pie</div>
                    <div class="panel-body">
                        <div id="pie">
                        </div>
                    </div>
                </div>
            </div>
            <!-- <div class="col-xs-12 col-sm-12 col-md-6 col-md-6"> -->
            <!--     <div class="panel panel-default"> -->
            <!--         <div class="panel-heading">Another Visualization</div> -->
            <!--         <div class="panel-body"> -->
            <!--             <div id="anothervis"> -->
            <!--             </div> -->
            <!--         </div> -->
            <!--     </div> -->
            <!-- </div> -->
            <div class="col-xs-12 col-sm-12 col-md-12 col-md-12">
                <div class="panel panel-default">
                    <div class="panel-heading">Timeline</div>
                    <div class="panel-body">
                        <div id="chart">
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-md-12">
                <div class="panel panel-default">
                    <div class="panel-heading">Table</div>
                    <div class="panel-body" id="tbls">
                        <div id="tbl">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="modalAlert" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Alert</h4>
                    </div>
                    <div class="modal-body">
                        <p id="alertText">End time shoule be after start time.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
