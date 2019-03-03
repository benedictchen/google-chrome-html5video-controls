/**
 * @filedescription This is a simple script for adding HTML5 speed controls to
 * video elements.
 * @author Benedict Chen (benedict@benedictchen.com)
 */

var sophis = sophis || {};

var increment = 0.1;
var keyCombo = 'udar';
var blackListedSites = ['vine.com'];

var isCurrentSiteBlackListed = function() {
  blackListedSites.forEach((blackListedSite) => {
    if (blackListedSite && sophis.VideoControl.isLocation(blackListedSite)) {
      sophis.VideoControl.killAll()
    }
  });
};

chrome.storage.sync.get({
  'increment': increment,
  'keyCombo': keyCombo,
  'blackListedSites': blackListedSites
}, function(items) {
  this.increment = items.increment;
  this.keyCombo = items.keyCombo;
  blackListedSites = (items.blackListedSites &&
                      items.blackListedSites.split(/[\t\n\r,\s]/g)
                                            .filter((item) => !!item))|| [];
  // NOTE: The issue here is that the settings are retreived after the component
  // is loaded, so we need to retroactively remove the items.
  if (isCurrentSiteBlackListed()) {
    sophis.VideoControl.killAll()
  }
});

/**
 * Keyboard character mappings from their numeric values.
 * @type {Object.<String:Number>}
 * @enum
 */
var KeyCodes = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  PAGEUP: 33,
  PAGEDOWN: 34
};

/**
 * A mapping of actions to keyboard character values.
 * @type {Object.<String>}
 * @enum
 */
var KeyMapping = {
  DECREASE_SPEED: 'A',
  INCREASE_SPEED: 'S'
};

/**
 * Controls an HTML video with playback speed.
 * @param {Element} targetEl The target element to inject a video control into.
 */
sophis.VideoControl = function(targetEl) {
  /**
   * The html body that stores the controls.
   * @private {Element}
   */
  this.el_ = null;

  /**
   * The shadow container that stores the controls.
   * @private {Element}
   */
  this.bgEl_ = null;

  /**
   * The video element.
   * @private {Element}
   */
  this.videoEl_ = targetEl;

  /**
   * @private {Element}
   */
  this.speedIndicator_ = null;

  /**
   * The button that destroys the component
   * @private {Element}
   */
  this.closeButton_ = null;

  if (!isCurrentSiteBlackListed()) {
    this.createDom();
    this.enterDocument();
    sophis.VideoControl.instances.push(this);
  } else {
    console.warn('Current site is blacklisted from speed controller.');
  }
};

/** @const */
sophis.VideoControl.CLASS_NAME = 'sophis-video-control';

/**
 * Keeps track of all current instances of current class.
 * @type {Array.<sophis.VideoControl>}
 */
sophis.VideoControl.instances = [];

/**
 * Removes all instances of the current class.
 */
sophis.VideoControl.killAll = function() {
  sophis.VideoControl.instances.forEach((instance) => instance.dispose());
  sophis.VideoControl.instances = [];
}

/**
 * Creates the HTML body of the controls.
 */
sophis.VideoControl.prototype.createDom = function() {
  var container = document.createElement('div');
  var shadow = container.createShadowRoot();
  var bg = document.createElement('div');
  var speedIndicator = document.createElement('span');
  var minusButton = document.createElement('button');
  var plusButton = document.createElement('button');
  var closeButton = document.createElement('a');
  shadow.appendChild(bg);
  bg.appendChild(minusButton);
  bg.appendChild(speedIndicator);
  bg.appendChild(plusButton);
  bg.appendChild(closeButton);
  bg.classList.add('sophis-bg');
  speedIndicator.classList.add('speed-indicator');
  minusButton.textContent = '-';
  minusButton.classList.add('sophis-btn', 'decrease');
  plusButton.textContent = '+';
  plusButton.classList.add('sophis-btn', 'increase');
  closeButton.classList.add('sophis-btn', 'sophis-close-button');
  closeButton.textContent = 'close';
  this.videoEl_.parentElement.insertBefore(container, this.videoEl_);
  this.videoEl_.classList.add('sophis-video');
  this.el_ = container;
  this.el_.classList.add(sophis.VideoControl.CLASS_NAME);
  this.bgEl_ = bg;
  this.speedIndicator_ = speedIndicator;
  this.minusButton_ = minusButton;
  this.plusButton_ = plusButton;
  this.closeButton_ = closeButton;
  // Vimeo iframe hack.  They are intercepting all our events with a hidden
  // element.
  if (this.isLocationVimeo_()) {
    var clickInterceptingScum = document.querySelector('.player .target');
    if (clickInterceptingScum) {
      clickInterceptingScum.parentElement.removeChild(clickInterceptingScum);
    }
  }
};


/**
 * Post-dom creation actions such as adding event listeners.
 */
sophis.VideoControl.prototype.enterDocument = function() {
  var self = this;
  var clickHandler = this.handleClick_.bind(this);
  var dblClickHandler = this.handleDblClick_.bind(this);
  var keydownHandler = this.handleKeyDown_.bind(this);
  var keyPressHandler = this.handleKeyPress_.bind(this);
  var dragHandler = this.handleDragEndEvent_.bind(this);
  this.bgEl_.addEventListener('click', clickHandler, true);
  this.bgEl_.addEventListener('dblclick', dblClickHandler, true);
  document.body.addEventListener('keydown', keydownHandler, true);
  document.body.addEventListener('keypress', keyPressHandler, true);
  document.body.addEventListener('dragend', dragHandler, true);
  this.el_.setAttribute('draggable', true);
  // Set speed indicator to correct amount.
  this.speedIndicator_.textContent = this.getSpeed();
  this.videoEl_.addEventListener('ratechange', function() {
    self.speedIndicator_.textContent = self.getSpeed();
  });
};

/**
 * Increases the current video's playback rate.
 */
sophis.VideoControl.prototype.decreaseSpeed = function () {
  this.videoEl_.playbackRate = Math.round((this.videoEl_.playbackRate - Number(increment)) * 100) / 100;
};

/**
 * Decreases the current video's playback rate.
 */
sophis.VideoControl.prototype.increaseSpeed = function () {
  this.videoEl_.playbackRate = Math.round((this.videoEl_.playbackRate + Number(increment)) * 100) / 100;
};

/**
 * Determines if the current video element is playing.
 * @return {Boolean} Whether or not the video is playing.
 * @private
 */
sophis.VideoControl.prototype.isPlaying_ = function() {
  var videoEl = this.videoEl_;
  return videoEl.currentTime > 0 && !videoEl.paused && !videoEl.ended;
};

sophis.VideoControl.prototype.hasFocus = function() {
  var activeEl = document.activeElement;
  if (activeEl.nodeName === 'BODY') {
    return false;
  }
  return (activeEl && activeEl.querySelector('video, .sophis-video-control'));
};

/**
 * Handles the native `keyPress` events.
 * @param {Event} e The native key press event.
 */
sophis.VideoControl.prototype.handleKeyPress_ = function(e) {
  if (!this.isPlaying_() || !this.hasFocus() || !e.keyCode) {
    return;
  }
  var characterValue = String.fromCharCode(e.keyCode).toUpperCase();
  if (characterValue) {
    switch(characterValue) {
      case KeyMapping.INCREASE_SPEED:
        this.increaseSpeed();
        break;
      case KeyMapping.DECREASE_SPEED:
        this.decreaseSpeed();
        break;
    }
  }
}

/**
 * Handles native `keyDown` events.
 * @param {Event} e The native keyDown event.
 * @private
 */
sophis.VideoControl.prototype.handleKeyDown_ = function(e) {
  if (!this.isPlaying_() || !this.hasFocus()) {
    return;
  }
  var keyCode = e.keyCode;
  if (keyCode && keyCombo === 'pgud') {
    switch (keyCode) {
      case KeyCodes.PAGEDOWN:
        this.decreaseSpeed();
      break;
      case KeyCodes.PAGEUP:
        this.increaseSpeed();
      break;
      default:
        this.videoEl_.focus();
        return false;
    }
  }
  else if (keyCode && keyCombo === 'lrar') {
    switch (keyCode) {
      case KeyCodes.LEFT:
        this.decreaseSpeed();
      break;
      case KeyCodes.RIGHT:
        this.increaseSpeed();
      break;
      default:
        this.videoEl_.focus();
        return false;
    }
  }
  else if (keyCode && keyCombo === 'udar') {
    switch (keyCode) {
      case KeyCodes.DOWN:
        this.decreaseSpeed();
      break;
      case KeyCodes.UP:
        this.increaseSpeed();
      break;
      default:
        this.videoEl_.focus();
        return false;
    }
  }
};

/**
 * Handles a user clicking on the video controls.
 * @param {Event} e The native click event.
 * @private
 */
sophis.VideoControl.prototype.handleClick_ = function(e) {
  if (!e.target.classList.contains('sophis-btn')) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  if (e.target === this.minusButton_) {
    this.decreaseSpeed();
  } else if (e.target === this.plusButton_) {
    this.increaseSpeed();
  } else if (e.target === this.closeButton_) {
    this.dispose();
  }
  // Redundant if we listen for 'ratechange', but do it anyway
  this.speedIndicator_.textContent = this.getSpeed();
  return false;
};

/**
 * Handles a double-click event on the video controls.
 * @param {Event} e The native click event.
 * @private
 */
sophis.VideoControl.prototype.handleDblClick_ = function(e) {
  if (!e.target.classList.contains('sophis-btn')) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handles when the user drags the control node.
 * @param {Event} e The native drag event.
 * @private
 */
sophis.VideoControl.prototype.handleDragEndEvent_ = function(e) {
  let leftPosition = Math.max(0, e.clientX);
  // BUG: For whatever reason, the drag offset height is wonky and
  // is arbitrarily approximately 80 pixels pushed downward.
  let topPosition = Math.max(0, e.clientY - this.el_.offsetHeight - 80);
  this.el_.style.left = `${leftPosition}px`;
  this.el_.style.top = `${topPosition}px`;
};

/**
 * Determines whether or not the current page is being executed within
 * the boundaries of an iframe.
 * @return {Boolean} Whether or not the current page is an iframe.
 * @private
 */
sophis.VideoControl.prototype.isEmbeddedInIframe_ = function() {
  return window.self !== window.top;
};

/**
 * Determines whether we are coming from a particular URL.
 * @param {String|RegExp} url The URL patten to match against.
 * @return {Boolean} Whether or not the current window is from a URL.
 */
sophis.VideoControl.isLocation = function(url) {
  return !!window.location.href.match(url);
};

/**
 * Determines whether we are coming from a Vimeo URL.
 * @return {Boolean} Whether or not the current window is from Vimeo.
 * @private
 */
sophis.VideoControl.prototype.isLocationVimeo_ = function() {
  return sophis.VideoControl.isLocation('vimeo');
};

/**
 * Gets the current speed of the player.
 * @return {String} The playback speed/rate of the video.
 */
sophis.VideoControl.prototype.getSpeed = function() {
  return parseFloat(this.videoEl_.playbackRate).toFixed(2);
};

/**
 * Destroys and removes the component from page.
 */
sophis.VideoControl.prototype.dispose = function() {
  this.el_.parentNode.removeChild(this.el_);
};

/**
 * Finds all video elements that have no video control yet and
 * adds a new one.
 */
sophis.VideoControl.insertAll = function () {
  var videoTags = document.getElementsByTagName('video');
  Array.prototype.forEach.call(videoTags, function(videoTag) {
    if (!videoTag.getAttribute('sophis-video-control')) {
      videoTag.setAttribute('sophis-video-control', true);
      new sophis.VideoControl(videoTag);
    }
  });
};

// Listen for new video elements and inject into it.
document.addEventListener('DOMNodeInserted', function(event) {
  var node = event.target || null;
  if (node && node.nodeName === 'VIDEO') {
    new sophis.VideoControl(node);
  }
});

sophis.VideoControl.insertAll();
// Ghetto polling for new video elements being added to the page.
// Necessary for Tuts+ and many non-standard implementations.
setInterval(sophis.VideoControl.insertAll, 1000);

