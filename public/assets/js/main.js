/**
 * main.js
 *
 * Author: Marian Friedmann
 *
 */

$(function() {
  $('.modal-open').click(function() {
    $('.modal').addClass('modal--active');
    $('.modal--active').click(function() {
      $('.btn--submit').attr('disabled', false);
    });
  });

  $('.modal-save').click(function() {
    $('.modal').removeClass('modal--active');
    $('.modal').addClass('modal--saving');
  });

  $('.modal-close').click(function() {
    $('.modal').removeClass('modal--active');
    $('.modal').removeClass('modal--saving');
  });

  // Populate <ul> with host <li>'s
  $.ajax({
    type: 'GET'
    , url: 'http://' + window.location.hostname + ':4000/show'
    , cache: false
    , success: function(data) {
      // Clear placeholder
      $('.dotted-list').html('');
      // Add each host
      data.forEach(function(host) {
        $('.dotted-list').append('<li data-host="' + host.id + '"><span class="dotted-list__title"><span class="background-offset">' + host.ip + '</span></span> <span class="background-offset">' + host.host + '</span></li>');
      });
    }
  });
});
