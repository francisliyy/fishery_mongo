function drawChart(chartdata){
    var bioChart1 = echarts.init(document.getElementById('bio-chart-1'));
	var sprChart1 = echarts.init(document.getElementById('spr-chart-1'));
	var ssbChart1 = echarts.init(document.getElementById('ssb-chart-1'));
	var fChart1 = echarts.init(document.getElementById('f-chart-1'));

	var comm_xAxisData = [];
    var comm_low_data = [];
    var comm_median_data = [];
    var comm_high_data = [];
    var recr_xAxisData = [];
    var recr_low_data = [];
    var recr_median_data = [];
    var recr_high_data = [];
    var ssb_xAxisData = [];
    var ssb_low_data = [];
    var ssb_median_data = [];
    var ssb_high_data = [];
    var f_xAxisData = [];
    var f_low_data = [];
    var f_median_data = [];
    var f_high_data = [];

    if(chartdata){
    	try {
	        chartdata = JSON.parse(chartdata);
	    } catch (e) {
	    }
		        $.each(chartdata,function(index, el) {
		        	comm_xAxisData.push(el.year);
					comm_low_data.push(el.Catch_comm_025);
					comm_median_data.push(el.Catch_comm_median);
					comm_high_data.push(el.Catch_comm_975);
		        });
				comm_option = {
				    title: {
				        text: 'Commercial Catch'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
				    },
				    legend: {
				        data:['F_std','HL_E','HL_W'],
				        show:false,
				    },
				    grid: {
				        left: '7%',
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
				        data: comm_xAxisData,
				    },
				    yAxis: {
				        type: 'value',
				        name: 'Annual Commercial Catch(mt)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:comm_low_data,
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:comm_median_data
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:comm_high_data,
				            symbol: 'none'

				        }
				    ]
				};
				bioChart1.setOption(comm_option);

		        $.each(chartdata,function(index, el) {
		        	recr_xAxisData.push(el.year);
					recr_low_data.push(el.Catch_recr_025);
					recr_median_data.push(el.Catch_recr_median);
					recr_high_data.push(el.Catch_recr_975);
		        });
				recr_option = {
				    title: {
				        text: 'Recreational Catch'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
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
				        data: recr_xAxisData,
				    },
				    yAxis: {
				        type: 'value',
				        name: 'Annual Catch(mt)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:recr_low_data,
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:recr_median_data
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:recr_high_data,
				            symbol: 'none'

				        }
				    ]
				};
				sprChart1.setOption(recr_option);

				$.each(chartdata,function(index, el) {
		        	ssb_xAxisData.push(el.year);
					ssb_low_data.push(el.SSB_total_025);
					ssb_median_data.push(el.SSB_total_median);
					ssb_high_data.push(el.SSB_total_975);
		        });
				ssb_option = {
				    title: {
				        text: 'Total SSB'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
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
				        data: ssb_xAxisData,
				    },
				    yAxis: {
				        type: 'value',
				        name: 'Stock Spawning Biomass(No. of Eggs)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:ssb_low_data,
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:ssb_median_data
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:ssb_high_data,
				            symbol: 'none'

				        }
				    ]
				};
				ssbChart1.setOption(ssb_option);

				$.each(chartdata,function(index, el) {
		        	f_xAxisData.push(el.year);
					f_low_data.push(el.F_general_025);
					f_median_data.push(el.F_general_median);
					f_high_data.push(el.F_general_975);
		        });
				f_option = {
				    title: {
				        text: 'General F'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
				    },
				    legend: {
				        data:['F_std','HL_E','HL_W'],
				        show:false,
				    },
				    grid: {
				        left: '10%',
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
				        data: f_xAxisData,
				    },
				    yAxis: {
				        type: 'value',
				        name: 'General Annual Fishing Mortality(year \u207B\u00B9)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:f_low_data,
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:f_median_data
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:f_high_data,
				            symbol: 'none'

				        }
				    ]
				};
				fChart1.setOption(f_option);

			}else{

				comm_option = {
				    title: {
				        text: 'Commercial Catch'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
				    },
				    legend: {
				        data:['F_std','HL_E','HL_W'],
				        show:false,
				    },
				    grid: {
				        left: '5%',
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
				        data: [],
				    },
				    yAxis: {
				        type: 'value',
				        name: 'Annual Commercial Catch(mt)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:[],
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:[]
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:[],
				            symbol: 'none'

				        }
				    ]
				};
				bioChart1.setOption(comm_option);

				recr_option = {
				    title: {
				        text: 'Recreational Catch'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
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
				        data: [],
				    },
				    yAxis: {
				        type: 'value',
				        name: 'Annual Catch(mt)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:[],
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:[]
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:[],
				            symbol: 'none'

				        }
				    ]
				};
				sprChart1.setOption(recr_option);

				ssb_option = {
				    title: {
				        text: 'Total SSB'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
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
				        data: [],
				    },
				    yAxis: {
				        type: 'value',
				        name: 'Stock Spawning Biomass(No. of Eggs)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:[],
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:[]
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:[],
				            symbol: 'none'

				        }
				    ]
				};
				ssbChart1.setOption(ssb_option);

				f_option = {
				    title: {
				        text: 'General F'
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
			            formatter: function (params) {
			                return params[0].axisValue + '<br />' + params[2].seriesName+" : "+params[2].value+ '<br />' + params[1].seriesName+" : "+params[1].value+ '<br />'+ params[0].seriesName+" : " + params[0].value;
			            }
				    },
				    legend: {
				        data:['F_std','HL_E','HL_W'],
				        show:false,
				    },
				    grid: {
				        left: '10%',
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
				        data: [],
				    },
				    yAxis: {
				        type: 'value',
				        name: 'General Annual Fishing Mortality(year \u207B\u00B9)',
				    },
				    series: [
				        {
				            name:'Lower 2.5%',
				            type:'line',
				            stack: '1',
				            lineStyle: {
				                normal: {
				                    opacity: 0
				                }
				            },
				            symbol: 'none',
				            data:[],
				        },
				        {
				            name:'Median',
				            type:'line',    
				            lineStyle: {
				                normal: {
				                    
				                }
				            },   
				            showSymbol: false,     
				            data:[]
				        },
				        {
				            name:'Upper 97.5%',
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
				            data:[],
				            symbol: 'none'

				        }
				    ]
				};
				fChart1.setOption(f_option);
			}

}

$(function() {

    var colorChart = echarts.init(document.getElementById('colorChart'));
    var ruleChart = echarts.init(document.getElementById('ruleChart'));
    var colorChartOption = {
    	    color:[ 
			    '#1e90ff'
			], 
		    tooltip : {
		        trigger: 'item',
		        formatter:function(params){
		        	return params.data;
		        }
		    },
		    xAxis : [
		        {
		            type : 'value',
		          min:0,
		            max:2,
		            name:'SSB',
		          axisLabel:{
		            show:true,
		            formatter: function(value){
		              if(value==1) return 'MSSF';
		          },
		          },
		          splitNumber:2,
		          splitLine:{show:true},
		          splitArea:{
		            show:true,
		            areaStyle:{
		                     color: [
		        'rgb(255,0,0,0.5)',    
		        'rgb(77, 255, 0,0.5)',
		  
		    		]}}
		        }
		    ],
		    yAxis : [
		        {
		          type : 'value',
		          name:'F',
		          min:0,
		          max:2,
		          axisLabel:{
		            show:true,
		            formatter: function(value){
		              if(value==1) return 'MFMT';
		            }
		          },
		          splitNumber:2,
		          splitLine:{show:true},
		          splitArea:{
		            show:true,
		             areaStyle:{
		                     color: [
		        'rgb(77, 255, 0,0.5)',
		        'rgb(255,0,0,0.5)', 
		    		]}}
		        }
		    ],
		    series : [
		        {
		          name:'2016',
		          type:'scatter',
		          data:[[1.40854,0.823]],
		          itemStyle:{
		          normal:{
		              label:{
		                show:true,
		                position:'right',
		                formatter:function(params){
		                  return params.seriesName;
		                }
		              }
		            }
                  }
                },
            ]
        };

    var ruleChartOption = {
    	    color:['#87cefa'],
		    tooltip : {
		        trigger: 'axis',
		        formatter:function(params){
		        	return params.data;
		        }
		    },
		    xAxis : [
		        {
		          type : 'value',
		          min:0,
		          max:2,
		          name:'SSB',
		          splitNumber:2,
		          axisLabel:{show:false},
		          axisTick:{show:false},
		          splitLine:{show:false},

		        }
		    ],
		    yAxis : [
		        {
		          type : 'value',
		          name:'F',
		          min:0.03,
		          max:0.08,
		          axisLabel:{show:false},
		          axisTick:{show:false},
		          splitLine:{show:false},		         
		        }
		    ],
		    series : [
		        {
		          type:'line',
		          data:[[0,0.0500],[2,0.0500]],
		          markLine:{
		          	symbol:['none','arrow'],
		          	itemStyle:{normal:{color:'#dc143c'}},
		          	data:[
		          		[
		          		  {name:'',xAxis:0,yAxis:0.0500},
		          		  {name:'',xAxis:2,yAxis:0.0500},
		          		],
		          		[
		          		  {name:'',xAxis:1,yAxis:0.0550},
		          		  {name:'',xAxis:1,yAxis:0.0500},
		          		],
		          		[
		          		  {name:'',xAxis:1,yAxis:0.0450},
		          		  {name:'',xAxis:1,yAxis:0.0500},
		          		]
		          	],
		          },
		          itemStyle:{
		          normal:{
		              areaStyle: {type: 'default'}
		            }
                  },
                  label:{show:true}
                },
                {
		          type:'line',
		          data:[[0,0.0588],[2,0.0588]],
		          label:{show:true}
                },
            ]
        };
    colorChart.setOption(colorChartOption);
    ruleChart.setOption(ruleChartOption);

    $('#ex1').slider({

		formatter: function(value) {

			ruleChartOption.series[0].data=[];
    		ruleChartOption.series[0].data.push([0,value]);
    		ruleChartOption.series[0].data.push([2,value]);
    		ruleChartOption.series[0].markLine.data[0][0].yAxis=value;
    		ruleChartOption.series[0].markLine.data[0][1].yAxis=value;
    		ruleChartOption.series[0].markLine.data[1][0].yAxis=value+0.005;
    		ruleChartOption.series[0].markLine.data[1][1].yAxis=value;
    		ruleChartOption.series[0].markLine.data[2][0].yAxis=value-0.005;
    		ruleChartOption.series[0].markLine.data[2][1].yAxis=value;
    		ruleChart.setOption(ruleChartOption);
    		$("#bio_f_percent").val(parseFloat(value/0.75).toPrecision(3));

			return 'Current value: ' + value;
		}
	});

    var chartdata;
	$.ajax({
    	url: $SCRIPT_ROOT+'/prostepview/getMesResult/'+$("#step1_id").data("step1id"),
    	type: 'get',
    	dataType: 'JSON',
    	data: {},
    })
    .done(function(result) {
    	chartdata = result.resultlist;   	
    })
    .always(function(result){
    	drawChart(chartdata);
    })	

})
