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
         #chart1 {
             width: 800px;
             height: auto;
             margin: 0 auto;
             padding: 20px;
             position: relative;
             opacity: 0.8;
         }
        </style>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-backstretch/2.0.4/jquery.backstretch.min.js"></script>
        <script type="text/javascript" src="./bootstrap/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="./js/moment-with-locales.min.js"></script>
        <script src="//cdn.rawgit.com/Eonasdan/bootstrap-datetimepicker/e8bddc60e73c1ec2475f827be36e1957af72e2ea/src/js/bootstrap-datetimepicker.js"></script>
        <!-- <script type="text/javascript" src="./js/events.js"></script> -->
        <script type="text/javascript" src="./js/efficiency.js"> </script>
        <script type="text/javascript">
         $(document).ready(
             function() {
                 $.backstretch("./img/stolen-bg.jpg");
                 makeChart();
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
                <!-- <div id="navbarCollapse" class="collapse navbar-collapse">
                     <ul class="nav navbar-nav">
                     <li id="LinkHome" class="inactive"><a href="/..">Home</a></li>
                     </ul>

                     <ul class="nav navbar-nav">
                     <li id="allMachines" class="active"><a href="#">All</a></li>
                     </ul>
                     <ul class="nav navbar-nav nav-right">
                     // <?php
                        // $config = parse_ini_file('/etc/cycles.conf');
                        // $mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
                        // if ($mysqli->connect_errno) {
                        //     echo "{$mysqli->connect_errno}: {$mysqli->connect_error}";
                        // }
                        // $result = $mysqli->query("SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES ORDER BY MACHNUM");
                        // while ($c = $result->fetch_assoc()) {
                        //     $machnum = $c['MACHNUM'];
                        //     echo "<li id='$machnum'><a href='#'>$machnum</a></li>" . "\n";
                        // }
                        // $result->free();
                        // $mysqli->close();
                        // ?>
                     // <script type='text/javascript'>
                     //  $('#allMachines').on('click', function () {
                     //      $('li').removeClass('active');
                     //      $('#allMachines').addClass('active');
                     //      $('#machineClicked').text('');
                     //  });
                     //  <?php
                         //  $config = parse_ini_file('/etc/cycles.conf');
                         //  $mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['db']);
                         //  if ($mysqli->connect_errno) {
                         //      echo "{$mysqli->connect_errno}: {$mysqli->connect_error}";
                         //  }
                         //  $result = $mysqli->query("SELECT DISTINCT MACHNUM FROM CUT_CYCLE_TIMES");

                         //  while ($b = $result->fetch_assoc()) {
                         //      // echo "$('#$c').on('click', function () { $('li').removeClass('active');\n $('#$c').addClass('active');\n $('#machineClicked').text('$c');\n });\n";
                         //      echo "$(\"#{$b['MACHNUM']}\").on(\"click\", function () { $(\"li\").removeClass(\"active\");\n"
                         //    , "$(\"#{$b['MACHNUM']}\").addClass(\"active\");\n"
                         //    , "$(\"#machineClicked\").text(\"{$b['MACHNUM']}\");\n"
                         //    , "});\n";
                         //  }
                         //  $result->free();
                         //  $mysqli->close();

                         //  ?>
                     </script>
                     </ul>
                     </div> -->
            </nav>
        </header>
        <div class="container">
            <div class="col-xs-12 col-sm-12 col-md-122 col-md-12">
                <div class="panel panel-default">
                    <!-- <div class="panel-heading">Efficiency</div> -->
                    <div id="panel-body" style="padding: 20px;">
                        <div id="chart1">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
