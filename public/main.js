$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $testing2 = $('.testing2');
  var $pages = $('.pages')


  // Prompt for setting a username
  var users;
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();



  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    var username = cleanInput($usernameInput.val().trim());

    // if (data.users.indexOf(username) == -1) {
    //   // alert("retype your name!")
    //   return console.log("hello");
    // } else {
    // If the username is valid

      // if (data.users.indexOF(username) == -1) {
        if(username){
        socket.emit('add user', username);
      }
        // $testing2.hide();
       
    // };
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

    // add online users
  function onlineUsers(data){
    // console.log("i hit online users")
    // console.log(data.users);

    $('.online').empty();
    for(var i=0; i < (data.users).length; i++){
    var order = i + 1
    $('.online').append("<tr class='"+ data.users[i] +"'><td>" + order + " </td><td>"+ data.users[i] +"</td><td><p type ='button' class = 'joinchat' data-toggle='modal' data-target='#myModal'>Join</p></td></tr>" );
    // $('.online').append("<tr class='"+ data.username +"'><td>"+ data.numUsers +"</td><td>"+ data.username +"</td></tr>");
    }
    //hostVideo(data)



  };

  // remove users 
  function removeUsers(data){
    console.log(data.users)
    // console.log("i hit remove users")
    $("." + data.username ).remove();
  };

  function hostVideo(data){
    
    $(".hostvideo").click(function(){
      console.log("THIS HAS TO SHOW UP " +data.username);
    $("#iframe").attr('src', 'https://appear.in/'+data.username)
    //$("."+username).append("<td><a href =https://appear.in/"+username+">Join</a></td>")
    })
  }





// jQuery('.hostvideo').click(function(){
//   $(this).data('clicked', true);
// });
// Then, to check if it was clicked and perform an action:

// if($('.hostvideo').data('clicked')) {
//     $("."+data.username+" td").eq(1).html(data.username + "&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp"+"<a href =https://appear.in/"+username+">Join</a>")
// } else {
//     $('.online').append("<tr class='"+ data.users[i] +"'><td>" + order + "&nbsp &nbsp </td><td>"+ data.users[i] +"</td></tr>");
// }





  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    // if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    //   $currentInput.focus();
    // }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        // socket.on('check', function(data){
        //   setUsername(data);
        // });
        setUsername();
      }
    }
  });

  $inputMessage.on('keydown', function (e) {
    e.stopPropagation();
    if (e.which === 13) {
      sendMessage();
      socket.emit('stop typing');
      typing = false;
    }
  })

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events
  //change the appear in url to the person hosting it


  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  //joining a chat

  $(".joinchat").click(function(){
    $("#iframe").attr('src', 'https://appear.in/'+username)
  })

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "This is for our final project";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
    onlineUsers(data);
    hostVideo(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
    // removeUsers(data);
    onlineUsers(data);

  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  socket.on('online',function(data){
    // console.log(data);
    // alert(data);
    // log('123');
    onlineUsers(data);
    hostVideo(data);
  });

  // socket.on('host video', function(data){
  //   console.log("got here!")
  //   onlineUsers(data)
  //   hostVideo(data);
  // })

  socket.on('login successful', function (data) {
    username = data.username;
        $loginPage.fadeOut();
        $pages.fadeIn();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();
        // Tell the server your username
  });

  socket.on('invalid user', function (data) {
    // Do nothing
    $('.form h3').text("Another user has this name already please use a different username")
  
  });

  // socket.on('check'),function(data){
  //   users = data.users
  // };



});
