var loadFiles = function(i, files) {
  $('.load-progress').html('Loading: ' + (i + 1) + '/' + files.length);
  if (i >= files.length) return;
  var f = files[i],
      path = URL.createObjectURL(f);
  q.addSong(path, function(){
    loadFiles(i + 1, files);
  }, f.name);
}

$('#song-file-input').change(function(event) {
  $('.load-progress').html('');
  var i = 0;
      files = event.target.files;
  loadFiles(i, files);
});

$(window).on('keydown', function(e) {
  var keycode = e.which;
  switch (e.which) {
    case KEYS.SPACE:
      if (q.isPlaying()) {
        q.pause();
      } else {
        q.play();
      }
      break;
    case KEYS.LEFT:
      q.previous();
      break;
    case KEYS.RIGHT:
      q.next();
      break;
    case KEYS.Q:
      if ($('#vis-menu').css('display') == 'none') {
        $('#vis-menu').css('display', 'block');
        $('.bottom-bar-wrap').css('display','none');
      } else {
        $('#vis-menu').css('display','none');
        $('.bottom-bar-wrap').css('display', 'block');
      }
      break;
    case KEYS.R:
      $('.repeat').toggleClass('selected');
      q.toggleRepeat();
      break;
    case KEYS.T:
      $('#song-file-input').click();
      break;
    case KEYS.A:
      if ($('#song-add').css('display') == 'none') {
        $('#song-add').css('display', 'block');
      } else {
        $('#song-add').css('display', 'none');
      }
      break;
    case KEYS.ESC:
      $('.close-btn:not(.default)').click();
      break;
    default:
      return;
  }
});

$('a.active').click(function(e) {
  e.preventDefault();
});

$(".btn-file").click(function(e) {
  $('#song-file-input').click();
});

$('#link-input-btn').click(function(e) {
    q.addSong($('#link-input').val(), function(){});
});

$('#link-input').on('keypress', function(event) {
  event.stopPropagation();
  if (event.which == KEYS.ENTER) {
    console.log("adding");
    q.addSong(event.target.value, function(){});
  }
})

$(".next-song").click(function(e) {
  q.next();
});
$(".prev-song").click(function(e) {
  q.previous();
});

$('.repeat').click(function(e) {
  $(e.currentTarget).toggleClass('selected');
  q.toggleRepeat();
});

$(".play-pause").click(function(e) {
  if (q.isPlaying()) {
    q.pause();
  } else {
    q.play();
  }
});

$(".close-btn").click(function(e) {
  var hide = e.currentTarget.dataset.hide;
  var show = e.currentTarget.dataset.show;
  console.log(hide, show);
    $(hide).css('display', 'none');
  if (show) {
    $(show).css('display', 'block')
  }
})

$("#add-song").click(function(e) {
  $('#song-add').css('display', 'block');
})

$('.playlist').on('dblclick', '.song', function(e) {
  var newId = e.currentTarget.dataset.id;
  if(q.changing || q.isCurrentSong(newId)) return;
  //q.changing = true;
  q.changeSong(newId, function(){
    q.changing=false;
  });
});

var scrubbing = false;
var scrubbed = false;
$('.progress-bar-wrap').on('mousedown', function(e) {
  if (q.now() == undefined) return;
  scrubbing = true;
  var offset = $(e.currentTarget).offset();
  var px = e.pageX - offset.left;
  var total = $(e.currentTarget).innerWidth();
  var pc = px / total * 100;
  $('.progress-bar').css('width', pc + '%');
});

$('.progress-bar-wrap').on('mousemove', function(e) {
  if (q.now() == undefined || !scrubbing) return;
  var offset = $(e.currentTarget).offset();
  var px = e.pageX - offset.left;
  var total = $(e.currentTarget).innerWidth();
  var pc = px / total * 100;
  $('.progress-bar').css('width', pc + '%');
});

$('.progress-bar-wrap').on('mouseup', function(e) {
  scrubbing = false;
  if (q.now() == undefined) return;
  console.log('UP');
  var offset = $(e.currentTarget).offset();
  var px = e.pageX - offset.left;
  var total = $(e.currentTarget).innerWidth();
  var pc = px / total * 100;
  q.scrub(pc);
  scrubbed = true;
});

$('.current-song').on('contentChanged', function(e, isOverflowing) {
  if (isOverflowing) {
    $(this).parent().find('.overflow-help').addClass('active');
    var speed = $(this).outerWidth() * .03;
    console.log(speed);
    this.parentNode.style.animationDuration = speed + 's';
    this.parentNode.style.webkitAnimationDuration = speed + 's';
    this.parentNode.style.mozAnimationDuration = speed + 's';
  } else {
    $(this).parent().find('.overflow-help').removeClass('active');
  }
});
function scrollText(selector, speed=6000, delay=3000, isInfinite=true) {
  if ($(selector).find('.overflowing').length == 0) {
    console.log("stop!");
    $(selector).finish();
    return;
  }
  setTimeout(function() {
    console.log($(selector).outerWidth(true))
    $(selector).animate({
      left: '-' + $(selector).outerWidth(true),
    }, speed, function() {
      if (isInfinite) {
        $(selector).animate({
          left:'0',
        }, 0, function() {
          if ($(selector).find('.overflowing').length == 0) {
            console.log($(selector));
            return;
          }
          scrollText(selector, speed, delay, isInfinite);
        });
      }
    });
  }, delay);
}
