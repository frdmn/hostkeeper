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

});
