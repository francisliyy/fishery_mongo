$(function() {
	

	var barChart = echarts.init(document.getElementById('barChart'));
	var radarChart = echarts.init(document.getElementById('radarChart'));

	var mseNames = $("#cmpDiv").data("msenames");
	var greenMeans = $("#cmpDiv").data("greenmeans");
	var totalCatchs = $("#cmpDiv").data("totalcatchs");
	var catchVars = $("#cmpDiv").data("catchvars");
	var terminalSSBs = $("#cmpDiv").data("terminalssbs");
	var lowestSSBs = $("#cmpDiv").data("lowestssbs");

	barOption = {
	    xAxis: {
	        type: 'category',
	        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	    },
	    yAxis: {
	        type: 'value'
	    },
	    series: [{
	        data: [120, 200, 150, 80, 70, 110, 130],
	        type: 'bar'
	    }]
	};

	radarOption = {
	    title: {
	        text: ''
	    },
	    tooltip: {},
	    legend: {
	        data: mseNames,
	        left:'5%',
	        top:'2%'
	    },
	    radar: {
	        // shape: 'circle',
	        name: {
	            textStyle: {
	                color: '#fff',
	                backgroundColor: '#999',
	                borderRadius: 3,
	                padding: [3, 5]
	           }
	        },
	        indicator: [
	           { name: 'Year_to_green_mean', max: 100},
	           { name: 'total_catch_MSEcomp', max: 30000},
	           { name: 'catch_var_MSEcomp', max: 1000},
	           { name: 'terminal_SSB_MSEcomp', max: 70000000000},
	           { name: 'lowest_SSB_MSEcomp', max: 70000000000}
	        ]
	    },
	    series: [{
	        name: 'Budget vs spending',
	        type: 'radar',
	        // areaStyle: {normal: {}},
	        data : []
	    }]
	};

	var radarDataArry = [];
	for(var i=0;i<mseNames.length;i++){
		var seriesData = {};
		seriesData.name = mseNames[i];
		seriesData.value = [];
		seriesData.value.push(greenMeans[i]);
		seriesData.value.push(totalCatchs[i]);
		seriesData.value.push(catchVars[i]);
		seriesData.value.push(terminalSSBs[i]);
		seriesData.value.push(lowestSSBs[i]);
		radarDataArry.push(seriesData);
	}
	radarOption.series[0].data = radarDataArry;

	barChart.setOption(barOption);
	radarChart.setOption(radarOption);

})