/**
 * main.js
 *
 * Author: Marian Friedmann
 *
 */

$(function() {
  /* "add host" functions */
  $('.modal-open#add-button').click(function() {
    $('.modal').addClass('modal--active');

    // Check if text areas are not empty
    $('.btn--submit').attr('disabled', true);
    $('input').on('keyup',function() {
      if ($('#ip-input').val() && $('#host-input').val()) {
        $('.btn--submit').attr('disabled', false);
      } else {
        $('.btn--submit').attr('disabled', true);
      }
    });

    // Save host
    $('.modal-save').click(function() {
      // Close modal
      $('.modal').removeClass('modal--active');
      // Show saving overlay
      $('.modal').addClass('modal--saving');

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
            $('.modal').removeClass('modal--saving');
            // Reload page
            location.reload();
          }
        }
      });
    });

    // On click on close button
    $('#add button.modal-close').click(function() {
      // Close modal
      $('.modal').removeClass('modal--active');
      // Remove saving class
      $('.modal').removeClass('modal--saving');
    });
  });

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
        $('.dotted-list').append('<li data-host="' + host.id + '"><span class="dotted-list__title"><span class="background-offset">' + host.ip + '</span></span> <span class="background-offset">' + host.host + '</span></li>');
      });
    }
  });
});
