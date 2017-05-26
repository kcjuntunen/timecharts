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
            // console.log(indata);
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

            total_idle_time = new Date(indata[indata.length - 1][2].replace(/-/gi, '/')) - new Date(indata[0][3].replace(/-/gi, '/'));
            //tit = getTotalIdleTime(new Date(indata[0][3].replace(/-/gi, '/')), new Date(indata[indata.length - 1][2].replace(/-/gi, '/')));
            //console.log(tit);
            $("#tbls").html("");
            var diff = 0;
            for (var i = 0, d = indata.length; i < d; i++) {
                if (!machines.includes(indata[i][0])) {
                    machines.push(indata[i][0]);
                }
                // // console.log(new Date(indata[i][2]));
                res.push([indata[i][0], indata[i][1],
                          new Date(indata[i][2].replace(/-/gi, '/')),
                          new Date(indata[i][3].replace(/-/gi, '/'))]);
                if (indata[i][3] && indata[i][2]) {
                    diff = new Date(indata[i][3].replace(/-/gi, '/')) - new Date(indata[i][2].replace(/-/gi, '/'));
                }
                if (indata[i][1].search('Setup') > -1) {
                    total_setup_time += diff;
                    total_idle_time -=diff;
                } else {
                    total_cycle_time += diff;
                    total_idle_time -= diff;
                }
            }
            // console.log(res);
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
        // This, unfortunately, doesn't seem to do anything.
        var dfmt = new google.visualization.DateFormat({ pattern: 'MMM d, yyyy h:mm:ss aa' });

        data.addColumn({type: 'string', id: 'Machine'});
        data.addColumn({type: 'string', id: 'Program'});
        data.addColumn({type: 'date', id: 'Start'});
        data.addColumn({type: 'date', id: 'End'});
        data.addRows(arrdata(jdata["data"]));
        dfmt.format(data, 2);
        dfmt.format(data, 3);
        /* // console.log(JSON.stringify(data));*/
        $("#chart").fadeIn(2000);
        var ch = document.getElementById('chart');
        var chart = new google.visualization.Timeline(ch);
        var options = {timeline: { width: 1280, height: 128 * machines.length, showBarLabels: false }};
        chart.draw(data, options);
        var piedata = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Setup', total_setup_time/(1000 * 60)],
            ['Cycle', total_cycle_time/(1000 * 60)],
            ['Idle',  total_idle_time/(1000 * 60)]
        ]);

        var pie_options = {
            title: 'Selected Range',
            colors: ['#f3f01e', '#108a00', '#e60000' ],
            is3D: true
        };

        $('#pie').fadeIn(2000);
        var pie = document.getElementById('pie');
        var pie_chart = new google.visualization.PieChart(pie);
        pie_chart.draw(piedata, pie_options);
        ////////////////////////////////////////////////////////////////////////////////
        var piedata2 = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Setup', (13 * 5)/(1000 * 60)],
            ['Cycle', (121 * 5)/(1000 * 60)],
            ['Idle',  ((480 * 5) - (121 * 5) - (13 * 5))/(1000 * 60)]
        ]);

        var pie_options2 = {
            title: 'Last Week',
            colors: ['#f3f01e', '#108a00', '#e60000' ],
            is3D: true
        };

        $('#pie2').fadeIn(2000);
        var pie2 = document.getElementById('pie2');
        var pie_chart2 = new google.visualization.PieChart(pie2);
        pie_chart2.draw(piedata2, pie_options2);
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
                    // console.log("push" + jdata["data"][j][0]);
                    // console.log("length = " + fmt_data.length);
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
    var datstring = "start=" + strt + "&end=" + nd;
    if (mach != '') {
        datstring += "&machine=" + mach;
    }

    $.ajax({url: 'getMachineTimes.php',
            data: datstring,
            dataType: "json",
            complete: succeed});
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
}

var loadChart = function() {
    var chart = $('#chart');
    var pie = $('#pie');
    chart.fadeOut(0);
    pie.fadeOut(0);
    var starttime = new Date(new Date(document.getElementById('start').value).toUTCString());
    var endtime = new Date(new Date(document.getElementById('end').value).toUTCString());
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
