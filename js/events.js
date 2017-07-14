google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
google.charts.setOnLoadCallback(drawMultSeries);

var starttime = null;
var endtime = null;
var machine_clicked = null;

var chart = null;
var pie = null;
var machines = [];

var timeLine = new Object();
var tables = new Object();
var pieChart = new Object();
var lastResponse = {
    value: {},
    events: {},
    setValue: function(value) {
        this.value = value;
        this.notify('value', this.value);
    },

    addEvent: function(name) {
        if (typeof this.events[name] === "undefined") {
            this.events[name] = [];
        }
    },

    register: function(event, subscriber) {
        if (typeof subscriber === "object" && typeof subscriber.notify === "function") {
            this.addEvent(event);
            this.events[event].push(subscriber);
        }
    },

    notify: function(event, data) {
        var events = this.events[event];
        for(var e in events) {
            events[e].notify(data);
        }
    }
};

var loadChart = function() {
    chart.fadeOut(0);

    if (endtime <= starttime) {
        var txt = $("#alertText");
        txt.text('End time ought to be after start time.');
        $("#modalAlert").modal('show');
        return;
    }
    drawMultSeries(starttime, endtime, machine_clicked);
};

var arrange_data_with_warning = function(indata) {
    if (!Array.isArray(indata) || indata.length < 1) {
        var chart = $('#chart');
        chart.fadeOut(0);
        var txt = $("#alertText");
        txt.text('No data found.');
        $("#modalAlert").modal('show');
        return [];
    }
    return arrange_data(indata);
};

var arrange_data = function(indata) {
    res = [];
    if (!Array.isArray(indata) || indata.length < 1) {
        return res;
    }
    // $("#tbls").html("");
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

var GetDatestring = function() {
    var strt = document.getElementById("start").value;
    var nd = document.getElementById("end").value;
    var mach = document.getElementById("machineClicked").textContent;
    var datstring = "start=" + new Date(starttime).toUTCString() + "&end=" + new Date(nd).toUTCString();
    if (mach != '') {
        datstring += "&machine=" + mach;
    }
    return datstring;
};

var tableData = function(timelineData) {
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
    };
};

timeLine.Render = function(response) {
    this.data = data = new google.visualization.DataTable();
    this.data.addColumn({type: 'string', id: 'Machine'});
    this.data.addColumn({type: 'string', id: 'Program'});
    this.data.addColumn({type: 'date', id: 'Start'});
    this.data.addColumn({type: 'date', id: 'End'});

    lastResponse.setValue(response);
    var parsed = JSON.parse(lastResponse.value.responseText);
    this.data.addRows(arrange_data(parsed));

    chart.fadeIn(2000);
    var ch = new google.visualization.Timeline(document.getElementById('chart'));
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

    ch.draw(data, options);

    this.chartrange_end = options.hAxis.maxValue;
    this.lastEnrtyStopTime = function () {
        var last_entry_stoptime = new Date(new Date(document.getElementById('start').value).toUTCString());
        for (i = 0, j = data.og.length; i < j; i++) {
            var val = data.og[i].c[3].v;
            if (val > last_entry_stoptime) {
                last_entry_stoptime = val;
            }
        };
        return last_entry_stoptime;
    };

    var t = setInterval(this.Update, 10000);
    setTimeout(function() { clearInterval(t); }, Math.abs(this.chartrange_end - new Date()));
};

timeLine.Update = function() {
    console.log('Interval Update');
    var now = new Date();
    if (this.chartrange_end > now) {
        var mach = $('#machineClicked').text();
        var datstring = "start=" + lastEnrtyStopTime().toUTCString() +
                "&end=" + new Date(chartrange_end).toUTCString();

        var reDraw = function(d) {
            lastResponse.setValue(d);
            var jdata = JSON.parse(d.responseText);
            x = arrange_data(jdata);
            data.addRows(x);
            ch.draw(data, options);
        };

        if (mach != '') {
            datstring += "&machine=" + mach;
        }

        $.ajax({url: 'getMachineTimes.php',
                data: datstring,
                dataType: "json",
                complete: reDraw});
    }
};


tables.initialated = false;
tables.Render = function() {
    var raw_data = JSON.parse(lastResponse.value.responseText);
    var fmt_data = [];
    for(var i = 0; i < machines.length; i++) {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Machine', 'Machine');
        data.addColumn('string', 'Program', 'Machine');
        data.addColumn('date', 'Start', 'Start');
        data.addColumn('date', 'End', 'End');
        data.addColumn('string', 'Diff (min:sec)', 'Diff');
        if (document.getElementById("m" + machines[i]) === null) {
            $("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#m" + machines[i] +
                              "\"></ br>"  + machines[i] +
                              "</button>" +
                              "<div id=\"m" + machines[i] +
                              "\" class=\"collapse\"></div>");
        }
        for(var j = 0, jn = raw_data.length; j < jn; j++) {
            if (raw_data[j][0] === machines[i]) {
                var sDate = new Date(raw_data[j][2].toString());
                var eDate = new Date(raw_data[j][3].toString());
                var dDate = (eDate - sDate) / 60000;
                var min = Math.floor(dDate);
                var sec = (('.' + dDate.toString().split('.')[1]) * 60);
                min = min.toString().search('NaN') > -1 ? 0 : min;
                sec = sec.toString().search('NaN') > -1 ? 0 : sec;
                sec = sec < 10 ? '0' + sec : sec;
                var strDate = (min + ':' + sec).split('.')[0];
                fmt_data.push([
                    raw_data[j][0],
                    raw_data[j][1],
                    sDate,
                    eDate,
                    strDate
                ]);
            }
        }

        data.addRows(fmt_data);
        var tbl = new google.visualization.Table(document.getElementById("m" + machines[i]));
        fmt = new google.visualization.DateFormat(
            { pattern: 'MMM d, yyyy h:mm:ss aa' });
        fmt.format(data, 2);
        fmt.format(data, 3);
        tbl.draw(data,
                 { showRowNumber: true,
                   width: 1280,
                   height: 256
                 }
                );
        fmt_data = [];
    }
    this.initialated = true;
};

tables.Update = function () {
    var raw_data = JSON.parse(lastResponse.value.responseText);
    var fmt_data = [];
    for(var i = 0; i < machines.length; i++) {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Machine', 'Machine');
        data.addColumn('string', 'Program', 'Machine');
        data.addColumn('date', 'Start', 'Start');
        data.addColumn('date', 'End', 'End');
        data.addColumn('string', 'Diff (min:sec)', 'Diff');
        if (document.getElementById("m" + machines[i]) === null) {
            $("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#m" + machines[i] +
                              "\"></ br>"  + machines[i] +
                              "</button>" +
                              "<div id=\"m" + machines[i] +
                              "\" class=\"collapse\"></div>");
        }
        for(var j = 0, jn = raw_data.length; j < jn; j++) {
            if (raw_data[j][0] === machines[i]) {
                var sDate = new Date(raw_data[j][2].toString());
                var eDate = new Date(raw_data[j][3].toString());
                var dDate = (eDate - sDate) / 60000;
                var min = Math.floor(dDate);
                var sec = (('.' + dDate.toString().split('.')[1]) * 60);
                min = min.toString().search('NaN') > -1 ? 0 : min;
                sec = sec.toString().search('NaN') > -1 ? 0 : sec;
                sec = sec < 10 ? '0' + sec : sec;
                var strDate = (min + ':' + sec).split('.')[0];
                fmt_data.push([
                    raw_data[j][0],
                    raw_data[j][1],
                    sDate,
                    eDate,
                    strDate
                ]);
            }
        }

        data.addRows(fmt_data);
        var tbl = new google.visualization.Table(document.getElementById("m" + machines[i]));
        fmt = new google.visualization.DateFormat(
            { pattern: 'MMM d, yyyy h:mm:ss aa' });
        fmt.format(data, 2);
        fmt.format(data, 3);
        tbl.draw(data,
                 { showRowNumber: true,
                   width: 1280,
                   height: 256
                 }
                );
        fmt_data = [];
    }
};

pieChart.Render = function() {
    var draw = function(response) {
        input = JSON.parse(response.responseText);
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
                      1: {offset: 0.1}}
        };

        var pie = document.getElementById('pie');
        var pie_chart = new google.visualization.PieChart(pie);
        pie_chart.draw(piedata, pie_options);
        ////////////////////////////////////////////////////////////////////////////////
        // Pie 2
        ////////////////////////////////////////////////////////////////////////////////
        var idle2 = input[1]['total'] - (input[1]['setup'] + input[1]['cycle']);
        var piedata2 = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Setup', input[1]['setup'] / 60],
            ['Cycle', input[1]['cycle'] / 60],
            ['Idle',  idle2 / 60]
        ]);

        var pie_options2 = {
            title: 'Last Week',
            colors: ['#f3f01e', '#108a00', '#e60000' ],
            pieHole: 0.2,
            slices: { 0: {offset: 0.1},
                      1: {offset: 0.1}}
            //chartArea: {width:'105%', height:'105%'}
        };

        var pie2 = document.getElementById('pie2');
        var pie_chart2 = new google.visualization.PieChart(pie2);
        pie_chart2.draw(piedata2, pie_options2);
    };
    $.ajax({url: 'getPieValues.php',
            data: GetDatestring(),
            dataType: "json",
            complete: draw});
};

var makeTable = function () {
    $.ajax({url: 'getLog.php',
            data: GetDatestring(),
            dataType: "json",
            complete: rLog});
};

var InitialRender = function(response) {
    timeLine.Render(response);
    tables.Render();
    pieChart.Render();

    // init events
    var updateTableNotify = {
        notify: function () {
            console.log('Update event.');
            tables.Update(lastResponse);
            pieChart.Render();
        }
    };
    lastResponse.register('value', updateTableNotify);
};

var drawMultSeries = function (strt, nd, mach) {
    if (typeof strt != "undefined" && typeof nd != "undefined" && typeof mach != "undefined") {
        starttime = new Date(document.getElementById('start').value).toUTCString();
        endtime = new Date(document.getElementById('end').value).toUTCString();
        machine_clicked = $('#machineClicked').text();
        var datstring = "start=" + starttime + "&end=" + endtime;
        if (mach != '') {
            datstring += "&machine=" + mach;
        }

        $.ajax({url: 'getMachineTimes.php',
                data: datstring,
                dataType: "json",
                complete: InitialRender});

        // $.ajax({url: 'getPieValues.php',
        //         data: datstring,
        //         dataType: "json",
        //         complete: renderPies});
    }
};

$(document).ready(
    function() {
        google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
        google.charts.setOnLoadCallback(drawMultSeries);
        // init global vars
        starttime = new Date(new Date(document.getElementById('start').value).toUTCString());
        endtime = new Date(new Date(document.getElementById('end').value).toUTCString());
        machine_clicked = $('#machineClicked').text();

        chart = $('#chart');
        pie = $('#pie');
        // init charts
        $('#chart').fadeOut(0);
        $('a#log').on('click', makeTable);
        $('button#load').on('click', loadChart);
    }
);
