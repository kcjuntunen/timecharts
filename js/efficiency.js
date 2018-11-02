var machines;
function makeChart () {
	google.charts.load('current', {packages:['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	function arrange_data(indata) {
		res= [[{id: 'Date', label: 'Date', type: 'date'}, {id: 'Usage', label: 'Usage', type: 'number'}]];
		if (!Array.isArray(indata) || indata.length < 1) {
			return res;
		}
		for (i = 0, j = indata.length; i < j; i++) {
			if (indata[i][1] != 0) {
				res.push([new Date(indata[i][0]), indata[i][1]]);
			}
		}
		return res;
	};

	function drawChart() {
		function draw(indata, element) {
			var d_ = arrange_data(indata);
			var data = new google.visualization.arrayToDataTable(d_);
			var formatter = new google.visualization.NumberFormat({pattern: '#,###.#%'});
			formatter.format(data, 1);
			var v_ = new google.visualization.DataView(data);
			var options = {
				height: 300,
				seriesType: 'bars',
				series: {
					1: {
						type: 'line'
					}
				},
				chart: {
					title: element.id.replace('m', '').replace('chart1', 'All machine') + ' usage',
					subtitle: 'Last ' + (d_.length - 1) + ' days'
				},
				trendlines: { 0: {
					type: 'linear',
					lineWidth: 4
				}},
				tooltip: {isHtml: true},
				legend: { position: 'none'},
				hAxis: {
					title: 'Date',
					format: 'MM-dd'
				},
				vAxis : {
					viewWindow: {
						max: 1
					},
					title: '% usage',
					minValue: 0,
					maxValue: 1,
					format: '#%' }
			};
			$(element).fadeIn(5000);
			var chart = new google.visualization.ComboChart(element);
			chart.draw(v_, options);
		};

		function allMachines(indata) {
			if (indata.responseJSON == undefined) {
					return;
			}
			draw(indata.responseJSON.all, document.getElementById('chart1'));
			machines = indata.responseJSON.machines;
			machines.forEach(function(m) {
				$.ajax({url: 'getEff.php',
						data: 'machine=' + m,
						timeout: 5000,
						complete: (function(indata) {
							var d = document.getElementById('barcharts');
							var nd = document.createElement('div');
							var panel = document.createElement('div');
							var heading = document.createElement('div');
							heading.className = "panel-heading";
							heading.innerHTML = m + ' usage <span class="comment">(Last ' + (15 - 1) + ' days)</span>';
							panel.className = "panel panel-default";
							panel.appendChild(heading);
							nd.id = 'm' + m;
							nd.className = 'chart';
							panel.appendChild(nd);
							$(nd).fadeOut(0);
							d.appendChild(panel);
							jn = JSON.parse(indata.responseText);
							if (jn['m' + m] != undefined)
								draw(jn['m' + m], document.getElementById('m' + m));
						})});
			});
		};

		function notherMachine(indata) {
			var cm = machines.pop();
			draw(indata['m' + cm], document.getElementById(cm));
		};

		$.ajax({url: 'getEff.php',
				dataType: "json",
				timeout: 10000,
				complete: allMachines});

	};
}
