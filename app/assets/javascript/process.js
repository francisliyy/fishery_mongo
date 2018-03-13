$(function() {


	$('#mt1FilePath').change(function () {
	    console.log(this.files[0].mozFullPath);
	});

	$("#process-part").accwizard({		
		onNext:function(parent, panel){
			$panel = $(panel);
			if($panel.prop("id")=='generalinput'){
				console.log('in step1');
				var data = {};
				var time_step = $('input[name=time_step]:checked', '#form-generalinput').val()||'M';
				var start_projection = $("#start_projection").find("input").val()||moment().startOf('month').format('YYYY-MM-DD');
				var short_term_mgt = $("#short_term_mgt").val()||0;
				var short_term_unit = $("#short_term_unit").val()||'Y';
				var long_term_mgt = $("#long_term_mgt").val()||0;
				var long_term_unit = $("#long_term_unit").val()||'Y';
				var stock_per_mgt_unit = $("#stock_per_mgt_unit").val()||0;
				var mixing_pattern = $('input[name=mixing_pattern]:checked', '#form-generalinput').val()||1
				var last_age = $('#last_age').val()||0;
				var no_of_interations = $('#no_of_interations').val()||0;
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step1/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"time_step":time_step,"start_projection":start_projection,
		            "short_term_mgt":short_term_mgt,"short_term_unit":short_term_unit,
		            "long_term_mgt":long_term_mgt,"long_term_unit":long_term_unit,
		            "stock_per_mgt_unit":stock_per_mgt_unit,"mixing_pattern":mixing_pattern,
		            "last_age":last_age,"no_of_interations":no_of_interations},
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step1 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='stockassessment1'){
				console.log('in step2');
				var data = {};
				var unit1to1 = parseFloat($("#unit1to1").val())||0;
				var unit1to2 = parseFloat($("#unit1to2").val())||(100.0-unit1to1);
				var unit2to1 = parseFloat($("#unit2to1").val())||0;
				var unit2to2 = parseFloat($("#unit2to2").val())||(100.0-unit2to1);
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step2/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"unit1to1":unit1to1,"unit1to2":unit1to2,
		            "unit2to1":unit2to1,"unit2to2":unit2to2},
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step2 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='stockassessment2'){
				console.log('in step3');
				var data = {};
				var stock1_model_type = $('input[name=stock1_model_type]:checked', '#form-stockassessment2').val()||'1';
				var stock1_filepath = $("#stock1_filepath").val()||'';
				var stock2_model_type = $('input[name=stock2_model_type]:checked', '#form-stockassessment2').val()||'1';
				var stock2_filepath = $("#stock2_filepath").val()||'';
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step3/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            data: {"stock1_model_type":stock1_model_type,"stock1_filepath":stock1_filepath,
		            "stock2_model_type":stock2_model_type,"stock2_filepath":stock2_filepath},
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step3 successfully");
		                 }
		            }
		        });
			}
		}
	});

    $('#start_projection').datetimepicker({
    	format:'YYYY-MM-DD',
    }).on('dp.change', function(e) {
    	
    });

    $('#fishingStartDate').datetimepicker({
    	format:'YYYY-MM-DD',
    });

    $('#fishingEndDate').datetimepicker({
    	format:'YYYY-MM-DD',
    });

    $("#rnd_seed_file").uploadFile({
		url: $SCRIPT_ROOT+'/prostepview/rndSeedFile/'+$("#step1_id").data("step1id"),
	    maxFileCount: 1,                		   //上传文件个数（多个时修改此处
	    allowedTypes: 'txt',  				       //允许上传的文件式
	    showDone: false,                           //是否显示"Done"(完成)按钮
	    showDelete: true,                          //是否显示"Delete"(删除)按钮
	    showDownload:false,
		downloadCallback:function(){
			$.ajax({
	            cache: false,
	            url: $SCRIPT_ROOT+'/prostepview/rndSeedFile/download/'+$("#step1_id").data("step1id"),
	            type: "GET",
	            responseType : 'blob',
	            success: function(data) 
	            {
	            }
	        });
		},
	    onLoad: function(obj)
	    {

	        //页面加载时，onLoad回调。如果有需要在页面初始化时显示（比如：文件修改时）的文件需要在此方法中处理
	        //obj.createProgress('/tmpImage.jpg');        //createProgress方法可以创建一个已上传的文件
	    },
	    deleteCallback: function(data,pd)
	    {
	        //文件删除时的回调方法。
	        //如：以下ajax方法为调用服务器端删除方法删除服务器端的文件
	        $.ajax({
	            cache: false,
	            url: $SCRIPT_ROOT+'/prostepview/rndSeedFile/'+$("#step1_id").data("step1id"),
	            type: "DELETE",
	            dataType: "json",
	            success: function(data) 
	            {
	                if(!data){
	                    pd.statusbar.hide();        //删除成功后隐藏进度条等
	                 }else{
	                    console.log(data.message);  //打印服务器返回的错误信息
	                 }
	              }
	        }); 
	    },
	    onSuccess: function(files,data,xhr,pd)
	    {
	    	//$(".ajax-file-upload-statusbar").width("600px");
	        //上传成功后的回调方法。本例中是将返回的文件名保到一个hidden类开的input中，以便后期数据处理
	        // if(data&&data.code===0){
	        //     console.log(data);
	        // }
	    }
	});

	$("#table-ibParam").parent('.bootstrap-table').css('margin-bottom', '30px');
	$("#table-ibParam").bootstrapTable({
    	//url: $SCRIPT_ROOT+'/processview/getTableData/',         //请求后台的URL（*）
    	//dataType:'json',
    	//data:result,
        method: 'get',                      //请求方式（*）
        toolbar: '#toolbar',                //工具按钮用哪个容器
        striped: true,                      //是否显示行间隔色
        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: false,                   //是否显示分页（*）
        sortable: false,                     //是否启用排序
        sortOrder: "asc",                   //排序方式
        //queryParams: ibParamTable.queryParams,//传递参数（*）
        sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
        pageNumber:1,                       //初始化加载第一页，默认第一页
        pageSize: 10,                       //每页的记录行数（*）
        pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
        search: false,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
        strictSearch: true,
        showColumns: false,                  //是否显示所有的列
        showRefresh: false,                  //是否显示刷新按钮
        minimumCountColumns: 2,             //最少允许的列数
        clickToSelect: true,                //是否启用点击选中行
        height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
        uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
        showToggle:false,                    //是否显示详细视图和列表视图的切换按钮
        cardView: false,                    //是否显示详细视图
        detailView: false,                   //是否显示父子表
    	columns:[
    		[
    			{
    				title:"East Year",
    				field:"E_Year",
    				editable:false,
    			},
    			{
    				title:"East Observed",
    				field:"E_Observed",
    				editable: {
	                    type: 'text',
	                    title: 'East Observed',
	                    validate: function (v) {
	                        if (isNaN(v)) return 'East Observed must be number';
	                        var stockmean = parseFloat(v);
	                        if (stockmean <= 0) return 'East Observed must larger than 0';
		                }
                    }
    			},
    			{
    				title:"West Year",
    				field:"W_Year",
    				editable:false,
    			},
    			{
    				title:"West Observed",
    				field:"W_Observed",
    				editable:false,
    			},
    		],
    	],
    	onEditableSave: function (field, row, oldValue, $el) {
    		console.log(row);
    		$.ajax({
                type: "post",
                url: $SCRIPT_ROOT+"/processview/editTableData",
                data: row,
                dataType: 'json',
            }).done(function(result) {
            	console.log(result);
            	if(result.status=='1'){
            		alert('submit success');
            	}
            });
    	},
    });

	// $("#mask").addClass('lmask');

 //    $.ajax({
 //    	url: $SCRIPT_ROOT+'/prostepview/getTableData',
 //    	type: 'get',
 //    	dataType: 'JSON',
 //    	data: {param1: 'value1'},
 //    })
 //    .done(function(result) {
    	
 //    })
 //    .fail(function() {
 //    	console.log("error");
 //    })
 //    .always(function() {
 //    	console.log("complete");
 //    	$("#mask").removeClass('lmask');
 //    });

    /*let ibParamTable = new Object();
    //得到查询的参数
    ibParamTable.queryParams = function (params) {
        var temp = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
            limit: params.limit,   //页面大小
            offset: params.offset,  //页码
            departmentname: $("#txt_search_departmentname").val(),
            statu: $("#txt_search_statu").val()
        };
        //return temp;
    };*/

});