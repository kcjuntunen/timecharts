function makeChart () {
    google.charts.load('current', {packages:['bar']});
    google.charts.setOnLoadCallback(drawChart);

    function arrange_data(indata) {
        res = [['Date', '% Usage', {"role": "style"}]];
        if (!Array.isArray(indata) || indata.length < 1) {
            return res;
        }
        for (i = 0, j = indata.length; i < j; i++) {
            var c = Math.floor((indata[i][1] - 0) * (4095 - 0) /
                               (1 - 0) + 0);
            res.push([indata[i][0], indata[i][1] * 100, '#' + c.toString(16)]);
        }
        console.table(res);
        return res;
    };

    function drawChart() {
        function draw(indata) {
            var d_ = arrange_data(indata.responseJSON);
            var data = new google.visualization.arrayToDataTable(d_);
            var v_ = new google.visualization.DataView(data);
            v_.setColumns([0, 1, {role: "style"}]);
            var options = {
                width: 800,
                height: 400,
                chart: {
                    title: 'Usage',
                    subtitle: 'Last 14 Days Efficiency'
                },
                bars: 'vertical',
                //colors: ['#12ABCD'],
                //everything in options from this point seems to do nothing
                series: {
                    0: { axis: 'usage' }
                },
                vAxis: {
                    viewWindow: {
                        min: 0,
                        max: 57
                    },
                    ticks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
                },
                hAxis: {
                    viewWindow: {
                        min: 0,
                        max: 57
                    },
                    ticks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
                }
            };
            var chart = new google.charts.Bar(document.getElementById('chart1'));
            chart.draw(v_, options);
        };
        $.ajax({url: 'getEff.php',
                dataType: "json",
                complete: draw});
    };
}
