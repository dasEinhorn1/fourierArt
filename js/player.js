/*
 * Author: Adam Hayward
 * Version: 1.1
 * This file holds the song and playlist related components of the project
 * (logic and some ui)
*/

// volume of all songs to be played
const VOLUME = 1;
// how time should be formatted in timeToStringFormat
const TIME_FORMAT = [':', ':','']

// Keycodes
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

// the queue for later initialization
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

/*
 * Song holds all song-related metadata, as well as a p5 SoundFile
 * https://p5js.org/reference/#/p5.SoundFile for details on that
 */
class Song {
  constructor(path, id, name = undefined) {
    this._path = path;
    this._name = name || path.split("/").pop();
    this._id = id;
    this._loader = undefined;
  }

  set name    (name)    { this._name = name; }
  get name    ()        { return this._name; }
  set loader  (loader)  { this._loader = loader; }
  get loader  ()        { return this._loader; }
  get id      ()        { return this._id; }
  set id      (id)      { this._id = id; }

  load(callback) {
    return this._loader = new Promise(function (resolve, reject) {
      loadSound(this._path, (song) => { resolve(song) }, (err) => { reject(err) }).bind(this);
    }).then((song) => {
      this._loader.setVolume(VOLUME);
      this._loader.playMode('restart');
      return song;
    });
  }

  /* Get the duration of a song in seconds*/
  duration() {
    return this._loader.then((song)=>song.duration());
  }

  /* Get the current position in seconds in the song */
  currentTime() {
    return this._loader.then((song)=> song.currentTime());
  }

  /* Nicely format the duration as a string */
  getDurationString() {
    return timeToStringFormat(this.duration());
  }

  /* Set what happens once the song finishes */
  setOnEnded(callback) {
    this._loader.then((song)=> song.onended(callback));
  }
}

/*
 * PlayQueue holds an array of songs and manages playing them sequentially
 * It also acts as a control of sorts for the ui controls/ updates.
 * TODO: Move UI related functions to a UI Manager object or just global
 *  functions
 */
class PlayQueue {

  constructor(target) {
    this._ui = target; // the selecto of the playlist table element
    this._playlist = [];
    this._current = 0;
    this._last = 0;
    this._repeat = false;
    this._changing = false;
  }

  get ui        ()         { return this._ui; }
  set ui        (ui)       { this._ui = ui;   }
  get playlist  ()         { return this._playlist}
  set playlist  (songs)    { this._playlist = songs}
  get current   ()         { return this._current; }
  set current   (current)  { this._current = current; }
  get last      ()         { return this._last; }
  set last      (last)     { this._last = last; }
  get repeat    ()         { return this._repeat; }
  set repeat    (repeat)   { this._repeat = repeat; }
  get changing  ()         { return this._changing; }
  set changing  (changing) { this._changing = changing; }

  get currentSong () { return this._playlist[this._current]; }

  // get the SoundFile associated w/ the current song
  now() {
    if (this.currentSong) {
      return this.currentSong.loader;
    }
  }

  //return an object with the all time info about the currentSong
  time() {
    const timeObj = {
      current : 0,
      total : 0,
      diff : 0
    };
    if (!this.now()) {
      return timeObj;
    }
    timeObj.current = this.currentSong.currentTime();
    timeObj.total = this.currentSong.duration();
    timeObj.diff = timeObj.total - timeObj.current;
    return timeObj;
  }

  // returns boolean as to whether song is playing
  isPlaying() {
    if (this.currentSong === undefined) {
      console.log('song is undefined');
      return false;
    }
    if (this.now() === undefined) {
      console.log('song loader is undefined');
      return false;
    }
    return this.now().isPlaying();
  }

  // changes the current song (and plays it)
  changeSong(id, callback = function(){}) {
    if (this.changing) {
      return;
    }
    this.changing = true;
    if (id !== undefined) {
      let i = this.getSongIndex(id);
      if (i !== -1 && i !== this.current) {
        this.stop();
        this.last = this.current;
        this.current = i;
        this.stop();
        this.play();
      }
    }
    callback();
  }

  // plays the current song from its current position or a new one if startAt is
  // not undefined
  play(startAt) {
    if (!this.now().isLoaded()) return;
    console.log('PLAY');
    this.changePlaying(this.currentSong.id);
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

  // pauses the current song and updates the ui
  // TODO: move anim references out of PlayQueue entirely
  pause() {
    playButtonUpdate(false);
    this.now().pause();
    anim.pause();
  }

  // Stops playback of the current song and resets its position to the beginning
  // takes a callback for what to do after playback is stopped
  // updates the ui
  stop(callback = function(){}) {
    playButtonUpdate(false);
    this.now().stop();
    anim.pause();
    anim.reset();
    callback();
  }

  // moves to the next song in the playlist and plays it.
  next() {
    if (this.current + 1 === this.length() && !this.repeat) {
      return;
    }
    this.stop(() => {
      this.last = this.current;
      this.current++;
      if (this.current === this.length() && this.repeat) {
        this.current = 0;
      }
      this.play();
    });
  }

  // moves to the previous song in the playlist and plays it
  previous() {
    this.last = this.current;
    if (this.current - 1 < 0) {
      this.stop();
      this.play();
      return;
    }
    this.stop(() => {
      this.current--;
      console.log(this.current);
      if (this.current < 0) {
        this.current = 0;
      }
      this.play();
    });
  }

  // move to a new position in the song given seconds, then play from there
  jumpTo(position) {
    if (position < 0) position = 0;
    console.log(position);
    this.stop(() => {
      this.play(position);
    });
  }

  // move the song forward or back relative to it's current position
  jumpBy(jump = 10) {
    if (this.now()) {
      const t = this.now().currentTime();
      this.jumpTo(t + jump);
    }
  }

  // get the total duration of the playlist in seconds
  totalDuration() {
    const l = this.playlist.length;
    let totalDur = 0;
    for (let i = 0; i < l; i++){
      let s = this.playlist[i];
      totalDur += s.duration();
    }
    return totalDur;
  }

  // gets the total duration of the playlist as a nicely formatted string
  durationAsString() {
    return timeToStringFormat(this.totalDuration());
  }

  // impermanently shuffles the order of the playlist
  // TODO: write a shuffling algorithm
  shuffle() {
    return;
  }

  // turns repeat either on or off (opposite of current)
  toggleRepeat() {
    this.repeat = !this.repeat;
  }

  // function to be called when a song ends
  songEnded() {
    let c = this.now().currentTime();
    let d = this.now().duration();
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

  // gets the length of the playlist
  length() {
    return this.playlist.length;
  }

  // create and add a song to the playlist based on a given path
  // execute given callback
  addSong(path, cb = function(){}, name=undefined) {
    let i = this.length();
    startLoad();
    const s = new Song(path, i, name);
    const _this = this;
    s.load(() => {
      console.log("loaded");
      endLoad();
      this.playlist.push(s);
      this.reloadSongListing();
      s.setOnEnded(function() {
        _this.songEnded();
      });
      if (i === 0) {
        this.current = i
        this.play();
      }
      cb();
    });
  }

  // checks whether a song by a given id is in the playlist
  isCurrentSong(id) {
    return this.currentSong.id === id;
  }

  // get the index of a song in the playlist by its id
  getSongIndex(id) {
    for (let i = 0; i < this.length(); i++) {
      if (this.playlist[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  // switch which song is playing in the ui given the songs id
  changePlaying(id) {
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
  }

  // generates an entry for the ui playlist given a song
  generateListItem(song) {
    var li = "<tr class='song' data-id='" + song.id + "'>"
        + "<td class='playing' data-playing=" + this.isCurrentSong(song.id) + ">"
          + "<i class='fa fa-volume-up' aria-hidden='true'></i>"
        + "</td>"
        + "<td class='name'>" + song.name + "</td>"
        + "<td class='time'>" + song.getDurationString() + "</td>"
      + "</tr>";
    return li;
  }

  // reload the playlist ui to contain all the songs in the object
  reloadSongListing() {
    console.log("update");
    if (this.length() <= $(this.ui).find('li').length) return;
    for (let i = 0; i < this.length(); i++) {
      var s = this.playlist[i];
      var sEl = $(this.ui).find('.song[data-id="' + s.id + '"]')
      if (sEl.length == 0){
        let songListing = this.generateListItem(s);
        $(this.ui).append(songListing);
      }
    }
  }
  // update the ui progress bars to meet the current time of the current song
  updateProgressBars(timeObj) {
    $('.progress-bar').css('width',((timeObj.current * 100)/timeObj.total) + '%');
  }

  // read from the progress bars and jump to that position in the song
  scrub(pc, callback=function(){}) {
    $('.progress-bar').css('width', pc + '%');
    var newCurrent = pc * q.now().duration() / 100;
    this.jumpTo(newCurrent);
    callback();
  }
}


function preload(){
  q = new PlayQueue(".playlist");
}
function setup(){}

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
