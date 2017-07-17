google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
google.charts.setOnLoadCallback(drawMultSeries);

var count = 0;
var starttime = null;
var endtime = null;
var machine_clicked = null;

var chart = null;
var pie = null;
var machines = [];

var timeLine = new Object();
timeLine.options = {};
timeLine.chartrange_end = null;
timeLine.Chart = null;

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
    starttime = document.getElementById("start").value;
    endtime = document.getElementById("end").value;
    machine_clicked = document.getElementById("machineClicked").textContent;
    timeLine.options = {
        //width: 1280,
        height: 128 * machines.length,
        timeline: { showBarLabels: false },
        hAxis: {
            viewWindowMode: 'pretty',
            minValue: new Date(starttime),
            maxValue: new Date(endtime),
            format: 'h:mm aa'
        }
    };

    if (new Date(endtime) <= new Date(starttime)) {
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
    starttime = document.getElementById("start").value;
    endtime = document.getElementById("end").value;
    machine_clicked = document.getElementById("machineClicked").textContent;
    timeLine.options = {
        //width: 1280,
        height: 128 * machines.length,
        timeline: { showBarLabels: false },
        hAxis: {
            viewWindowMode: 'pretty',
            minValue: new Date(starttime),
            maxValue: new Date(endtime),
            format: 'h:mm aa'
        }
    };
    timeLine.chartrange_end = timeLine.options.hAxis.maxValue;
    var datstring = "start=" + new Date(starttime).toUTCString() + "&end=" + new Date(endtime).toUTCString();
    if (machine_clicked != '') {
        datstring += "&machine=" + machine_clicked;
    }
    return datstring;
};

var GetNowDatestring = function() {
    var _st = document.getElementById("start").value;
    var _nd = document.getElementById("end").value;

    timeLine.options = {
        //width: 1280,
        height: 128 * machines.length,
        timeline: { showBarLabels: false },
        hAxis: {
            viewWindowMode: 'pretty',
            minValue: new Date(_st),
            maxValue: new Date(_nd),
            format: 'h:mm aa'
        }
    };

    if (new Date(endtime) > new Date()) {
        _nd = new Date();
    }

    var _mc = document.getElementById("machineClicked").textContent;
    timeLine.chartrange_end = timeLine.options.hAxis.maxValue;
    var datstring = "start=" + new Date(_st).toUTCString() + "&end=" + new Date(_nd).toUTCString();
    if (_mc != '') {
        datstring += "&machine=" + _mc;
    }
    return datstring;
};

timeLine.lastEnrtyStopTime = function() {
    var last_entry_stoptime = new Date(new Date(document.getElementById('start').value).toUTCString());
    for (i = 0, j = this.data.og.length; i < j; i++) {
        var val = this.data.og[i].c[3].v;
        if (val > last_entry_stoptime) {
            last_entry_stoptime = val;
        }
    };
    console.log("last Entry: " + last_entry_stoptime);
    return last_entry_stoptime;
};

timeLine.Render = function(response) {
    this.data = data = new google.visualization.DataTable();
    this.data.addColumn({type: 'string', id: 'Machine'});
    this.data.addColumn({type: 'string', id: 'Program'});
    this.data.addColumn({type: 'date', id: 'Start'});
    this.data.addColumn({type: 'date', id: 'End'});

    lastResponse.setValue(response);
    var parsed = lastResponse.value.responseJSON;
    this.data.addRows(arrange_data_with_warning(parsed));

    chart.fadeIn(2000);
    this.Chart = new google.visualization.Timeline(document.getElementById('chart'));
    this.Chart.draw(timeLine.data, timeLine.options);

    var t = setInterval(this.Update, 10000);
    setTimeout(function() { clearInterval(t); }, Math.abs(this.chartrange_end - new Date()));
};

timeLine.Update = function() {
    var now = new Date();
    if (this.chartrange_end > now) {
        var mach = $('#machineClicked').text();
        var datstring = "start=" + this.lastEnrtyStopTime().toUTCString() +
                "&end=" + new Date(this.chartrange_end).toUTCString();

        var reDraw = function(d) {
            if (d.responseJSON.length > 0) {
                lastResponse.setValue(d);
                var jdata = d.responseJSON;
                x = arrange_data(jdata);
                this.data.addRows(x);
                this.Chart.draw(timeLine.data, timeLine.options);
            }
        };

        if (mach != '') {
            datstring += "&machine=" + mach;
        }
        console.log(++count + " Update query: " + datstring);
        $.ajax({url: 'getMachineTimes.php',
                data: datstring,
                dataType: "json",
                complete: reDraw});
    }
};


tables.innerArray = [];

tables.Render = function() {
    tables.Update();
};

tables.Update = function () {
    var raw_data = lastResponse.value.responseJSON;
    var fmt_data = [];
    for(var i = 0; i < machines.length; i++) {
        var data = new google.visualization.DataTable();
        if (document.getElementById("m" + machines[i]) === null) {
            data.addColumn('string', 'Machine', 'Machine');
            data.addColumn('string', 'Program', 'Machine');
            data.addColumn('date', 'Start', 'Start');
            data.addColumn('date', 'End', 'End');
            data.addColumn('string', 'Diff (min:sec)', 'Diff');
            $("#tbls").append("<button type=\"button\" class=\"btn btn-info\" data-toggle=\"collapse\" data-target=\"#m" + machines[i] +
                              "\"></ br>"  + machines[i] +
                              "</button>" +
                              "<div id=\"m" + machines[i] +
                              "\" class=\"collapse\"></div>");
            var tb = new google.visualization.Table(document.getElementById("m" + machines[i]));
            this.innerArray.push({table: tb, dataTable: data});
        } else {
            data = this.innerArray[i].dataTable;
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
        var tbl = this.innerArray[i].table;
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
        input = response.responseJSON;
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
            data: GetNowDatestring(),
            dataType: "json",
            complete: draw});
};

var makeTable = function () {
    var rLog = function(indata) {
        var jdata = indata.responseJSON;
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
                     height: '256px',
                     showRowNumber: false
                 }
                );
    };

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
                data: GetDatestring(),
                dataType: "json",
                complete: InitialRender});
    }
};

$(document).ready(
    function() {
        google.charts.load('current', {packages: ['timeline', 'corechart', 'bar', 'table']});
        google.charts.setOnLoadCallback(drawMultSeries);
        starttime = document.getElementById("start").value;
        endtime = document.getElementById("end").value;
        machine_clicked = document.getElementById("machineClicked").textContent;

        timeLine.options = {
            //width: 1280,
            height: 128 * machines.length,
            timeline: { showBarLabels: false },
            hAxis: {
                viewWindowMode: 'pretty',
                minValue: new Date(starttime),
                maxValue: new Date(endtime),
                format: 'h:mm aa'
            }
        };
        timeLine.chartrange_end = timeLine.options.hAxis.maxValue;

        // init global vars
        chart = $('#chart');
        pie = $('#pie');

        // init charts
        $('#chart').fadeOut(0);
        $('a#log').on('click', makeTable);
        $('button#load').on('click', loadChart);
    }
);
