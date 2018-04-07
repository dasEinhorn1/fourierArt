(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Promise = require('es6-promise-polyfill').Promise;

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

},{"es6-promise-polyfill":2}],2:[function(require,module,exports){
(function (global){
(function(global){

//
// Check for native Promise and it has correct interface
//

var NativePromise = global['Promise'];
var nativePromiseSupported =
  NativePromise &&
  // Some of these methods are missing from
  // Firefox/Chrome experimental implementations
  'resolve' in NativePromise &&
  'reject' in NativePromise &&
  'all' in NativePromise &&
  'race' in NativePromise &&
  // Older version of the spec had a resolver object
  // as the arg rather than a function
  (function(){
    var resolve;
    new NativePromise(function(r){ resolve = r; });
    return typeof resolve === 'function';
  })();


//
// export if necessary
//

if (typeof exports !== 'undefined' && exports)
{
  // node.js
  exports.Promise = nativePromiseSupported ? NativePromise : Promise;
  exports.Polyfill = Promise;
}
else
{
  // AMD
  if (typeof define == 'function' && define.amd)
  {
    define(function(){
      return nativePromiseSupported ? NativePromise : Promise;
    });
  }
  else
  {
    // in browser add to global
    if (!nativePromiseSupported)
      global['Promise'] = Promise;
  }
}


//
// Polyfill
//

var PENDING = 'pending';
var SEALED = 'sealed';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';
var NOOP = function(){};

function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

// async calls
var asyncSetTimer = typeof setImmediate !== 'undefined' ? setImmediate : setTimeout;
var asyncQueue = [];
var asyncTimer;

function asyncFlush(){
  // run promise callbacks
  for (var i = 0; i < asyncQueue.length; i++)
    asyncQueue[i][0](asyncQueue[i][1]);

  // reset async asyncQueue
  asyncQueue = [];
  asyncTimer = false;
}

function asyncCall(callback, arg){
  asyncQueue.push([callback, arg]);

  if (!asyncTimer)
  {
    asyncTimer = true;
    asyncSetTimer(asyncFlush, 0);
  }
}


function invokeResolver(resolver, promise) {
  function resolvePromise(value) {
    resolve(promise, value);
  }

  function rejectPromise(reason) {
    reject(promise, reason);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch(e) {
    rejectPromise(e);
  }
}

function invokeCallback(subscriber){
  var owner = subscriber.owner;
  var settled = owner.state_;
  var value = owner.data_;  
  var callback = subscriber[settled];
  var promise = subscriber.then;

  if (typeof callback === 'function')
  {
    settled = FULFILLED;
    try {
      value = callback(value);
    } catch(e) {
      reject(promise, e);
    }
  }

  if (!handleThenable(promise, value))
  {
    if (settled === FULFILLED)
      resolve(promise, value);

    if (settled === REJECTED)
      reject(promise, value);
  }
}

function handleThenable(promise, value) {
  var resolved;

  try {
    if (promise === value)
      throw new TypeError('A promises callback cannot return that same promise.');

    if (value && (typeof value === 'function' || typeof value === 'object'))
    {
      var then = value.then;  // then should be retrived only once

      if (typeof then === 'function')
      {
        then.call(value, function(val){
          if (!resolved)
          {
            resolved = true;

            if (value !== val)
              resolve(promise, val);
            else
              fulfill(promise, val);
          }
        }, function(reason){
          if (!resolved)
          {
            resolved = true;

            reject(promise, reason);
          }
        });

        return true;
      }
    }
  } catch (e) {
    if (!resolved)
      reject(promise, e);

    return true;
  }

  return false;
}

function resolve(promise, value){
  if (promise === value || !handleThenable(promise, value))
    fulfill(promise, value);
}

function fulfill(promise, value){
  if (promise.state_ === PENDING)
  {
    promise.state_ = SEALED;
    promise.data_ = value;

    asyncCall(publishFulfillment, promise);
  }
}

function reject(promise, reason){
  if (promise.state_ === PENDING)
  {
    promise.state_ = SEALED;
    promise.data_ = reason;

    asyncCall(publishRejection, promise);
  }
}

function publish(promise) {
  var callbacks = promise.then_;
  promise.then_ = undefined;

  for (var i = 0; i < callbacks.length; i++) {
    invokeCallback(callbacks[i]);
  }
}

function publishFulfillment(promise){
  promise.state_ = FULFILLED;
  publish(promise);
}

function publishRejection(promise){
  promise.state_ = REJECTED;
  publish(promise);
}

/**
* @class
*/
function Promise(resolver){
  if (typeof resolver !== 'function')
    throw new TypeError('Promise constructor takes a function argument');

  if (this instanceof Promise === false)
    throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');

  this.then_ = [];

  invokeResolver(resolver, this);
}

Promise.prototype = {
  constructor: Promise,

  state_: PENDING,
  then_: null,
  data_: undefined,

  then: function(onFulfillment, onRejection){
    var subscriber = {
      owner: this,
      then: new this.constructor(NOOP),
      fulfilled: onFulfillment,
      rejected: onRejection
    };

    if (this.state_ === FULFILLED || this.state_ === REJECTED)
    {
      // already resolved, call callback async
      asyncCall(invokeCallback, subscriber);
    }
    else
    {
      // subscribe
      this.then_.push(subscriber);
    }

    return subscriber.then;
  },

  'catch': function(onRejection) {
    return this.then(null, onRejection);
  }
};

Promise.all = function(promises){
  var Class = this;

  if (!isArray(promises))
    throw new TypeError('You must pass an array to Promise.all().');

  return new Class(function(resolve, reject){
    var results = [];
    var remaining = 0;

    function resolver(index){
      remaining++;
      return function(value){
        results[index] = value;
        if (!--remaining)
          resolve(results);
      };
    }

    for (var i = 0, promise; i < promises.length; i++)
    {
      promise = promises[i];

      if (promise && typeof promise.then === 'function')
        promise.then(resolver(i), reject);
      else
        results[i] = promise;
    }

    if (!remaining)
      resolve(results);
  });
};

Promise.race = function(promises){
  var Class = this;

  if (!isArray(promises))
    throw new TypeError('You must pass an array to Promise.race().');

  return new Class(function(resolve, reject) {
    for (var i = 0, promise; i < promises.length; i++)
    {
      promise = promises[i];

      if (promise && typeof promise.then === 'function')
        promise.then(resolve, reject);
      else
        resolve(promise);
    }
  });
};

Promise.resolve = function(value){
  var Class = this;

  if (value && typeof value === 'object' && value.constructor === Class)
    return value;

  return new Class(function(resolve){
    resolve(value);
  });
};

Promise.reject = function(reason){
  var Class = this;

  return new Class(function(resolve, reject){
    reject(reason);
  });
};

})(typeof window != 'undefined' ? window : typeof global != 'undefined' ? global : typeof self != 'undefined' ? self : this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
