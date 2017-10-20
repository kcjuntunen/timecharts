function makeChart () {
    google.charts.load('current', {'packages':['bar']});
    google.charts.setOnLoadCallback(drawChart);

    function arrange_data(indata) {
        res = [['Date', '% Usage']];
        if (!Array.isArray(indata) || indata.length < 1) {
            return res;
        }
        for (i = 0, j = indata.length; i < j; i++) {
            res.push([indata[i][0], indata[i][1] * 100]);
        }
        return res;
    };

    function drawChart() {
        function draw(indata) {
            var data = new google.visualization.arrayToDataTable(arrange_data(indata.responseJSON));
            var options = {
                width: 800,
                chart: {
                    title: 'Usage',
                    subtitle: 'Last 14 Days Efficiency'
                },
                bars: 'vertical',
                colors: ['#12ABCD'],
                series: {
                    0: { axis: 'usage' }
                },
                vAxis: {
                    format: "#,###.##%"
                }
            };
            var chart = new google.charts.Bar(document.getElementById('chart1'));
            chart.draw(data, options);
        };
        $.ajax({url: 'getEff.php',
                dataType: "json",
                complete: draw});
    };
}
