$(function() {

	$("input[name='propublic']").change(function(event) {
		console.log('public: ' + $(this).prop('checked'));
		$.ajax({
            cache: false,
            url: $SCRIPT_ROOT+'/prostepview/propublic/'+$(this).data("proid"),
            type: "PUT",
            dataType: "json",
            data: {"public":$(this).prop('checked')},
            success: function(data) 
            {
                 if(data.status=1){
                     console.log("save process_public successfully");
                 }
            }
        });
	});

	$("input[name='prosimple']").change(function(event) {
		console.log('single: ' + $(this).prop('checked'));
		$.ajax({
            cache: false,
            url: $SCRIPT_ROOT+'/prostepview/prosimple/'+$(this).data("proid"),
            type: "PUT",
            dataType: "json",
            data: {"simple":$(this).prop('checked')},
            success: function(data) 
            {
                 if(data.status=1){
                     console.log("save process_simple successfully");
                 }
            }
        });
	});



})