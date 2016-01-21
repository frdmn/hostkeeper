$(function() {
  /*
   * Functions
   **/

  // Reload hosts list in DO
  var reloadHostList = function() {
    $.ajax({
      type: 'GET'
      , url: 'http://' + window.location.host + '/api/show'
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
      , url: 'http://' + window.location.host + '/api/update'
      , cache: false
      , success: function() {
        // Clear placeholder
        callback(true);
      }
    });
  }

  // Close modals
  function closeModals(){
    // Close modal
    $('.modal').removeClass('modal--active');
    // Remove saving class
    $('.modal').removeClass('modal--saving');
    // Remove error class
    $('.modal').removeClass('modal--error');
  }

  /*
   * General stuff
   **/

  // Reload host list initially
  reloadHostList();

  // Close modals on click on close button
  $('.modal button.modal-close').on('click', function() {
    closeModals();
  });

  // Prevent default submit action
  $('form').on('submit', function(event) {
    event.preventDefault();
  });

  // Form validator - IP plugin
  jQuery.validator.addMethod('validIP', function(value) {
    var split = value.split('.');
    if (split.length !== 4)
      return false;

    for (var i=0; i<split.length; i++) {
      var s = split[i];
      if (s.length===0 || isNaN(s) || s<0 || s>255)
        return false;
    }
    return true;
  }, ' Invalid IP Address');

  // Prepare form validation
  $( 'form' ).each(function(){
    $(this).validate( {
      errorClass: 'host-input-error',
      rules: {
        ip: {
          required: true,
          validIP: true
        },
        host: {
          required: true
        }
      },
      messages: {
        ip: {
          required: 'Enter an IP',
          validIP: 'IP not valid'
        },
        host: {
          required: 'Enter a hostname'
        }
      }
    });
  });

  // Validate form on keyup
  $('form').on('keyup', function () {
    if ($(this).valid()) {
      $('.btn--submit', this).attr('disabled', false);
      console.log($('#ip-input', this).val());
      console.log($('#host-input', this).val());
    } else {
      $('.btn--submit', this).attr('disabled', true);
    }
  });

  // as well as on ESC keypress
  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      closeModals();
    }
  });

  /*
   * "add host" related
   **/

  // Open "add" modal
  $('.modal-open#add-button').on('click', function() {
    // Reset modal inputs
    $('.modal#add #host-input').val('');
    $('.modal#add #ip-input').val('');
    // Show modal
    $('.modal#add').addClass('modal--active');
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
      , url: 'http://' + window.location.host + '/api/add'
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
      , error: function(request, status) {
        console.log(status);
        $('.modal#add').removeClass('modal--active');
        $('.modal#add').removeClass('modal--saving');
        $('.modal#add .error-msg').text(request.responseJSON.payload.error);
        // Show error overlay
        $('.modal#add').addClass('modal--error');
      }
    });
  });

  /*
   * "edit host" related
   **/

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
      , url: 'http://' + window.location.host + '/api/edit/' + $('.modal#edit #id-input').val()
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
      , error: function(request, status) {
        console.log(status);
        $('.modal#edit').removeClass('modal--active');
        $('.modal#edit').removeClass('modal--saving');
        $('.modal#edit .error-msg').text(request.responseJSON.payload.error);
        // Show error overlay
        $('.modal#edit').addClass('modal--error');
      }
    });
  });

  /*
   * "delete host" related
   **/

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
      , url: 'http://' + window.location.host + '/api/delete/' + hostId
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
});
