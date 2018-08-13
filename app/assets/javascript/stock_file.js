$(function() {

	$("input[name='defaultfile']").click(function(event) {	
		 var cnfrm = confirm('Are you sure for setting current file as default ?');
             if(cnfrm == true){
                
             }else{
                 return false;
             }
	});
})