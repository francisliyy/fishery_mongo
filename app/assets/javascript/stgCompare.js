$(function() {
	

	var barChart = echarts.init(document.getElementById('barChart'));
	var radarChart = echarts.init(document.getElementById('radarChart'));

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
	        data: ['Allocated Budget'],
	        left:'10%',
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
	           { name: 'sales', max: 6500},
	           { name: 'Administration', max: 16000},
	           { name: 'Information Techology', max: 30000},
	           { name: 'Customer Support', max: 38000},
	           { name: 'Development', max: 52000},
	           { name: 'Marketing', max: 25000}
	        ]
	    },
	    series: [{
	        name: 'Budget vs spending',
	        type: 'radar',
	        // areaStyle: {normal: {}},
	        data : [
	            {
	                value : [4300, 10000, 28000, 35000, 50000, 19000],
	                name : 'Allocated Budget'
	            }
	        ]
	    }]
	};

	barChart.setOption(barOption);
	radarChart.setOption(radarOption);

})