/**
 * main.js
 *
 * Author: Marian Friedmann
 *
 */

$(function() {
  /* "list all" functions */
  $.ajax({
    type: 'GET'
    , url: 'http://' + window.location.hostname + ':4000/show'
    , cache: false
    , success: function(data) {
      // Clear placeholder
      $('.dotted-list').html('');
      // Populate <ul> with host <li>'s
      data.forEach(function(host) {
        $('.dotted-list').append('<li id="host" data-host="' + host.id + '"><span class="dotted-list__title"><span class="background-offset" id="ip">' + host.ip + '</span></span> <span class="background-offset" id="host">' + host.host + '</span></li>');
      });
    }
  });

  /* "add host" functions */
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
        , url: 'http://' + window.location.hostname + ':4000/add'
        , data: postObject
        , dataType: 'json'
        , success: function(data) {
          if (!data.success && data.errors.name) {
            // Log errors
            console.log(data.errors.name);
          } else {
            // Remove saving class
            $('.modal#add').removeClass('modal--saving');
            // Reload page
            location.reload();
          }
        }
      });
    });

    // On click on close button
    $('.modal#add button.modal-close').on('click', function() {
      // Close modal
      $('.modal#add').removeClass('modal--active');
      // Remove saving class
      $('.modal#add').removeClass('modal--saving');
    });
  });

  /* "edit host" functions */
  $(document).on('click', 'li#host', function() {
    // Show modal
    $('.modal#edit').addClass('modal--active');

    // Get current host details
    var hostId = $(this).data('host')
        , hostName = $('span#host', this).html()
        , hostIp = $('span#ip', this).html();

    // Fill host and ip inputs
    $('.modal#edit #host-input').val(hostName);
    $('.modal#edit #ip-input').val(hostIp);

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
        , url: 'http://' + window.location.hostname + ':4000/edit/' + hostId
        , data: postObject
        , success: function(data) {
          if (!data.success && data.errors.name) {
            // Log errors
            console.log(data.errors.name);
          } else {
            // Remove saving class
            $('.modal#edit').removeClass('modal--saving');
            // Reload page
            location.reload();
          }
        }
      });
    });

    // Check if text areas are not empty
    $('.modal#edit input').on('keyup',function() {
      if ($('.modal#edit #ip-input').val() && $('.modal#edit #host-input').val()) {
        $('.modal#edit .btn--submit').attr('disabled', false);
      } else {
        $('.modal#edit .btn--submit').attr('disabled', true);
      }
    });

    // On click on close button
    $('.modal#edit button.modal-close').on('click', function() {
      // Close modal
      $('.modal#edit').removeClass('modal--active');
      // Remove saving class
      $('.modal#edit').removeClass('modal--saving');
    });
  });
});
