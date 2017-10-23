var machines;
function makeChart () {
    google.charts.load('current', {packages:['bar']});
    google.charts.setOnLoadCallback(drawChart);

    function arrange_data(indata) {
        res = [['Date', '% Usage', {type: 'string', role: "tooltip", p: {html: true}}]];
        if (!Array.isArray(indata) || indata.length < 1) {
            return res;
        }
        for (i = 0, j = indata.length; i < j; i++) {
            var c = Math.floor((indata[i][1] - 0) * (4095 - 0) /
                               (1 - 0) + 0);
            //if (indata[i][1] != 0)
            res.push([new Date(indata[i][0]), indata[i][1] * 100, '#' + c.toString(16)]);
        }
        console.log(res);
        return res;
    };

    function drawChart() {
        function draw(indata, element) {
            var d_ = arrange_data(indata);
            var data = new google.visualization.arrayToDataTable(d_);
            data.addColumn('string', 'Date');
            data.addColumn('number', '% Usage');
            data.addColumn({type: 'string', role: 'tooltip', p: {html: true}});
            var v_ = new google.visualization.DataView(data);
            v_.setColumns([0, 1, {type: 'string', role: "tooltip", p: {html: true}}]);
            // var options = {
            //     width: 800,
            //     height: 400,
            //     chart: {
            //         title: 'Usage',
            //         subtitle: 'Last 14 Days Efficiency'
            //     },
            //     bars: 'vertical',
            //     colors: ['#12ABCD'],
            //     //everything in options from this point seems to do nothing
            //     series: {
            //         0: { axis: 'usage' }
            //     },
            //     vAxis: {
            //         viewWindow: {
            //             min: 0,
            //             max: 57
            //         },
            //         ticks: [30]
            //     },
            // };
            var options = {
                width: 800,
                height: 400,
                chart: {
                    title: element.id + ' Usage',
                    subtitle: 'Last ' + (d_.length - 1) + ' Days Efficiency'
                },
                tooltip: {isHtml: true},
                // trendlines: {
                //     0: {
                //         type: 'polynomial',
                //         color: 'green',
                //         lineWidth: 3,
                //         opacity: 0.3,
                //         showR2: true,
                //         visibleInLegend: true
                //     }
                // },
                hAxis: {
                    format: 'MM-dd'
                }
            };
            var chart = new google.charts.Bar(element);
            chart.draw(v_, options);
        };

        function allMachines(indata) {
            draw(indata.responseJSON.all, document.getElementById('chart1'));
            machines = indata.responseJSON.machines;
            // machines.forEach(function(m) {
            //     var d = document.getElementById('panel-body');
            //     var nd = document.createElement('div');
            //     nd.id = 'm' + m;
            //     d.appendChild(nd);
            // });
            machines.forEach(function(m) {
                $.ajax({url: 'getEff.php',
                        data: 'machine=' + m,
                        timeout: 5000,
                        complete: (function(indata) {
                            var d = document.getElementById('panel-body');
                            var nd = document.createElement('div');
                            nd.id = 'm' + m;
                            d.appendChild(nd);
                            draw(JSON.parse(indata.responseText)['m' + m], document.getElementById('m' + m));
                        })});
            });
        };

        function notherMachine(indata) {
            var cm = machines.pop();
            draw(indata['m' + cm], document.getElementById(cm));
        };

        $.ajax({url: 'getEff.php',
                dataType: "json",
                timeout: 5000,
                complete: allMachines});

    };
}
