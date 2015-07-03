/**
 * main.js
 *
 * Author: Marian Friedmann
 *
 */

$(function() {
  $('.modal-open').click(function() {
    $('.modal').addClass('modal--active');
  });

  $('.modal-loading').click(function() {
    $('.modal').removeClass('modal--active');
    $('.modal').addClass('modal--loading');
  });

  $('.modal-close').click(function() {
    $('.modal').removeClass('modal--active');
    $('.modal').removeClass('modal--loading');
  });
});
