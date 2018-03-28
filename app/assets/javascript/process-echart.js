$(function() {

	var bioChart1 = echarts.init(document.getElementById('bio-chart-1'));
	var sprChart1 = echarts.init(document.getElementById('spr-chart-1'));

	$.ajax({
		url: $SCRIPT_ROOT+'/prostepview/getEchartData',
		type: 'GET',
	})
	.done(function(edata) {
		var xAxisData = [];
        var F_std_data = [];
        var HL_E_data = [];
        var HL_W_data = [];
        $.each(edata,function(index, el) {
        	xAxisData.push(el.Yr);
			F_std_data.push(el.F_std);
			HL_E_data.push(el.HL_E);
			HL_W_data.push(el.HL_W);
        });
		option = {
		    title: {
		        text: 'Ending year expected growth(with 95% intervals)'
		    },
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
	                type: 'cross',
	                animation: false,
	                label: {
	                    backgroundColor: '#ccc',
	                    borderColor: '#aaa',
	                    borderWidth: 1,
	                    shadowBlur: 0,
	                    shadowOffsetX: 0,
	                    shadowOffsetY: 0,
	                    textStyle: {
	                        color: '#222'
	                    }
	                }
	            },
		    },
		    legend: {
		        data:['F_std','HL_E','HL_W'],
		        show:false,
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {title:'saveAsImage'}
		        }
		    },
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: xAxisData,
		    },
		    yAxis: {
		        type: 'value'
		    },
		    series: [
		        {
		            name:'F_std',
		            type:'line',
		            stack: '1',
		            lineStyle: {
		                normal: {
		                    opacity: 0
		                }
		            },
		            symbol: 'none',
		            data:F_std_data,
		        },
		        {
		            name:'HL_E',
		            type:'line',    
		            lineStyle: {
		                normal: {
		                    
		                }
		            },   
		            showSymbol: false,     
		            data:HL_E_data
		        },
		        {
		            name:'HL_W',
		            type:'line',
		            stack: '1',
		            lineStyle: {
		                normal: {
		                    opacity: 0
		                }
		            },
		            areaStyle: {
		                normal: {
		                    color: '#ccc',
		                    shadowColor: 'rgba(0, 0, 0, 0.5)',
		                }
		            },
		            data:HL_W_data,
		            symbol: 'none'

		        }
		    ]
		};
		bioChart1.setOption(option);
	});

	$.ajax({
		url: $SCRIPT_ROOT+'/prostepview/getEchartData',
		type: 'GET',
	})
	.done(function(edata) {
		var xAxisData = [];
        var F_std_data = [];
        $.each(edata,function(index, el) {
        	xAxisData.push(el.Yr);
			F_std_data.push(el.F_std);
        });
		option = {
		    title: {
		        text: ''
		    },
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
	                type: 'cross',
	                animation: false,
	                label: {
	                    backgroundColor: '#ccc',
	                    borderColor: '#aaa',
	                    borderWidth: 1,
	                    shadowBlur: 0,
	                    shadowOffsetX: 0,
	                    shadowOffsetY: 0,
	                    textStyle: {
	                        color: '#222'
	                    }
	                }
	            },
		    },
		    legend: {
		        data:['F_std'],
		        show:false,
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {title:'saveAsImage'}
		        }
		    },
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: xAxisData,
		    },
		    yAxis: {
		        type: 'value',		        
		        splitLine:{show:false},
		    },
		    series: [
		        {
		            name:'F_std',
		            type:'line',
		            lineStyle: {
		                normal: {
		                    
		                }
		            },
		            showAllSymbol: true,
		            data:F_std_data,
		            markLine: {
		                data: [
		                    {type: 'average', name: 'average'}
		                ]
		            }
		        }
		    ]
		};
		sprChart1.setOption(option);
	});

	

})
