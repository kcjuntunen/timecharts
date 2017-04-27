google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
google.charts.setOnLoadCallback(drawMultSeries);

var drawMultSeries = function (strt, nd, mach) {
    var succeed = function(datain) {
        // console.log(datain.responseText);
        var jdata = JSON.parse(datain.responseText);
        var total_setup_time = 0;
        var total_cycle_time = 0;
        var total_idle_time = 0;
        var machines = [];
        var arrdata = function(indata) {
            var res = [];

            if (!Array.isArray(indata) || indata.length < 1) {
                var chart = $('#chart');
                var pie = $('#pie');
                chart.fadeOut(0);
                pie.fadeOut(0);
                var txt = $("#alertText");
                txt.text('No data found.');
                $("#modalAlert").modal('show');
                return [];
            }

            total_idle_time = new Date(indata[indata.length - 1][2]) - new Date(indata[0][3]);
            $("#tbls").html("");
            var diff = 0;
            for (var i = 0, d = indata.length; i < d; i++) {
                if (!machines.includes(indata[i][0])) {
                    machines.push(indata[i][0]);
                }
                // // console.log(new Date(indata[i][2]));
                res.push([indata[i][0], indata[i][1], new Date(indata[i][2]), new Date(indata[i][3])]);
                if (indata[i][3] && indata[i][2]) {
                    diff = new Date(indata[i][3]) - new Date(indata[i][2]);
                }
                if (indata[i][1].search('Setup') > -1) {
                    total_setup_time += diff;
                    total_idle_time -=diff;
                } else {
                    total_cycle_time += diff;
                    total_idle_time -= diff;
                }
            }
            if (total_setup_time < 0) {
                total_setup_time = 1;
            }
            if (total_idle_time < 0) {
                total_idle_time = 1;
            }
            if (total_cycle_time < 0) {
                total_cycle_time = 1;
            }
            return res;
        };
        var data = new google.visualization.DataTable();

        data.addColumn({type: 'string', id: 'Machine'});
        data.addColumn({type: 'string', id: 'Program'});
        data.addColumn({type: 'date', id: 'Start'});
        data.addColumn({type: 'date', id: 'End'});

        data.addRows(arrdata(jdata["data"]));
        /* // console.log(JSON.stringify(data));*/
        $("#chart").fadeIn(2000);
        var ch = document.getElementById('chart');
        var chart = new google.visualization.Timeline(ch);
        var options = {timeline: { width: 1280, height: 128, showBarLabels: false }};
        chart.draw(data, options);
        var piedata = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Setup', total_setup_time/(1000 * 60)],
            ['Cycle', total_cycle_time/(1000 * 60)],
            ['Idle',  total_idle_time/(1000 * 60)]
        ]);

        var pie_options = {
            title: 'Machine Efficiency',
            colors: ['#f3f01e', '#108a00', '#e60000' ],
            is3D: true
        };

        $('#pie').fadeIn(2000);
        var pie = document.getElementById('pie');
        var pie_chart = new google.visualization.PieChart(pie);
        pie_chart.draw(piedata, pie_options);

        for(var i = 0; i < machines.length; i++) {
            var fmt_datatable = new google.visualization.DataTable();
            fmt_datatable.addColumn('string', 'Machine', 'Machine');
            fmt_datatable.addColumn('string', 'Program', 'Machine');
            fmt_datatable.addColumn('date', 'Start', 'Start');
            fmt_datatable.addColumn('date', 'End', 'End');
            $("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#m" + machines[i] +
                              "\"></ br>"  + machines[i] +
                              "</button>" +
                              "<div id=\"m" + machines[i] +
                              "\" class=\"collapse\"></div>");
            var fmt_data = [];
            for(var j = 0, jn = data.getNumberOfRows(); j < jn; j++) {
                if (jdata["data"][j][0] === machines[i]) {
                    // console.log("push" + jdata["data"][j][0]);
                    // console.log("length = " + fmt_data.length);
                    fmt_data.push([
                        jdata["data"][j][0],
                        jdata["data"][j][1],
                        new Date(jdata["data"][j][2]),
                        new Date(jdata["data"][j][3])
                    ]);
                }
            }

            fmt_datatable.addRows(fmt_data);
            var tbl = new google.visualization.Table(document.getElementById("m" + machines[i]));
            fmt = new google.visualization.DateFormat(
                { pattern: 'MMM d, yyyy h:mm:ss aa' });
            fmt.format(fmt_datatable, 2);
            fmt.format(fmt_datatable, 3);
            tbl.draw(fmt_datatable,
                     { showRowNumber: true,
                       width: 1280,
                       height: 256
                     }
                    );
            fmt_data = [];
        }
    };
    var datstring = "start=" + strt + "&end=" + nd;
    if (mach != '') {
        datstring += "&machine=" + mach;
    }

    $.ajax({url: 'getMachineTimes.php',
            data: datstring,
            dataType: "json",
            complete: succeed});
};


var loadChart = function() {
    var chart = $('#chart');
    var pie = $('#pie');
    chart.fadeOut(0);
    pie.fadeOut(0);
    var starttime = new Date(document.getElementById('start').value);
    var endtime = new Date(document.getElementById('end').value);
    var machine_clicked = $('#machineClicked').text();

    if (endtime <= starttime) {
        var txt = $("#alertText");
        txt.text('End time ought to be after start time.');
        $("#modalAlert").modal('show');
        return;
    }

    drawMultSeries($('input#start').val(), $('input#end').val(), $('input#machineClicked').text());
};

$(document).ready(
    function() {
        // window.onerror = function(errorMsg) {
        //     $('#console').html($('#console').html()+'<br>'+errorMsg)
        // };

        $('#chart').fadeOut(0);
        $('#pie').fadeOut(0);
        $('button#load').on('click', loadChart);
    }
);
