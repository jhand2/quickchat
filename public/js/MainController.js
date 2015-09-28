var socket = io();

function send() {
	var messageContainer = document.getElementById('messages');
	var messageInput = document.getElementById("message-input");	
	var message = messageInput.value;

	if (message.length > 0) {
		messageInput.value = "";

		var newParagraph = document.createElement("P");
		newParagraph.innerHTML = message;
		messageContainer.appendChild(newParagraph);

		socket.emit('chat', message);
	}
}

socket.on('chat', function(msg) {
	var messageContainer = document.getElementById('messages');
	var newParagraph = document.createElement("P");
	newParagraph.innerHTML = msg;
	messageContainer.appendChild(newParagraph);
})