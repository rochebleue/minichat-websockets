
$('document').ready(function(){
	$('#messagescontainer').animate({scrollTop:$('#messagescontainer').height()}, 'fast');

	const socket = io.connect('http://localhost:9000');
	var lastMessage = [];
	var maxIndex = 0;
	var currentIndex = 0;
	var pseudo = prompt("Please enter your name", "User");
	var typingTimer = 0;
	var currentChannel = 'chan0';

	// FUNCTIONS

	function sendMessage() {
		if ($('#writezone').val().length != 0) {
			d = new Date();
			time = d.getHours() + ':' + d	.getMinutes();
			maxIndex += 1;
			currentIndex = maxIndex;
			lastMessage.push($('#writezone').val());
			socket.emit('chat message', $('#writezone').val(), pseudo, time, $('#userColor').val(), currentChannel);
			$('#writezone').val('');
			$('#messagescontainer').animate({scrollTop:$('#messagescontainer').height()}, 'slow');
		}
	}

	function refreshChannels(channels) {
		$('.channels ul').html('');
		for (var i = channels.length - 1; i >= 0; i--) {
			var active = '';
			if (currentChannel === channels[i].id) {
				active = 'active';
			}
			li = '<li id="'+channels[i].id+'" class="channel '+active+'">'+channels[i].name+'</li>';
			$('.channels ul').append(li);
		}
	}

	function addChannel() {
		socket.emit('new channel', $('#channelName').val());
		$('#channelName').val('');
	}

	// BEGINNING

	socket.emit('user connect', pseudo, $('#userColor').val(), currentChannel);

	//////////////// SENDING SOCKETS ///////////////////

	// sending message on enter / send
	$('#sendBtn').on('click', function() {
		sendMessage();
	});
	$(document).keypress(function(e) {
		// ENTER KEY
 		if(e.which == 13) {
 			if ($('#writezone').is(':focus')) {
 				e.preventDefault();
   				sendMessage();
 			}
 			else if ($('#channelName').is(':focus')) {
 				addChannel();
 			}
  	  	}
  	  	else if ($('#writezone').is(':focus')) {
  	  		socket.emit('typing', pseudo);
  	  	}

	});

	// broswing history
	$(document).keyup(function(e) {
    	if (e.which === 38) {
    		currentIndex -= 1;
    		$('#writezone').val(lastMessage[currentIndex]);
    	}
    	if (e.which === 40 && currentIndex < maxIndex) {
    		currentIndex += 1;
    		$('#writezone').val(lastMessage[currentIndex]);
    	}
    });

    $('#addChannelBtn').on('click', function() {
        if ($("#channelName").val()) {
           addChannel(); 
        }
    });

    $('#userColor').on('change', function() {
    	socket.emit('color change', $('#userColor').val());
    });

    $('.channels').on('click', 'li', function() {
    	socket.emit('switch channel', $(this).attr('id'));
    	$('.active').removeClass('active');
    	$(this).addClass('active');
    	currentChannel = $(this).attr('id');
    });

	//////////// RECEIVING SOCKETS /////////////

	// event called when the server broadcasts a message
	socket.on('chat message', function(msg, pseudo, time, color, channel) {
		if (channel !== currentChannel) {
			console.log('other channel : '+channel+', '+currentChannel);
			return;
		}
		var div = 		'<div class="message"><span class="pseudo" style="background-color:' 
						+ color
						+'; color:'
						+ 'white'
						+ '">' 
						+ pseudo 
						+ '</span><span class="content">'
						+ msg
						+'</span></div>'
						+ '<div class="time">'
						+ time
						+'</div>';
    	$('#messagescontainer').append(div);
    	$('#messagescontainer').animate({scrollTop:$('#messagescontainer').height()}, 'slow');
    });

    socket.on('typing', function(pseudo) {
    	clearTimeout(typingTimer);
    	$('.isTyping span').html(pseudo+' is typing a message...');
    	typingTimer = setTimeout(function() {$('.isTyping span').html('')}, 2000);
    });

    socket.on('user connect', function(users) {
    	var li;
    	$('.users ul').html('');
    	for (var i = users.length - 1; i >= 0; i--) {
    		li = '<li class="'
    		+ users[i].id
    		+ '""><div class="dot" style="background-color: '
    		+ users[i].color
    		+'"></div>'
    		+ users[i].pseudo
    		+ '</li>';
    		$('.users ul').append(li);
    	}
    });

    // user is disconnected
    socket.on('user disconnected', function(id) {
    	$('.'+id).remove();
    });

    // refresh channels
    socket.on('refresh channels', function(channels) {
    	refreshChannels(channels);
    });

    socket.on('users refresh', function(users) {
    	var li;
    	$('.users ul').html('');
    	for (var i = users.length - 1; i >= 0; i--) {
    		li = '<li class="'
    		+ users[i].id
    		+ '""><div class="dot" style="background-color: '
    		+ users[i].color
    		+'"></div>'
    		+ users[i].pseudo
    		+ '</li>';
    		$('.users ul').append(li);
    	}
    });

    //refresh messages
    socket.on('refresh messages', function(messages) {
    	$('#messagescontainer').html('');
    	for (var i = 0; i <= messages.length - 1; i++) {
    				var div = 		'<div class="message"><span class="pseudo" style="background-color:' 
						+ messages[i].color
						+'; color:'
						+ 'white'
						+ '">' 
						+ messages[i].pseudo 
						+ '</span><span class="content">'
						+ messages[i].message
						+'</span></div>'
						+ '<div class="time">'
						+ messages[i].time
						+'</div>';
    	$('#messagescontainer').append(div);
    	}
    	$('#messagescontainer').animate({scrollTop:$('#messagescontainer').height()}, 'slow');
    });

});

