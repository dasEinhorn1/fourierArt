const DEFAULT_SONG = "media/sound/Death_Grips_-_Guillotine_(It_goes_Yah).mp3";
const VOLUME = 1;
const TIME_FORMAT = [':', ':','']

const KEYS = {
  ESC : 27,
  SPACE : 32,
  LEFT : 37,
  UP : 38,
  RIGHT : 39,
  DOWN : 40,
  ENTER : 36,
  A : 65,
  Q : 81,
  R : 82,
  T : 84
}

var q;

function timeToStringFormat(seconds, delimeters=[]) {
  let hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;
  let minutes = Math.floor(seconds / 60);
  seconds = Math.round(seconds % 60);
  let str = '';
  if (hours > 0) {
    str += hours + (delimeters[0] || 'h ');
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  str += minutes + (delimeters[1] || 'm ') + seconds + (delimeters[2] || 's');
  return str;
}

class Song {
  constructor(path, id, name=undefined) {
    this.path = path;
    this.name = name || path.split("/").pop();
    this.id = id;
    this.loader = undefined;
  }

  load(callback) {
    this.loader = loadSound(this.path,
      () => { return callback();},
      () => showErrorMessage("Error adding song"));
    if (this.loader) {
      this.loader.setVolume(VOLUME);
      this.loader.playMode('restart');
      return true;
    }
    return false;
  }
  duration() {
    return this.loader.duration();
  }
  currentTime() {
    return this.loader.currentTime();
  }
  getDurationString() {
    return timeToStringFormat(this.duration());
  }
  setOnEnded(callback) {
    this.loader.onended(callback);
  }
}

var PlayQueue = function(target) {
  this.ui = target;
  this.playlist = [];
  this.current = 0;
  this.last = 0;
  this.repeat = false;
  this.changing = false;
};

PlayQueue.prototype.getCurrentSong = function() {
  return this.playlist[this.current];
};

PlayQueue.prototype.now = function() {
  if (this.playlist[this.current]) {
    return this.playlist[this.current].loader;
  }
};

PlayQueue.prototype.time = function() {
  var timeObj = {
    current : 0,
    total : 0,
    diff : 0
  };
  if (!this.now()) {
    return timeObj;
  }
  timeObj.current = this.getCurrentSong().currentTime();
  timeObj.total = this.getCurrentSong().duration();
  timeObj.diff = timeObj.total - timeObj.current;
  return timeObj;
};

PlayQueue.prototype.isPlaying = function() {
  if (this.playlist[this.current] == undefined) {
    console.log('song is undefined');
    return false;
  }
  if (this.playlist[this.current].loader == undefined) {
    console.log('song loader is undefined');
    return false;
  }
  return this.now().isPlaying();
}
PlayQueue.prototype.changeSong = function(id, callback) {
  if (this.changing) {
    return;
  }
  this.changing = true;
  if (id != undefined) {
    let i = this.getSongIndex(id);
    if (i != -1 && i != this.current) {
      this.stop();
      this.last = this.current;
      this.current = i;
      this.stop();
      this.play();
    }
  }
  callback();
}
PlayQueue.prototype.play = function(startAt) {
  if (!this.now().isLoaded()) return;
  console.log('PLAY');
  this.changePlaying(this.getCurrentSong().id);
  // anim.pause();
  playButtonUpdate(true);
  if (startAt === undefined) {
    this.now().play();
    console.log(this.now().isPlaying());
  } else {
    console.log('start with time: ' + startAt);
    this.now().play(0, 1, VOLUME, startAt);
  }
  anim.play();
}

PlayQueue.prototype.pause = function() {
  playButtonUpdate(false);
  this.now().pause();
  anim.pause();
}

PlayQueue.prototype.stop = function(callback) {
  if (callback === undefined) {
    callback = function(){};
  }
  playButtonUpdate(false);
  this.now().stop();
  anim.pause();
  anim.reset();
  callback();
}

PlayQueue.prototype.next = function () {
  console.log(this.current);
  if (this.current + 1 === this.length() && !this.repeat) {
    return;
  }
  var queue = this;
  this.stop(function(){
    this.last = queue.current;
    queue.current++;
    if (queue.current === queue.length() && queue.repeat) {
      queue.current = 0;
    }
    queue.play();
  });
};

PlayQueue.prototype.previous = function () {
  var queue = this;
  this.last = this.current;
  if (this.current - 1 < 0) {
    this.stop();
    this.play();
    return;
  }
  this.stop(function(){
    queue.current--;
    console.log(queue.current);
    if (queue.current < 0) {
      queue.current = 0;
    }
    queue.play();
  });
};

PlayQueue.prototype.last = function() {
  return this.last;
};

PlayQueue.prototype.totalDuration = function() {
  var l = this.playlist.length;
  var totalDur = 0;
  for (let i = 0; i < this.playlist.length; i++){
    var s = this.playlist[i];
    totalDur += s.duration();
  }
  return totalDur;
}

PlayQueue.prototype.durationAsString = function () {
  return timeToStringFormat(this.totalDuration());
};

PlayQueue.prototype.shuffle = function() {
  return;
}

PlayQueue.prototype.songEnded = function() {
  var c = this.now().currentTime();
  var d = this.now().duration();
  console.log(c,d);
  if (Math.abs(d - c) < .05) {
    console.log('Song Ended. Moving on.');
    this.next();
  } else if (c === 0) {
    console.log('Song may have restarted');
    console.log(this.last, this.current);
  } else {
    console.log('Song probably hasn\'t ended.' + (d - c));
    return;
  }
}

PlayQueue.prototype.length  = function() {
  return this.playlist.length;
}

PlayQueue.prototype.addSong = function(path, cb = undefined, name=undefined) {
  let i = this.length();
  startLoad();
  var s = new Song(path, i, name);
  var queue = this;
  s.load(function(){
    console.log("loaded");
    endLoad();
    queue.playlist.push(s);
    queue.reloadSongListing();
    s.setOnEnded(function() {
      queue.songEnded();
    });
    if (i == 0) {
      queue.current = i
      queue.play();
    }
    if(cb) {
      cb();
    }
  });
}
PlayQueue.prototype.isPlayingById = function(id) {
  return this.getCurrentSong().id == id;
}
PlayQueue.prototype.isPlayingSong = function(song) {
  return this.now() == song.loader;
}

PlayQueue.prototype.generateListItem = function(song) {
  var li = "<tr class='song' data-id='" + song.id + "'>"
      + "<td class='playing' data-playing=" + this.isPlayingSong(song) + ">"
        + "<i class='fa fa-volume-up' aria-hidden='true'></i>"
      + "</td>"
      + "<td class='name'>" + song.name + "</td>"
      + "<td class='time'>" + song.getDurationString() + "</td>"
    + "</tr>";
  return li;
}

PlayQueue.prototype.jumpTo = function (position) {
  console.log(position);
  this.stop(() => {
    this.play(position);
  });
};

PlayQueue.prototype.jumpAheadTen = function() {
  if (this.now()) {
    this.jumpTo(this.now().currentTime() + 10);
  }
}

PlayQueue.prototype.toggleRepeat = function() {
  this.repeat = !this.repeat;
}

PlayQueue.prototype.getSongIndex = function(id) {
  for (let i = 0; i < this.length(); i++) {
    if (this.playlist[i].id == id) {
      return i;
    }
  }
  return -1;
}

PlayQueue.prototype.changePlaying = function(id) {
  var songEl = $(this.ui).find('.song[data-id="' + id + '"]');
  if (songEl.length > 0) {
    console.log('changing');
    $(this.ui).find('.playing[data-playing="true"]').attr('data-playing', 'false')
    songEl.find('.playing').attr('data-playing', 'true');
    var name = this.playlist[this.getSongIndex(id)].name;
    $('.current-song').html(name);
    $.each($('.current-song:not(.overflow-help)'), function(k, v) {
      var el = $(v);
      if (el.width() > el.parent().parent().width()){
        console.log('too big');
        el.parent().addClass('overflowing');
        el.trigger('contentChanged', true);
      } else {
        el.trigger('contentChanged', false);
        el.parent().removeClass('overflowing');
      }
    });
  }
};

PlayQueue.prototype.reloadSongListing = function() {
  console.log("update");
  if (this.length() > $(this.ui).find('li').length){
    for (let i = 0; i < this.length(); i++) {
      var s = this.playlist[i];
      var sEl = $(this.ui).find('.song[data-id="' + s.id + '"]')
      if (sEl.length == 0){
        songListing = this.generateListItem(s);
        $(this.ui).append(songListing);
      }
    }
  }
}

PlayQueue.prototype.updateProgressBars = function(timeObj) {
  $('.progress-bar').css('width',((timeObj.current * 100)/timeObj.total) + '%');
}

PlayQueue.prototype.scrub = function(pc, callback=function(){}) {
  $('.progress-bar').css('width', pc + '%');
  var newCurrent = pc * q.now().duration() / 100;
  this.jumpTo(newCurrent);
  callback();
}


function preload(){
  q = new PlayQueue(".playlist");
  //q.addSong(DEFAULT_SONG, function() { q.play(); });
}
function setup(){
	//mainS.setVolume(VOLUME);
	//mainS.play();
  //q.play()
}

function togglePlay() {
	if(q.now().isPlaying()) {
		q.pause();
	} else {
		q.play();
	}
}

var startLoad = function() {
	console.log("LOAD");
	$("#load-screen").css('display', 'block');
}
var endLoad = function() {
	console.log("END LOAD");
	$("#load-screen").css('display', 'none');
}

var playButtonUpdate = function(playing) {
  var play = $('.fa-play');
  var pause = $('.fa-pause');
  if (playing) {
    play.css('display', 'none');
    pause.css('display', 'inline-block');
  } else {
    pause.css('display', 'none');
    play.css('display', 'inline-block');
  }
}

var showErrorMessage = function(msg) {
	alert(msg);
}

// Author:  Jacek Becela
// Source:  http://gist.github.com/399624
// License: MIT

jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  return this.each(function(){
    var clicks = 0, self = this;
    jQuery(this).click(function(event){
      clicks++;
      if (clicks == 1) {
        setTimeout(function(){
          if(clicks == 1) {
            single_click_callback.call(self, event);
          } else {
            double_click_callback.call(self, event);
          }
          clicks = 0;
        }, timeout || 300);
      }
    });
  });
}
