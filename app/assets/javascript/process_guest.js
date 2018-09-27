$(function() {

	$('#mt1FilePath').change(function () {
	    console.log(this.files[0].mozFullPath);
	});

	$("#form-stockassessment").validate({
		ignore:"input[type=file]",
		rules: {
	      // no quoting necessary
	      stock1_model_type:{
	      	required: true,
	      },  
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest("div"));
		}
	});

	$("#form-generalinput").validate({
	 	ignore:"input[type=file]",
	    rules: {
	      // no quoting necessary
	      time_step:{
	      	required: true,
	      },
	      short_term_mgt:{
	      	required: true,
	      	digits:true,
	      },
	      long_term_mgt:{
	      	required: true,
	      	digits:true,
	      },
	      stock_per_mgt_unit:{
	      	required: true,
	      	digits:true,
	      },	
	      mixing_pattern:{
	      	required: true,
	      },	       
	      last_age:{
	      	required: true,
	      	digits:true,
	      },
	      no_of_interations:{
	      	required: true,
	      	digits:true,
	      },       
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest(".form-group") );
		}
	});

	$("#form-naturalmortality").validate({
		rules: {
	      // no quoting necessary
	      
	      simple_mean:{
	      	required: true,
	      	number:true,
	      },
	      simple_cv:{
	      	required: true,
	      	number:true,
	      	max:100,
	      },
	      simple_spawning:{
	      	required: true,
	      	number:true,
	      }       
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest(".form-group"));
		}
	});

	$("#form-recruitment").validate({
	    rules: {
	      // part1
	      recruitTypeStock1:{
	      	required: true,
	      },
	      hst1_lower:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_median:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_mean:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_upper:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst1_other:{
	      	required: true,
	      	number:true,
	      	max:100,
	      },
	      hst1_cal:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      }, 
	      recruitTypeStock2:{
	      	required: true,
	      },    
	      hst2_lower:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst2_median:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst2_mean:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst2_upper:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      hst2_other:{
	      	required: true,
	      	number:true,
	      	max:100,
	      },
	      hst2_cal:{
	      	required: true,
	      	number:true,
	      	max:99999999,
	      },
	      //part2
	      formulaStock1:{
	      	required: true,
	      },
	      formulaStock2:{
	      	required: true,
	      },
	      fml1Bmalpha1:{
	      	required: true,
	      	number:true,
	      },
	      fml1Bmbeta1:{
	      	required: true,
	      	number:true,
	      },
	      fml2Bmalpha1:{
	      	required: true,
	      	number:true,
	      },
	      fml2Bmbeta1:{
	      	required: true,
	      	number:true,
	      },
	      fml1Rmalpha1:{
	      	required: true,
	      	number:true,
	      },
	      fml1Rmbeta1:{
	      	required: true,
	      	number:true,
	      },
	      fml2Rmalpha1:{
	      	required: true,
	      	number:true,
	      },
	      fml2Rmbeta1:{
	      	required: true,
	      	number:true,
	      },
	      fml1MbhmSSB0:{
	      	required: true,
	      	number:true,
	      },
	      fml1MbhmR0:{
	      	required: true,
	      	number:true,
	      },
	      fml2MbhmSSB0:{
	      	required: true,
	      	number:true,
	      },
	      fml2MbhmR0:{
	      	required: true,
	      	number:true,
	      },
	      fml1MbhmSteep:{
	      	required: true,
	      	number:true,
	      },
	      fml2MbhmSteep:{
	      	required: true,
	      	number:true,
	      },
	      //part3
	      auto1R0:{
	      	required: true,
	      	number:true,
	      },
	      auto1h:{
	      	required: true,
	      	number:true,
	      },
	      auto1Rave:{
	      	required: true,
	      	number:true,
	      },
	      auto2R0:{
	      	required: true,
	      	number:true,
	      },
	      auto2h:{
	      	required: true,
	      	number:true,
	      },
	      auto2Rave:{
	      	required: true,
	      	number:true,
	      },
	      cv1Recruit:{
	      	required: true,
	      	number:true,
	      },
	      cv2Recruit:{
	      	required: true,
	      	number:true,
	      },
	    },
	    messages:{
	    	recruitTypeStock1:{
	    		//required: "Stock 1 recruit type is required",
	    	},
	    	recruitTypeStock2:{
	    		//required: "Stock 2 recruit type is required",
	    	},

	    },
	    errorPlacement: function(error, element) {
	    	error.appendTo( element.closest("div") );	    
		}
	});

	$("#form-mgtopt1").validate({
		rules: {
	      // no quoting necessary
	      bio_biomass_points:{
	      	required: true,
	      	number:true,
	      },
	      bio_catch_mt:{
	      	required: true,
	      	number:true,
	      },
	      bio_f_percent:{
	      	required: true,
	      	number:true,
	      },
	      hrt_threshold1:{
	      	required: true,
	      	number:true,
	      },
	      hrt_threshold2:{
	      	required: true,
	      	number:true,
	      },  
	      hst_catch_thh1:{
	      	required: true,
	      	number:true,
	      },
	      hst_catch_thh2:{
	      	required: true,
	      	number:true,
	      },     
	      hst_f_thh1:{
	      	required: true,
	      	number:true,
	      },
	      hst_f_thh2:{
	      	required: true,
	      	number:true,
	      }, 
	    },
	    errorPlacement: function(error, element) {
		    error.appendTo( element.closest("div"));
		}
	});

	$("#form-mgtopt2").validate({
		rules: {
	      // no quoting necessary
	      sec_recreational:{
	      	required: true,
	      	number:true,
	      },
	      sec_commercial:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_stock_0:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_fleet_0:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_allocation_0:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_stock_1:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_fleet_1:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_allocation_1:{
	      	required: true,
	      	number:true,
	      },  
	      fleet_rec_stock_2:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_fleet_2:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_allocation_2:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_stock_3:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_fleet_3:{
	      	required: true,
	      	number:true,
	      },
	      fleet_rec_allocation_3:{
	      	required: true,
	      	number:true,
	      },	
	      fleet_com_stock_0:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_fleet_0:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_allocation_0:{
	        required: true,
	      	number:true,
	      },       
	      fleet_com_stock_1:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_fleet_1:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_allocation_1:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_stock_2:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_fleet_2:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_allocation_2:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_stock_3:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_fleet_3:{
	        required: true,
	      	number:true,
	      },
	      fleet_com_allocation_3:{
	        required: true,
	      	number:true,
	      }, 
	      fishingStartDateTxt:{
	      	required: true,
	      },
	      fishingEndDateTxt:{
	      	required: true,
	      },
	    },
	    messages:{
	    	fishingStartDateTxt:{
	    		required: "Field Start is required",
	    	},
	    	fishingEndDateTxt:{
	    		required: "Field End is required",
	    	}
	    },
	    errorPlacement: function(error, element) {
	    	if(element[0].id=="fishingStartDateTxt"||element[0].id=="fishingEndDateTxt"){
	    		error.appendTo( element.closest(".form-group"));
	    	}else{
	    		error.appendTo( element.closest("div"));
	    	}		    
		}
	});

	$("#form-mgtopt3").validate({
		rules: {
	      // no quoting necessary
	      ratio_rec_stock_0:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_state_0:{
	      	required: true,
	      },
	      ratio_rec_ratio_0:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_stock_0:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_state_0:{
	      	required: true,
	      },
	      ratio_com_ratio_0:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_stock_1:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_state_1:{
	      	required: true,
	      },
	      ratio_rec_ratio_1:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_stock_1:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_state_1:{
	      	required: true,
	      },
	      ratio_com_ratio_1:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_stock_2:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_state_2:{
	      	required: true,
	      },
	      ratio_rec_ratio_2:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_stock_2:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_state_2:{
	      	required: true,
	      },
	      ratio_com_ratio_2:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_stock_3:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_state_3:{
	      	required: true,
	      },
	      ratio_rec_ratio_3:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_stock_3:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_state_3:{
	      	required: true,
	      },
	      ratio_com_ratio_3:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_stock_4:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_state_4:{
	      	required: true,
	      },
	      ratio_rec_ratio_4:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_stock_4:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_state_4:{
	      	required: true,
	      },
	      ratio_com_ratio_4:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_stock_5:{
	      	required: true,
	      	number:true,
	      },
	      ratio_rec_state_5:{
	      	required: true,
	      },
	      ratio_rec_ratio_5:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_stock_5:{
	      	required: true,
	      	number:true,
	      },
	      ratio_com_state_5:{
	      	required: true,
	      },
	      ratio_com_ratio_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_stock_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_fleet_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_oc_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_ratio_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_stock_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_fleet_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_oc_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_ratio_0:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_stock_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_fleet_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_oc_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_ratio_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_stock_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_fleet_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_oc_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_ratio_1:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_stock_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_fleet_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_oc_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_ratio_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_stock_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_fleet_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_oc_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_ratio_2:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_stock_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_fleet_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_oc_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_ratio_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_stock_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_fleet_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_oc_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_ratio_3:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_stock_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_fleet_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_oc_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_ratio_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_stock_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_fleet_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_oc_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_ratio_4:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_stock_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_fleet_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_oc_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_rec_ratio_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_stock_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_fleet_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_oc_5:{
	      	required: true,
	      	number:true,
	      },
	      discard_com_ratio_5:{
	      	required: true,
	      	number:true,
	      },
	    },
	    messages:{
	    },
	    errorPlacement: function(error, element) {
	    	error.appendTo( element.closest("div"));	   		    
		}
	});

	$("#process-part").accwizard({		
		onNext:function(parent, panel){
			$panel = $(panel);
			if($panel.prop("id")=='generalinput'){
				
			}else if($panel.prop("id")=='stockassessment'){
				
			}else if($panel.prop("id")=='ibParam'){
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step4/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify($("#table-ibParam").bootstrapTable('getData')),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step4 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='bioParam'){
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step5/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify($("#table-bioParam").bootstrapTable('getData')),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step5 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='naturalmortality'){				
				var inputdata = {};
				var simple_spawning = parseFloat($("#simple_spawning").val())||0;
					inputdata =JSON.stringify({"mortality_complexity":2,
		            "simple_spawning":simple_spawning,mortality:$("#table-mortality").bootstrapTable('getData')});	
				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step6/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: inputdata,
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     
		                 }
		            }
		        });
			}else if($panel.prop("id")=='recruitment'){
				console.log('in step7');
				var data = {};
				if(!$("#form-recruitment").valid()){
					return false;
				};

				//stock1				
				var recruitTypeStock1 = $('input[name=recruitTypeStock1]:checked', '#form-recruitment').val()||'0';

				var historySt1 = $('input[name=historySt1]:checked', '#form-recruitment').val()||'0';
				var hst1_lower = $("#hst1_lower:enabled").val()||0;
				var hst1_median = $("#hst1_median:enabled").val()||0;
				var hst1_mean = $("#hst1_mean:enabled").val()||0;
				var hst1_upper = $("#hst1_upper:enabled").val()||0;
				var hst1_other = $('#hst1_other:enabled').val()||0;
				var hst1_cal = $('#hst1_cal:enabled').val()||0;

				var formulaStock1 = $('input[name=formulaStock1]:checked', '#form-recruitment').val()||'0';
				var fml1Bmalpha1 = $("#fml1Bmalpha1:enabled").val()||0;
				var fml1Bmbeta1 = $("#fml1Bmbeta1:enabled").val()||0;
				var fml1Rmalpha1 = $("#fml1Rmalpha1:enabled").val()||0;
				var fml1Rmbeta1 = $("#fml1Rmbeta1:enabled").val()||0;
				var fml1MbhmSSB0 = $("#fml1MbhmSSB0:enabled").val()||0;
				var fml1MbhmR0 = $("#fml1MbhmR0:enabled").val()||0;
				var fml1MbhmSteep = $("#fml1MbhmSteep:enabled").val()||0;

				var auto1R0 = $("#auto1R0:enabled").val()||0;
				var auto1h = $("#auto1h:enabled").val()||0;
				var auto1Rave = $("#auto1Rave:enabled").val()||0;

				var cv1Recruit = $("#cv1Recruit:enabled").val()||0;

				//stock2
				var recruitTypeStock2 = $('input[name=recruitTypeStock2]:checked', '#form-recruitment').val()||'0';
				
				var historySt2 = $('input[name=historySt2]:checked', '#form-recruitment').val()||'0';
				var hst2_lower = $("#hst2_lower:enabled").val()||0;
				var hst2_median = $("#hst2_median:enabled").val()||0;
				var hst2_mean = $("#hst2_mean:enabled").val()||0;
				var hst2_upper = $("#hst2_upper:enabled").val()||0;
				var hst2_other = $('#hst2_other:enabled').val()||0;
				var hst2_cal = $('#hst2_cal:enabled').val()||0;

				var formulaStock2 = $('input[name=formulaStock2]:checked', '#form-recruitment').val()||'0';
				var fml2Bmalpha1 = $("#fml2Bmalpha1:enabled").val()||0;
				var fml2Bmbeta1 = $("#fml2Bmbeta1:enabled").val()||0;
				var fml2Rmalpha1 = $("#fml2Rmalpha1:enabled").val()||0;
				var fml2Rmbeta1 = $("#fml2Rmbeta1:enabled").val()||0;
				var fml2MbhmSSB0 = $("#fml2MbhmSSB0:enabled").val()||0;
				var fml2MbhmR0 = $("#fml2MbhmR0:enabled").val()||0;
				var fml2MbhmSteep = $("#fml2MbhmSteep:enabled").val()||0;

				var auto2R0 = $("#auto2R0:enabled").val()||0;
				var auto2h = $("#auto2h:enabled").val()||0;
				var auto2Rave = $("#auto2Rave:enabled").val()||0;

				var cv2Recruit = $("#cv2Recruit:enabled").val()||0;

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step7/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({'recruitTypeStock1':recruitTypeStock1,'historySt1':historySt1,'hst1_lower':hst1_lower,'hst1_median':hst1_median,
		        'hst1_mean':hst1_mean,'hst1_upper':hst1_upper,'hst1_other':hst1_other,'hst1_cal':hst1_cal,'formulaStock1':formulaStock1,
		        'fml1Bmalpha1':fml1Bmalpha1,'fml1Bmbeta1':fml1Bmbeta1,'fml1Rmalpha1':fml1Rmalpha1,'fml1Rmbeta1':fml1Rmbeta1,
		        'fml1MbhmSSB0':fml1MbhmSSB0,'fml1MbhmR0':fml1MbhmR0,'fml1MbhmSteep':fml1MbhmSteep,'auto1R0':auto1R0,'auto1h':auto1h,
		        'auto1Rave':auto1Rave,'cv1Recruit':cv1Recruit,'recruitTypeStock2':recruitTypeStock2,'historySt2':historySt2,'hst2_lower':hst2_lower,'hst2_median':hst2_median,
		        'hst2_mean':hst2_mean,'hst2_upper':hst2_upper,'hst2_other':hst2_other,'hst2_cal':hst2_cal,'formulaStock2':formulaStock2,
		        'fml2Bmalpha1':fml2Bmalpha1,'fml2Bmbeta1':fml2Bmbeta1,'fml2Rmalpha1':fml2Rmalpha1,'fml2Rmbeta1':fml2Rmbeta1,
		        'fml2MbhmSSB0':fml2MbhmSSB0,'fml2MbhmR0':fml2MbhmR0,'fml2MbhmSteep':fml2MbhmSteep,'auto2R0':auto2R0,'auto2h':auto2h,
		        'auto2Rave':auto2Rave,'cv2Recruit':cv2Recruit}),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step7 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='mgtopt1'){
				console.log('in step8');
				if(!$("#form-mgtopt1").valid()){
					return false;
				};
				var data = {};

				var bio_biomass_points = $("#bio_biomass_points").val()||0;

				var bio_harvest_radio = $('input[name=bio_harvest_radio]:checked', '#form-mgtopt1').val()||'C';
				var bio_catch_mt = $("#bio_catch_mt:enabled").val()||0;
				var bio_f_percent = $("#bio_f_percent:enabled").val()||0;

				var hrt_harvest_rule = $('input[name=hrt_harvest_rule]:checked', '#form-mgtopt1').val()||'CC';
				var hrt_threshold1 = $("#hrt_threshold1").val()||0;
				var hrt_threshold2 = $("#hrt_threshold2").val()||0;

				var hrt_harvest_radio = $('input[name=hrt_harvest_radio]:checked', '#form-mgtopt1').val()||'C';
				var hst_catch_thh1 = $("#hst_catch_thh1:enabled").val()||0;
				var hst_catch_thh2 = $("#hst_catch_thh2:enabled").val()||0;
				var hst_f_thh1 = $("#hst_f_thh1:enabled").val()||0;
				var hst_f_thh2 = $('#hst_f_thh2:enabled').val()||0;

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step8/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: JSON.stringify({'bio_biomass_points':bio_biomass_points,'bio_harvest_radio':bio_harvest_radio,'bio_catch_mt':bio_catch_mt,
		        'bio_f_percent':bio_f_percent,'hrt_harvest_rule':hrt_harvest_rule,'hrt_threshold1':hrt_threshold1,'hrt_threshold2':hrt_threshold2,
		        'hrt_harvest_radio':hrt_harvest_radio,'hst_catch_thh1':hst_catch_thh1,'hst_catch_thh2':hst_catch_thh2,'hst_f_thh1':hst_f_thh1,
		        'hst_f_thh2':hst_f_thh2}),
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step8 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='mgtopt2'){
				console.log("in step9");
				if(!$("#form-mgtopt2").valid()){
					return false;
				};
				var inputdata = {};
				var sec_recreational = $("#sec_recreational").val()||0;
				var sec_commercial = $("#sec_commercial").val()||0;
				var fishingStartDate = $("#fishingStartDate").find("input").val()||moment().startOf('month').format('YYYY-MM-DD');
				var fishingEndDate = $("#fishingEndDate").find("input").val()||moment().startOf('month').format('YYYY-MM-DD');
				var fleet_rec_stock = [{'stock':$("#fleet_rec_stock_0").val()||'','fleet':$("#fleet_rec_fleet_0").val()||'','allocation':$("#fleet_rec_allocation_0").val()||0},
									   {'stock':$("#fleet_rec_stock_1").val()||'','fleet':$("#fleet_rec_fleet_1").val()||'','allocation':$("#fleet_rec_allocation_1").val()||0},
									   {'stock':$("#fleet_rec_stock_2").val()||'','fleet':$("#fleet_rec_fleet_2").val()||'','allocation':$("#fleet_rec_allocation_2").val()||0},
									   {'stock':$("#fleet_rec_stock_3").val()||'','fleet':$("#fleet_rec_fleet_3").val()||'','allocation':$("#fleet_rec_allocation_3").val()||0}									   
									  ];
				var fleet_com_stock = [{'stock':$("#fleet_rec_stock_0").val()||'','fleet':$("#fleet_rec_fleet_0").val()||'','allocation':$("#fleet_rec_allocation_0").val()||0},
									   {'stock':$("#fleet_com_stock_1").val()||'','fleet':$("#fleet_com_fleet_1").val()||'','allocation':$("#fleet_com_allocation_1").val()||0},
									   {'stock':$("#fleet_com_stock_2").val()||'','fleet':$("#fleet_com_fleet_2").val()||'','allocation':$("#fleet_com_allocation_2").val()||0},
									   {'stock':$("#fleet_com_stock_3").val()||'','fleet':$("#fleet_com_fleet_3").val()||'','allocation':$("#fleet_com_allocation_3").val()||0}
									  ];
				
				inputdata =JSON.stringify({"sec_recreational":sec_recreational,"sec_commercial":sec_commercial,"fishingStartDate":fishingStartDate,
		            "fishingEndDate":fishingEndDate,"fleet_rec_stock":fleet_rec_stock,"fleet_com_stock":fleet_com_stock});	

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step9/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: inputdata,
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step9 successfully");
		                 }
		            }
		        });
			}else if($panel.prop("id")=='mgtopt3'){
				console.log("in step10");
				if(!$("#form-mgtopt3").valid()){
					return false;
				};
				var inputdata = {};
				var ratio_rec_ratio = [{'stock':$("#ratio_rec_stock_0").val()||'','state':$("#ratio_rec_state_0").val()||'','ratio':$("#ratio_rec_ratio_0").val()||0},
									   {'stock':$("#ratio_rec_stock_1").val()||'','state':$("#ratio_rec_state_1").val()||'','ratio':$("#ratio_rec_ratio_1").val()||0},
									   {'stock':$("#ratio_rec_stock_2").val()||'','state':$("#ratio_rec_state_2").val()||'','ratio':$("#ratio_rec_ratio_2").val()||0},
									   {'stock':$("#ratio_rec_stock_3").val()||'','state':$("#ratio_rec_state_3").val()||'','ratio':$("#ratio_rec_ratio_3").val()||0},
									   {'stock':$("#ratio_rec_stock_4").val()||'','state':$("#ratio_rec_state_4").val()||'','ratio':$("#ratio_rec_ratio_4").val()||0},
									   {'stock':$("#ratio_rec_stock_5").val()||'','state':$("#ratio_rec_state_5").val()||'','ratio':$("#ratio_rec_ratio_5").val()||0}									   
									  ];
				var ratio_com_ratio = [{'stock':$("#ratio_com_stock_0").val()||'','state':$("#ratio_com_state_0").val()||'','ratio':$("#ratio_com_ratio_0").val()||0},
									   {'stock':$("#ratio_com_stock_1").val()||'','state':$("#ratio_com_state_1").val()||'','ratio':$("#ratio_com_ratio_1").val()||0},
									   {'stock':$("#ratio_com_stock_2").val()||'','state':$("#ratio_com_state_2").val()||'','ratio':$("#ratio_com_ratio_2").val()||0},
									   {'stock':$("#ratio_com_stock_3").val()||'','state':$("#ratio_com_state_3").val()||'','ratio':$("#ratio_com_ratio_3").val()||0},
									   {'stock':$("#ratio_com_stock_4").val()||'','state':$("#ratio_com_state_4").val()||'','ratio':$("#ratio_com_ratio_4").val()||0},
									   {'stock':$("#ratio_com_stock_5").val()||'','state':$("#ratio_com_state_5").val()||'','ratio':$("#ratio_com_ratio_5").val()||0}									   
									  ];
				var discard_rec_ratio = [{'stock':$("#discard_rec_stock_0").val()||'','fleet':$("#discard_rec_fleet_0").val()||'','oc':$("#discard_rec_oc_0").val()||'','ratio':$("#discard_rec_ratio_0").val()||0},
									     {'stock':$("#discard_rec_stock_1").val()||'','fleet':$("#discard_rec_fleet_1").val()||'','oc':$("#discard_rec_oc_1").val()||'','ratio':$("#discard_rec_ratio_1").val()||0},
									     {'stock':$("#discard_rec_stock_2").val()||'','fleet':$("#discard_rec_fleet_2").val()||'','oc':$("#discard_rec_oc_2").val()||'','ratio':$("#discard_rec_ratio_2").val()||0},
									     {'stock':$("#discard_rec_stock_3").val()||'','fleet':$("#discard_rec_fleet_3").val()||'','oc':$("#discard_rec_oc_3").val()||'','ratio':$("#discard_rec_ratio_3").val()||0},
									     {'stock':$("#discard_rec_stock_4").val()||'','fleet':$("#discard_rec_fleet_4").val()||'','oc':$("#discard_rec_oc_4").val()||'','ratio':$("#discard_rec_ratio_4").val()||0},
									     {'stock':$("#discard_rec_stock_5").val()||'','fleet':$("#discard_rec_fleet_5").val()||'','oc':$("#discard_rec_oc_5").val()||'','ratio':$("#discard_rec_ratio_5").val()||0}									   
									    ];
				var discard_com_ratio = [{'stock':$("#discard_com_stock_0").val()||'','fleet':$("#discard_com_fleet_0").val()||'','oc':$("#discard_com_oc_0").val()||'','ratio':$("#discard_com_ratio_0").val()||0},
									     {'stock':$("#discard_com_stock_1").val()||'','fleet':$("#discard_com_fleet_1").val()||'','oc':$("#discard_com_oc_1").val()||'','ratio':$("#discard_com_ratio_1").val()||0},
									     {'stock':$("#discard_com_stock_2").val()||'','fleet':$("#discard_com_fleet_2").val()||'','oc':$("#discard_com_oc_2").val()||'','ratio':$("#discard_com_ratio_2").val()||0},
									     {'stock':$("#discard_com_stock_3").val()||'','fleet':$("#discard_com_fleet_3").val()||'','oc':$("#discard_com_oc_3").val()||'','ratio':$("#discard_com_ratio_3").val()||0},
									     {'stock':$("#discard_com_stock_4").val()||'','fleet':$("#discard_com_fleet_4").val()||'','oc':$("#discard_com_oc_4").val()||'','ratio':$("#discard_com_ratio_4").val()||0},
									     {'stock':$("#discard_com_stock_5").val()||'','fleet':$("#discard_com_fleet_5").val()||'','oc':$("#discard_com_oc_5").val()||'','ratio':$("#discard_com_ratio_5").val()||0}									   
									    ];
				inputdata =JSON.stringify({"ratio_rec_ratio":ratio_rec_ratio,"ratio_com_ratio":ratio_com_ratio,"discard_rec_ratio":discard_rec_ratio,
		            "discard_com_ratio":discard_com_ratio});	

				$.ajax({
		            cache: false,
		            url: $SCRIPT_ROOT+'/prostepview/step10/'+$("#step1_id").data("step1id"),
		            type: "PUT",
		            dataType: "json",
		            contentType:"application/json",
		            data: inputdata,
		            success: function(data) 
		            {
		                 if(data.status=1){
		                     console.log("save step10 successfully");
		                 }
		            }
		        });
			}
		}
	});

	$("#process-result").accwizard({

	});

	
	/*part 1 Stock Assessment Model Input 2 end*/

	/*part 2 general input start */
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

	/*part 2 general input end */

	/* part 4 initial population start */
	function getIniPopu(){
		
        $("#mask").addClass('lmask');
        $.ajax({
	    	url: $SCRIPT_ROOT+'/prostepview/getIniPopuTableData/'+$("#step1_id").data("step1id"),
	    	type: 'get',
	    	dataType: 'JSON',
	    	data: {},
	    })
	    .done(function(result) {
	    	var inputdata=result.iniPopu||result;
	    	$("#table-ibParam").parent('.bootstrap-table').css('margin-bottom', '30px');
			$("#table-ibParam").bootstrapTable({
		    	//url: $SCRIPT_ROOT+'/processview/getTableData/',         //请求后台的URL（*）
		    	//dataType:'json',
		    	data:inputdata,
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
		    				title:"Age",
		    				field:"age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Stock 1 mean",
		    				field:"stock_1_mean",
		    				editable:false,
		    			},
		    			{
		    				title:"CV (Normal Dist.)",
		    				field:"cv_1",
		    				formatter: function(value, row, index, field) {
						        	return parseFloat(value||0)*100.00;
								},
		    				editable:false,
		    			},
		    			{
		    				title:"Stock 2 mean",
		    				field:"stock_2_mean",
		    				editable:false,
		    			},
		    			{
		    				title:"CV (Normal Dist.)",
		    				field:"cv_2",
		    				formatter: function(value, row, index, field) {
						        	return parseFloat(value||0)*100.00;
								},
		    				editable:false,
		    			},
		    		],
		    	],
		    	onEditableSave: function (field, row, oldValue, $el) {
		    		// console.log(row);
		    		// $.ajax({
		      //           type: "post",
		      //           url: $SCRIPT_ROOT+"/prostepview/editTableData",
		      //           data: row,
		      //           dataType: 'json',
		      //       }).done(function(result) {
		      //       	console.log(result);
		      //       	if(result.status=='1'){
		      //       		alert('submit success');
		      //       	}
		      //       });
		    	},
		    });
		    
	    })
	    .fail(function() {
	    	console.log("error");
	    })
	    .always(function() {
	    	console.log("complete");
	    	$("#mask").removeClass('lmask');
	    });
        
	}
	/* part 4 initial population end */

	/* part 5 biological parameters start */
	function getBioParam(){
		
        $("#mask").addClass('lmask');
        $.ajax({
	    	url: $SCRIPT_ROOT+'/prostepview/getBioParamTableData/'+$("#step1_id").data("step1id"),
	    	type: 'get',
	    	dataType: 'JSON',
	    	data: {},
	    })
	    .done(function(result) {
	    	var inputdata=result.bioParam||result;
	    	$("#table-bioParam").parent('.bootstrap-table').css('margin-bottom', '30px');
			$("#table-bioParam").bootstrapTable({
		    	//url: $SCRIPT_ROOT+'/processview/getTableData/',         //请求后台的URL（*）
		    	//dataType:'json',
		    	data:inputdata,
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
		    				title:"Age",
		    				field:"age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Stock 1 Weight-at-age",
		    				field:"weight_at_age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Stock 1 Fecundity",
		    				field:"fec_at_age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Stock 2 Weight-at-age",
		    				field:"weight_at_age_2",
		    				editable:false,
		    			},
		    			{
		    				title:"Stock 2 Fecundity",
		    				field:"fec_at_age_2",
		    				editable:false,
		    			},
		    		],
		    	],
		    	onEditableSave: function (field, row, oldValue, $el) {
		    		// console.log(row);
		    		// $.ajax({
		      //           type: "post",
		      //           url: $SCRIPT_ROOT+"/prostepview/editTableData",
		      //           data: row,
		      //           dataType: 'json',
		      //       }).done(function(result) {
		      //       	console.log(result);
		      //       	if(result.status=='1'){
		      //       		alert('submit success');
		      //       	}
		      //       });
		    	},
		    });
		    
	    })
	    .fail(function() {
	    	console.log("error");
	    })
	    .always(function() {
	    	console.log("complete");
	    	$("#mask").removeClass('lmask');
	    });
        
	}
	/* part 5 biological parameters end */

	/* part 6 natural mortality start */
	

	function getMortality(){
		
        $("#mask").addClass('lmask');
        $.ajax({
	    	url: $SCRIPT_ROOT+'/prostepview/getMortalityTableData/'+$("#step1_id").data("step1id"),
	    	type: 'get',
	    	dataType: 'JSON',
	    	data: {},
	    })
	    .done(function(result) {
	    	var inputdata=result.mortality||result;
	    	$("#table-mortality").parent('.bootstrap-table').css('margin-bottom', '30px');
			$("#table-mortality").bootstrapTable({
		    	//url: $SCRIPT_ROOT+'/processview/getTableData/',         //请求后台的URL（*）
		    	//dataType:'json',
		    	data:inputdata,
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
		    				title:"Age",
		    				field:"age_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Mean 1",
		    				field:"mean_1",
		    				editable:false,
		    			},
		    			{
		    				title:"CV 1 (Log-normal Dist.)",
		    				field:"cv_mean_1",
		    				editable:false,
		    			},
		    			{
		    				title:"Mean 2",
		    				field:"mean_2",
		    				editable:false,
		    			},
		    			{
		    				title:"CV 2 (Log-normal Dist.)",
		    				field:"cv_mean_2",
		    				editable:false,
		    			},
		    		],
		    	],
		    	onEditableSave: function (field, row, oldValue, $el) {
		    		// console.log(row);
		    		// $.ajax({
		      //           type: "post",
		      //           url: $SCRIPT_ROOT+"/prostepview/editTableData",
		      //           data: row,
		      //           dataType: 'json',
		      //       }).done(function(result) {
		      //       	console.log(result);
		      //       	if(result.status=='1'){
		      //       		alert('submit success');
		      //       	}
		      //       });
		    	},
		    });
		    
	    })
	    .fail(function() {
	    	console.log("error");
	    })
	    .always(function() {
	    	console.log("complete");
	    	$("#mask").removeClass('lmask');
	    });
        
	}
	
	/* part 6 natural mortality end */

	/* part 7 recruitment start */
	function initHistroySt(stock){
		$("input[name^='hst"+stock+"']").prop('disabled','disabled');
		$("input[name='historySt"+stock+"']:checked").val()==1&&$("#hst"+stock+"_lower").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==2&&$("#hst"+stock+"_median").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==3&&$("#hst"+stock+"_mean").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==4&&$("#hst"+stock+"_upper").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()==5&&$("#hst"+stock+"_other").prop('disabled','');
		$("input[name='historySt"+stock+"']:checked").val()!=0&&$("#hst"+stock+"_cal").prop('disabled','');
	}

	function initFormulaStock(stock){
		$("input[name^='fml"+stock+"']").prop('disabled','disabled');
		$("input[name='formulaStock"+stock+"']:checked").val()==1&&$("[name^='fml"+stock+"Bm']").prop('disabled','');
		$("input[name='formulaStock"+stock+"']:checked").val()==2&&$("[name^='fml"+stock+"Rm']").prop('disabled','');
		$("input[name='formulaStock"+stock+"']:checked").val()==3&&$("[name^='fml"+stock+"Mbhm']").prop('disabled','');
	}

	$("input[name='recruitTypeStock1']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		$("#form-recruitment input[name='historySt1'],input[name^='hst1'],input[name='formulaStock1'],input[name^='fml1'],input[name^='auto1']").prop('disabled','disabled');
		
		if($("input[name='recruitTypeStock1']:checked").val()==1){

			$("#form-recruitment input[name='historySt1']").prop('disabled','');
			initHistroySt(1);

		}else if($("input[name='recruitTypeStock1']:checked").val()==2){
			
			$("#form-recruitment input[name='formulaStock1']").prop('disabled','');
			initFormulaStock(1);

		}else{

			$("#form-recruitment input[name^='auto1']").prop('disabled','');

		}
	
	});

	$("input[name='historySt1']").on('change', function(event) {
		initHistroySt(1);
	});

	$("input[name='formulaStock1']").on('change', function(event) {
		initFormulaStock(1);
	});

	$("input[name='recruitTypeStock2']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		$("#form-recruitment input[name='historySt2'],input[name^='hst2'],input[name='formulaStock2'],input[name^='fml2'],input[name^='auto2']").prop('disabled','disabled');
		
		if($("input[name='recruitTypeStock2']:checked").val()==1){

			$("#form-recruitment input[name='historySt2']").prop('disabled','');
			initHistroySt(2);

		}else if($("input[name='recruitTypeStock2']:checked").val()==2){
			
			$("#form-recruitment input[name='formulaStock2']").prop('disabled','');
			initFormulaStock(2);

		}else{

			$("#form-recruitment input[name^='auto2']").prop('disabled','');

		}
	});

	$("input[name='historySt2']").on('change', function(event) {
		initHistroySt(2);
	});

	$("input[name='formulaStock2']").on('change', function(event) {
		initFormulaStock(2);
	});

	/* part 7 recruitment end */

	/* part 8 Management Options Part I start */
	function initBioPoints(){
		if($("input[name='bio_harvest_radio']:checked").val()=='C'){
			$("#bio_catch_mt").prop('disabled', '');
			$("#bio_f_percent").prop('disabled', 'disabled');
		}else{
			$("#fbaseRadio").prop('checked', true);
			$("#bio_catch_mt").prop('disabled', 'disabled');
			$("#bio_f_percent").prop('disabled', '');
		}
	}

	function initHrtPoints(){
		if($("input[name='hrt_harvest_radio']:checked").val()=='C'){
			$("#hst_catch_thh1").prop('disabled', '');
			$("#hst_catch_thh2").prop('disabled', '');
			$("#hst_f_thh1").prop('disabled', 'disabled');
			$("#hst_f_thh2").prop('disabled', 'disabled');
		}else{
			$("#fRadio").prop('checked',true);
			$("#hst_catch_thh1").prop('disabled', 'disabled');
			$("#hst_catch_thh2").prop('disabled', 'disabled');
			$("#hst_f_thh1").prop('disabled', '');
			$("#hst_f_thh2").prop('disabled', '');
		}
	}



	$("input[name='hrt_harvest_rule']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		$("#hr_rule_pic").prop("src", $SCRIPT_ROOT+"/static/assets/images/harvestCtlRule/"+$("input[name='hrt_harvest_rule']:checked").val()+".png")
		
	});

	$("input[name='bio_harvest_radio']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		initBioPoints();
	});

	$("input[name='hrt_harvest_radio']").on('change', function(event) {
		event.preventDefault();
		/* Act on the event */
		initHrtPoints();
	});
	/* part 8 Management Options Part I end */

	/* initialization start*/
	//$("#start_projection").find("input").val(moment('2017-01-01').format('YYYY-MM-DD'));
	getIniPopu();
	getBioParam();
	getMortality();
	$("#form-recruitment input[name='historySt1'],input[name^='hst1'],input[name='formulaStock1'],input[name^='fml1'],input[name^='auto1']").prop('disabled','disabled');
	$("#form-recruitment input[name='historySt2'],input[name^='hst2'],input[name='formulaStock2'],input[name^='fml2'],input[name^='auto2']").prop('disabled','disabled');
    $("input[name='recruitTypeStock1']:checked").val()==2&&$("#form-recruitment input[name='formulaStock1']").prop('disabled','disabled')&&initFormulaStock(1);
    $("input[name='recruitTypeStock2']:checked").val()==2&&$("#form-recruitment input[name='formulaStock2']").prop('disabled','disabled')&&initFormulaStock(2);

    initBioPoints();
    initHrtPoints();
    /* initialization end*/
	

	// 

    

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