google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
google.charts.setOnLoadCallback(drawMultSeries);

var machines = [];
var drawMultSeries = function (strt, nd, mach) {
    var datstring = "start=" + new Date(strt).toUTCString() + "&end=" + new Date(nd).toUTCString();
    if (mach != '') {
        datstring += "&machine=" + mach;
    }

    $.ajax({url: 'getMachineTimes.php',
            data: datstring,
            dataType: "json",
            complete: r});

    $.ajax({url: 'getPieValues.php',
            data: datstring,
            dataType: "json",
            complete: renderPies});
};

var r = function(indata) {
    var jdata = JSON.parse(indata.responseText);
    x = arrdata(jdata);
    renderTimeline(x);
    renderTables(x);
};

var arrdata = function(indata) {
    var res = [];
    // var machines = [];
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
    for (i = 0, d = indata.length; i < d; i++) {
        if (machines.indexOf(indata[i][0]) < 0) {
            machines.push(indata[i][0]);
        }

        res.push([indata[i][0], indata[i][1],
                  new Date(indata[i][2]),
                  new Date(indata[i][3])]);
    }
    return res;
};

var renderTimeline = function(arrdata) {
    var data = new google.visualization.DataTable();
    data.addColumn({type: 'string', id: 'Machine'});
    data.addColumn({type: 'string', id: 'Program'});
    data.addColumn({type: 'date', id: 'Start'});
    data.addColumn({type: 'date', id: 'End'});
    data.addRows(arrdata);
    $("#chart").fadeIn(2000);
    var ch = document.getElementById('chart');
    var chart = new google.visualization.Timeline(ch);
    var options = {
        //width: 1280,
        height: 128 * machines.length,
        timeline: { showBarLabels: false },
        hAxis: {
            viewWindowMode: 'pretty',
            minValue: new Date(document.getElementById('start').value),
            maxValue: new Date(document.getElementById('end').value),
            format: 'h:mm aa'
        }
    };
    chart.draw(data, options);
};

var renderTables = function(data) {
    var fmt_data = [];
    for(var i = 0; i < machines.length; i++) {
        var fmt_datatable = new google.visualization.DataTable();
        fmt_datatable.addColumn('string', 'Machine', 'Machine');
        fmt_datatable.addColumn('string', 'Program', 'Machine');
        fmt_datatable.addColumn('date', 'Start', 'Start');
        fmt_datatable.addColumn('date', 'End', 'End');
        fmt_datatable.addColumn('string', 'Diff (min:sec)', 'Diff');
        if (document.getElementById("m" + machines[i]) === null) {
            $("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#m" + machines[i] +
                              "\"></ br>"  + machines[i] +
                              "</button>" +
                              "<div id=\"m" + machines[i] +
                              "\" class=\"collapse\"></div>");
        }
        for(var j = 0, jn = data.length; j < jn; j++) {
            if (data[j][0] === machines[i]) {
                var sDate = new Date(data[j][2].toString());
                var eDate = new Date(data[j][3].toString());
                var dDate = (eDate - sDate) / 60000;
                var min = Math.floor(dDate);
                var sec = (('.' + dDate.toString().split('.')[1]) * 60);
                min = min.toString().search('NaN') > -1 ? 0 : min;
                sec = sec.toString().search('NaN') > -1 ? 0 : sec;
                sec = sec < 10 ? '0' + sec : sec;
                var strDate = (min + ':' + sec).split('.')[0];
                fmt_data.push([
                    data[j][0],
                    data[j][1],
                    sDate,
                    eDate,
                    strDate
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
        pieHole: 0.2,
        slices: { 0: {offset: 0.1},
                  1: {offset: 0.1}},
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
        pieHole: 0.2,
        slices: { 0: {offset: 0.1},
                  1: {offset: 0.1}},
        //chartArea: {width:'105%', height:'105%'}
    };

    var pie2 = document.getElementById('pie2');
    var pie_chart2 = new google.visualization.PieChart(pie2);
    pie_chart2.draw(piedata2, pie_options2);
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
};

var makeTable = function () {
    $.ajax({url: 'getLog.php',
            data: null,
            dataType: "json",
            complete: rLog});
};


var rLog = function(indata) {
    console.log(indata);
    var jdata = JSON.parse(indata.responseText);
    var fmt_data = [];
    var fmt_datatable = new google.visualization.DataTable();
    fmt_datatable.addColumn('date', 'Timestamp', 'Timestamp');
    fmt_datatable.addColumn('string', 'Machine', 'Machine');
    fmt_datatable.addColumn('string', 'Event', 'Event');

    for (var j = 0, jn = jdata.length; j < jn; j++) {
        var str = jdata[j]["EVENT"];
        var lDate = new Date(jdata[j]["TS"]);
        fmt_data.push([
            lDate,
            jdata[j]["MACHINE"],
            str
        ]);
    }
    fmt_datatable.addRows(fmt_data);
    fmt = new google.visualization.DateFormat({ pattern: 'MMM d, yyyy h:mm:ss aa' });
    fmt.format(fmt_datatable, 0);
    if (document.getElementById("logtbl") === null) {
        $("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" " +
                          "data-target=\"#logtbl\">Log</button>" +
                          "<div id=\"logtbl\" class=\"collapse\"></div>");
    }
    var tbl = new google.visualization.Table(document.getElementById('logtbl'));
    tbl.draw(fmt_datatable,
             {
                 showRowNumber: false
             }
            );
};

$(document).ready(
    function() {
        $('#chart').fadeOut(0);
        $('a#log').on('click', makeTable);
        $('button#load').on('click', loadChart);
    }
);
