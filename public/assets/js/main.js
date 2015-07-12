$(function() {
  /* function */

  // Reload hosts list in DO
  var reloadHostList = function() {
    $.ajax({
      type: 'GET'
      , url: 'http://' + window.location.hostname + '/api/show'
      , cache: false
      , success: function(data) {
        // Clear placeholder
        $('.dotted-list').html('');
        // Populate <ul> with host <li>'s
        data.payload.forEach(function(host) {
          $('.dotted-list').append('<li id="host" data-host="' + host.id + '"><span class="dotted-list__title"><span class="background-offset" id="ip">' + host.ip + '</span></span> <span class="background-offset" id="host">' + host.host + '</span></li>');
        });
      }
    });
  };

  // Reload DNS server
  function reloadDNSserver(callback){
    $.ajax({
      type: 'GET'
      , url: 'http://' + window.location.hostname + '/api/update'
      , cache: false
      , success: function(data) {
        // Clear placeholder
        callback(true);
      }
    });
  };

  reloadHostList();

  /* "add host" functions */

  // Open "add" modal
  $('.modal-open#add-button').on('click', function() {
    // Show modal
    $('.modal#add').addClass('modal--active');

    // Check if text areas are not empty
    $('.btn--submit').attr('disabled', true);
    $('.modal#add input').on('keyup',function() {
      if ($('.modal#add #ip-input').val() && $('.modal#add #host-input').val()) {
        $('.modal#add .btn--submit').attr('disabled', false);
      } else {
        $('.modal#add .btn--submit').attr('disabled', true);
      }
    });
  });

  // Save host
  $('.modal#add .modal-save').on('click', function() {
    // Close modal
    $('.modal#add').removeClass('modal--active');
    // Show saving overlay
    $('.modal#add').addClass('modal--saving');

    // Create POST object
    var postObject = {
      'host': $('.modal#add #host-input').val()
      , 'ip': $('.modal#add #ip-input').val()
    };

    // Send POST request to API
    $.ajax({
      type: 'POST'
      , url: 'http://' + window.location.hostname + '/api/add'
      , data: postObject
      , dataType: 'json'
      , success: function(data) {
        if (!data.success) {
          // Log errors
          console.log(data);
        } else {
          // Reload DNS server
          reloadDNSserver(function(){
            // Remove saving class
            $('.modal#add').removeClass('modal--saving');
            // Reload host list
            reloadHostList();
          });
        }
      }
    });
  });

  /* "edit host" functions */

  // @TODO - is this below performant?
  $(document).on('click', 'li#host', function() {
    // Show modal
    $('.modal#edit').addClass('modal--active');

    // Get current host details
    var hostId = $(this).data('host')
        , hostName = $('span#host', this).html()
        , hostIp = $('span#ip', this).html();

    // Fill host and ip inputs
    $('.modal#edit #id-input').val(hostId);
    $('.modal#edit #host-input').val(hostName);
    $('.modal#edit #ip-input').val(hostIp);

    // Check if text areas are not empty
    $('.modal#edit input').on('keyup',function() {
      if ($('.modal#edit #ip-input').val() && $('.modal#edit #host-input').val()) {
        $('.modal#edit .btn--submit').attr('disabled', false);
      } else {
        $('.modal#edit .btn--submit').attr('disabled', true);
      }
    });
  });

  // Save edited host
  $('.modal#edit .modal-save').on('click', function() {
    // Close modal
    $('.modal#edit').removeClass('modal--active');
    // Show saving overlay
    $('.modal#edit').addClass('modal--saving');
    // Create POST object
    var postObject = {
      'host': $('.modal#edit #host-input').val()
      , 'ip': $('.modal#edit #ip-input').val()
    };
    // Send PUT request to API
    $.ajax({
      type: 'PUT'
      , url: 'http://' + window.location.hostname + '/api/edit/' + $('.modal#edit #id-input').val()
      , data: postObject
      , success: function(data) {
        if (!data.success) {
          // Log errors
          console.log(data);
        } else {
          // Reload DNS server
          reloadDNSserver(function(){
            // Remove saving class
            $('.modal#edit').removeClass('modal--saving');
            // Reload host list
            reloadHostList();
          });
        }
      }
    });
  });

  /* "delete host" functions */

  $('.modal-delete').on('click', function() {
    // Get current host details
    var hostId = $('.modal#edit #id-input').val();
    console.log(hostId);
    // Close modal
    $('.modal#edit').removeClass('modal--active');
    // Show saving overlay
    $('.modal#edit').addClass('modal--saving');

    // Send DELETE request to API
    $.ajax({
      type: 'DELETE'
      , url: 'http://' + window.location.hostname + '/api/delete/' + hostId
      , success: function(data) {
        if (!data.success) {
          // Log errors
          console.log(data);
        } else {
          // Reload DNS server
          reloadDNSserver(function(){
            // Remove saving class
            $('.modal#edit').removeClass('modal--saving');
            // Reload host list
            reloadHostList();
          });
        }
      }
    });
  });

  /* General */

  // Close modals on click on close button
  $('.modal button.modal-close').on('click', function() {
    // Close modal
    $('.modal').removeClass('modal--active');
    // Remove saving class
    $('.modal').removeClass('modal--saving');
  });
});
