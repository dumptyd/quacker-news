$(document).ready(function(){
  
  $('.upvote-comment').on('click', function(){
    $(this).next('.downvote-comment').removeClass('downvoted');
    if($(this).hasClass('upvoted'))
      $(this).removeClass('upvoted');
    else
      $(this).addClass('upvoted');
    var itemId = $(this).data('oid');
    $.ajax({
      url: '/vote',
      type: 'POST',
      data: {
        type: 'upvote',
        on : 'comment',
        itemId: itemId
      },
      mimeType: 'text/html'
    });
  });
  
  $('.downvote-comment').on('click', function(){
    $(this).prev('.upvote-comment').removeClass('upvoted');
    if($(this).hasClass('downvoted'))
      $(this).removeClass('downvoted');
    else
      $(this).addClass('downvoted');
    var itemId = $(this).data('oid');
    $.ajax({
      url: '/vote',
      type: 'POST',
      data: {
        type: 'downvote',
        on : 'comment',
        itemId: itemId
      },
      mimeType: 'text/html'
    });
  });
  
  $('.upvote-thread').on('click', function(){
    if($(this).hasClass('upvoted'))
      $(this).removeClass('upvoted');
    else
      $(this).addClass('upvoted');
    var itemId = $(this).data('oid');
    $.ajax({
      url: '/vote',
      type: 'POST',
      data: {
        type: 'upvote',
        on : 'thread',
        itemId: itemId
      },
      mimeType: 'text/html'
    });
  });
  
  $('.mark-removed').on('click', function(){
    var _this = this;
    var type = $(this).data('type');
    var itemId = $(this).data('oid');
    $.ajax({
      url: '/admin/markremoved',
      type: 'POST',
      data: {
        type: type,
        itemId: itemId
      },
      mimeType: 'text/html',
      statusCode: {
        200: function() {
          $(_this).val('Removed');
          $(_this).prop('disabled', true);
        },
        500: function() {
          $(_this).val('Error, try again');
        }
      }
    });
  });
  
  $('.unmark-removed').on('click', function(){
    var _this = this;
    var type = $(this).data('type');
    var itemId = $(this).data('oid');
    $.ajax({
      url: '/admin/unmarkremoved',
      type: 'POST',
      data: {
        type: type,
        itemId: itemId
      },
      mimeType: 'text/html',
      statusCode: {
        200: function() {
          $(_this).val('Marked as active');
          $(_this).prop('disabled', true);
        },
        500: function() {
          $(_this).val('Error, try again');
        }
      }
    });
  });
  
});