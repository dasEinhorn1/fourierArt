const DEFAULT_SONG = "media/sound/Death_Grips_-_Guillotine_(It_goes_Yah).mp3";
const VOLUME = .1;
var mainS;
var q;

var Song = function(path, id, name=undefined) {
  this.path = path;
  this.name = name || path.split("/").pop();
  this.id = id;
  this.loader = undefined;
}
Song.prototype.load = function (callback) {
  this.loader = loadSound(this.path, function() {
    callback();
  },
  function(){
    showErrorMessage("Error adding song");
  });
  this.loader.setVolume(VOLUME)
};

Song.prototype.duration = function() {
  return this.loader.duration();
}

Song.prototype.getDurationString = function () {
  var seconds = this.duration();
  var hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;
  var minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  var s = '';
  if (hours > 0) {
    s += hours + "h ";
  }
  s += minutes + "m " + seconds + "s";
  return s;
};

Song.prototype.setOnEnded = function(callback) {
  this.loader.onended(callback);
};

var PlayQueue = function(target) {
  this.ui = target;
  this.playlist = [];
  this.currentSongIndex = 0;
  this.repeat = false;
  this.changing = false;
}
PlayQueue.prototype.getCurrentSong = function() {
  return this.playlist[this.currentSongIndex]
}
PlayQueue.prototype.now = function() {
  return this.playlist[this.currentSongIndex].loader;
}

PlayQueue.prototype.isPlaying = function() {
  if (this.playlist[this.currentSongIndex] == undefined)
    return false;
  if (this.playlist[this.currentSongIndex].loader == undefined)
    return false;

  return this.now().isPlaying();
}
PlayQueue.prototype.changeSong = function(id, callback) {
  if (this.changing) {
    return;
  }
  this.changing = true;
  if (id != undefined) {
    var i = this.getSongIndex(id);
    if (i != -1 && i != this.currentSongIndex) {
      this.stop();
      this.currentSongIndex = i;
      this.stop();
      this.play();
    }
  }
  callback();
}
PlayQueue.prototype.play = function() {
  if (this.now().isLoaded()) {
    playButtonUpdate();
    this.changePlaying(this.getCurrentSong().id);
    anim.play();
    this.now().play();
    var queue = this;
    this.getCurrentSong().setOnEnded(function() {
      queue.next();
    });
    $(".play")
  } else {
    setTimeout(this.play(), 500);
  }
}

PlayQueue.prototype.pause = function() {
  this.getCurrentSong().setOnEnded(function(){});
  playButtonUpdate();
  this.now().pause();
  anim.pause();
}

PlayQueue.prototype.stop = function() {
  playButtonUpdate();
  this.now().stop();
  anim.pause();
  anim.reset();
}

PlayQueue.prototype.next = function () {
  console.log(this.currentSongIndex);
  if (this.currentSongIndex + 1 == this.length() && !this.repeat) {
    return;
  }
  this.getCurrentSong().setOnEnded(function(){});
  this.stop();
  this.currentSongIndex++;
  if (this.currentSongIndex == this.length() && this.repeat) {
    this.currentSongIndex = 0;
  }
  this.play();
};

PlayQueue.prototype.previous = function () {
  this.getCurrentSong().setOnEnded(function(){});
  this.stop();
  this.currentSongIndex--;
  console.log(this.currentSongIndex);
  if (this.currentSongIndex < 0) {
    this.currentSongIndex = 0;
  }
  this.play();
};

PlayQueue.prototype.length= function() {
  return this.playlist.length;
}

PlayQueue.prototype.addSong = function(path, cb = undefined, name=undefined) {
  var i = this.length();

  var s = new Song(path, i, name);
  var queue = this;
  s.load(function(){
    console.log("loaded");
    queue.playlist.push(s);
    queue.reloadSongListing();
    s.setOnEnded(function() {
      queue.next();
    });
    if (i == 0) {
      queue.currentSongIndex = i
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

PlayQueue.prototype.toggleRepeat = function() {
  this.repeat = !this.repeat;
}

PlayQueue.prototype.getSongIndex = function(id) {
  for (var i = 0; i < this.length(); i++) {
    if (this.playlist[i].id == id) {
      return i;
    }
  }
  return -1;
}

PlayQueue.prototype.changePlaying = function(id) {
  console.log('upplay');
  var songEl = $(this.ui).find('.song[data-id="' + id + '"]');
  if (songEl.length > 0) {
    console.log('changing');
    $(this.ui).find('.playing[data-playing="true"]').attr('data-playing', 'false')
    songEl.find('.playing').attr('data-playing', 'true')
  }
};

PlayQueue.prototype.reloadSongListing = function() {
  console.log("update");
  if (this.length() > $(this.ui).find('li').length){
    for (var i = 0; i < this.length(); i++) {
      var s = this.playlist[i];
      var sEl = $(this.ui).find('.song[data-id="' + s.id + '"]')
      if (sEl.length == 0){
        songListing = this.generateListItem(s);
        $(this.ui).append(songListing);
      }
    }
  }
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

var playButtonUpdate = function() {
  var play = $('.fa-play');
  var pause = $('.fa-pause');
  if (q.isPlaying()) {
    pause.css('display', 'none');
    play.css('display', 'inline-block');
    return true;
  } else {
    play.css('display', 'none');
    pause.css('display', 'inline-block');
    return false;
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
