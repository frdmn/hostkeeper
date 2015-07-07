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
        $('.btn--submit').attr('disabled', false);
      } else {
        $('.btn--submit').attr('disabled', true);
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
        'host': $('#host-input').val()
        , 'ip': $('#ip-input').val()
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
});
