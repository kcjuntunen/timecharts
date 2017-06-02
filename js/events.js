google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
google.charts.setOnLoadCallback(drawMultSeries);

var drawMultSeries = function (strt, nd, mach) {
    var succeed = function(datain) {
        var jdata = JSON.parse(datain.responseText);
        var machines = [];
        var arrdata = function(indata) {
            var res = [];
            if (!Array.isArray(indata) || indata.length < 1) {
                var chart = $('#chart');
                chart.fadeOut(0);
                var txt = $("#alertText");
                txt.text('No data found.');
                $("#modalAlert").modal('show');
                return [];
            }

            $("#tbls").html("");
            var diff = 0;
            for (var i = 0, d = indata.length; i < d; i++) {
                if (!machines.includes(indata[i][0])) {
                    machines.push(indata[i][0]);
                }

                res.push([indata[i][0], indata[i][1],
                          new Date(indata[i][2].replace(/-/gi, '/')),
                          new Date(indata[i][3].replace(/-/gi, '/'))]);
                // if (indata[i][3] && indata[i][2]) {
                //     diff = new Date(indata[i][3].replace(/-/gi, '/')) - new Date(indata[i][2].replace(/-/gi, '/'));
                // }
            }
            return res;
        };
        var data = new google.visualization.DataTable();
        // This, unfortunately, doesn't seem to do anything.
        var dfmt = new google.visualization.DateFormat({ pattern: 'MMM d, yyyy h:mm:ss aa' });

        data.addColumn({type: 'string', id: 'Machine'});
        data.addColumn({type: 'string', id: 'Program'});
        data.addColumn({type: 'date', id: 'Start'});
        data.addColumn({type: 'date', id: 'End'});
        data.addRows(arrdata(jdata["data"]));
        //data.addRows(jdata["data"]);
        dfmt.format(data, 2);
        dfmt.format(data, 3);
        /* // console.log(JSON.stringify(data));*/
        $("#chart").fadeIn(2000);
        var ch = document.getElementById('chart');
        var chart = new google.visualization.Timeline(ch);
        var options = {timeline: { width: 1280, height: 128 * machines.length, showBarLabels: false }};
        chart.draw(data, options);
        ////////////////////////////////////////////////////////////////////////////////

        for(var i = 0; i < machines.length; i++) {
            var fmt_datatable = new google.visualization.DataTable();
            fmt_datatable.addColumn('string', 'Machine', 'Machine');
            fmt_datatable.addColumn('string', 'Program', 'Machine');
            fmt_datatable.addColumn('date', 'Start', 'Start');
            fmt_datatable.addColumn('date', 'End', 'End');
            fmt_datatable.addColumn('number', 'Diff (min)', 'Diff');
            $("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#m" + machines[i] +
                              "\"></ br>"  + machines[i] +
                              "</button>" +
                              "<div id=\"m" + machines[i] +
                              "\" class=\"collapse\"></div>");
            var fmt_data = [];
            for(var j = 0, jn = data.getNumberOfRows(); j < jn; j++) {
                if (jdata["data"][j][0] === machines[i]) {
                    var sDate = new Date(jdata["data"][j][2].replace(/-/gi, '/'));
                    var eDate = new Date(jdata["data"][j][3].replace(/-/gi, '/'));
                    var dDate = (eDate - sDate) / 60000;
                    fmt_data.push([
                        jdata["data"][j][0],
                        jdata["data"][j][1],
                        sDate,
                        eDate,
                        dDate
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
    var datstring = "start=" + new Date(strt).toUTCString() + "&end=" + new Date(nd).toUTCString();
    if (mach != '') {
        datstring += "&machine=" + mach;
    }

    $.ajax({url: 'getMachineTimes.php',
            data: datstring,
            dataType: "json",
            complete: succeed});

    $.ajax({url: 'getPieValues.php',
            data: datstring,
            dataType: "json",
            complete: renderPies});
};

var renderPies = function(inp) {
    input = JSON.parse(inp.responseText);
    ////////////////////////////////////////////////////////////////////////////////
    // Pie 1
    ////////////////////////////////////////////////////////////////////////////////
    var idle = input[0]['total'] - (input[0]['setup'] + input[0]['cycle']);
    var piedata = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Setup', input[0]['setup'] / 60],
        ['Cycle', input[0]['cycle'] / 60],
        ['Idle',  idle / 60]
    ]);

    var pie_options = {
        title: 'Selected Range',
        colors: ['#f3f01e', '#108a00', '#e60000' ],
        pieHole: 0.4,
        slices: { 0: {offset: 0.1},
                  1: {offset: 0.1}},
        //chartArea: {width:'101%', height:'101%'}
    };

    var pie = document.getElementById('pie');
    var pie_chart = new google.visualization.PieChart(pie);
    pie_chart.draw(piedata, pie_options);
    ////////////////////////////////////////////////////////////////////////////////
    // Pie 2
    ////////////////////////////////////////////////////////////////////////////////
    idle = input[1]['total'] - (input[1]['setup'] + input[1]['cycle']);
    var piedata2 = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Setup', input[1]['setup'] / 60],
        ['Cycle', input[1]['cycle'] / 60],
        ['Idle',  idle / 60]
    ]);

    var pie_options2 = {
        title: 'Last Week',
        colors: ['#f3f01e', '#108a00', '#e60000' ],
        pieHole: 0.4,
        slices: { 0: {offset: 0.1},
                  1: {offset: 0.1}},
        //chartArea: {width:'105%', height:'105%'}
    };

    var pie2 = document.getElementById('pie2');
    var pie_chart2 = new google.visualization.PieChart(pie2);
    pie_chart2.draw(piedata2, pie_options2);
    // var fadepie = $('#piecontainer');
    // var fadepie2 = $('#pie2container');
    // fadepie.fadeOut(0);
    // fadepie2.fadeOut(0);

    // fadepie.fadeIn();
    // fadepie2.fadeIn();
};

var getTotalIdleTime = function(gTITstart, gTITend) {
    var gTIT = new Date(gTITend - gTITstart);
    var breaks = [];
    for(var i = gTITstart.getDate(), j = gTITend.getDate();
        i <= j; i++) {
        var bStrt = new Date(gTITstart.getYear(), gTITstart.getMonth(), gTITstart.getDate(), 8, 0, 0);
        var bEnd = new Date(gTITstart.getYear(), gTITstart.getMonth(), gTITstart.getDate(), 8, 15, 0);
        if (bEnd <= gTITend && bStrt >= gTITstart) {
            var brk = [bStrt, bEnd];
            breaks.append(brk);
        }
    }
    return breaks;
};

var loadChart = function() {
    var chart = $('#chart');
    var pie = $('#pie');
    chart.fadeOut(0);
    var starttime = new Date(new Date(document.getElementById('start').value).toUTCString());
    var endtime = new Date(new Date(document.getElementById('end').value).toUTCString());
    var machine_clicked = $('#machineClicked').text();

    if (endtime <= starttime) {
        var txt = $("#alertText");
        txt.text('End time ought to be after start time.');
        $("#modalAlert").modal('show');
        return;
    }
    drawMultSeries(starttime, endtime, machine_clicked);
    //drawMultSeries($('input#start').val(), $('input#end').val(), $('input#machineClicked').text());
};

$(document).ready(
    function() {
        // window.onerror = function(errorMsg) {
        //     $('#console').html($('#console').html()+'<br>'+errorMsg)
        // };

        $('#chart').fadeOut(0);
        $('button#load').on('click', loadChart);
    }
);
