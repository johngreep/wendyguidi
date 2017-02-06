$(document).ready(function(){
	// Javascript to enable link to tab
	var url = document.location.toString();
	if (url.match('#')) {
		$('.nav-tabs a[href=#'+url.split('#')[1]+']').tab('show') ;
		history.pushState( null, null, $(this).attr('href') );
		window.scrollTo(0, 0);
	} 

	// Change hash for page-reload
	$('.nav-tabs a').on('shown.bs.tab', function (e) {
		window.location.hash = e.target.hash;
		history.pushState( null, null, $(this).attr('href') );
	});

	$('.nav-tabs li a').click( function(e) {
		history.pushState( null, null, $(this).attr('href') );
	});

	$.validator.setDefaults({
	    highlight: function(element) {
	        $(element).closest('.form-group').addClass('has-error');
	    },
	    unhighlight: function(element) {
	        $(element).closest('.form-group').removeClass('has-error');
	    },
	    errorElement: 'span',
	    errorClass: 'help-block',
	    errorPlacement: function(error, element) {
	        if(element.parent('.input-group').length) {
	            error.insertAfter(element.parent());
	        } else {
	            error.insertAfter(element);
	        }
	    }
	});

	$('#contactForm').validate({
		rules: {
			sender_name: "required",
			inputEmail: {
				required: true,
				email: true
			},
			phone: {
				required: true,
				phoneUS: true
			},
			messagebody: {
				required: true,
				minlength: 3
			}
		},
		messages: {
			sender_name: "Please enter your name",
			inputEmail: {
				required: "We would like your email address so that we can respond",
				email: "Please enter a valid email address"
			},
			phone: {
				required: "A phone number is required",
				phoneUS: "Please enter a valid phone number"
			},
			messagebody: "Please tell us something"
		},
		submitHandler: function (form) {
			//get input field values data to be sent to server
			post_data = {
				'sender_name': $('input[name=sender_name]').val(), 
				'email': $('input[name=inputEmail]').val(), 
				'phone': $('input[name=phone]').val(), 
				'subject': $('select[name=subject]').val(), 
				'body': $('textarea[name=messagebody]').val(),
				'grecaptcharesponse': $('textarea[name=g-recaptcha-response]').val()
			};
			
			//Ajax post data to server
			$.ajax({
			  type: "POST",
			  url: "/mailout.php",
			  data: post_data,
			  success: function(response) {
			    if(response.type == 'error'){ //load json data from server and output message
			       output = '<div class="error">'+response.text+'</div>';
			    } else {
			    	output = '<div class="success">'+response.text+'</div>';
			    	//reset values in all input fields
			    	$("#contact  input[required=true], #contact textarea[required=true]").val(''); 
			    	$("#contact #contactBody").slideUp(); //hide form after success
			    }
			    $("#contact #contactResults").hide().html(output).slideDown();
			  },
			  error: function(response) {
			    output = '<div class="error">'+response.responseText+'</div>';
			    $("#contact #contactResults").hide().html(output).slideDown();
			  },
			  dataType: 'json'
			});
		},
	});
	
	//reset previously set border colors and hide all message on .keyup()
	$("#contact  input[required=true], #contact textarea[required=true]").keyup(function() { 
		$(this).css('border-color',''); 
		$("#result").slideUp();
	});

});
