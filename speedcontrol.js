//(function() {
////////////////////////////////////////////////////////////////////////////////
/**
 * @filedescription This is a simple script for adding HTML5 speed controls to
 * video elements.
 * @author Benedict Chen (benedict@benedictchen.com)
 */

var sophis = sophis || {};

/** @enum */
var KeyCodes = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
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

  this.createDom();
  this.enterDocument();
};


/** @const */
sophis.VideoControl.CLASS_NAME = 'sophis-video-control';


/**
 * Creates the HTML body of the controls.
 */
sophis.VideoControl.prototype.createDom = function() {
  var fragment = document.createDocumentFragment();
  var container = document.createElement('div');
  var speedIndicator = document.createElement('span');
  var minusButton = document.createElement('button');
  var plusButton = document.createElement('button');
  var closeButton = document.createElement('a');
  container.appendChild(minusButton);
  container.appendChild(speedIndicator);
  container.appendChild(plusButton);
  container.appendChild(closeButton);
  speedIndicator.classList.add('speed-indicator');
  minusButton.textContent = '-';
  minusButton.classList.add('sophis-btn', 'decrease');
  plusButton.textContent = '+';
  plusButton.classList.add('sophis-btn', 'increase');
  closeButton.classList.add('sophis-close-button');
  closeButton.textContent = 'close';
  fragment.appendChild(container);
  this.videoEl_.parentElement.insertBefore(fragment, this.videoEl_);
  this.videoEl_.classList.add('sophis-video');
  this.el_ = container;
  this.el_.classList.add(sophis.VideoControl.CLASS_NAME);
  this.speedIndicator_ = speedIndicator;
  this.minusButton_ = minusButton;
  this.plusButton_ = plusButton;
  this.closeButton_ = closeButton;
};


/**
 * Post-dom creation actions such as adding event listeners.
 */
sophis.VideoControl.prototype.enterDocument = function() {
  var self = this;
  var clickHandler = this.handleClick_.bind(this);
  var keydownHandler = this.handleKeyDown_.bind(this);
  this.el_.addEventListener('click', clickHandler, true);
  this.el_.addEventListener('dblclick', clickHandler, true);
  this.el_.addEventListener('keydown', keydownHandler, true);
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
  this.videoEl_.playbackRate -= 0.10;
};

/**
 * Decreases the current video's playback rate.
 */
sophis.VideoControl.prototype.increaseSpeed = function () {
  this.videoEl_.playbackRate += 0.10;
};

/**
 * Handles native keyboard events.
 * @param {Event} e The native keyboard event.
 * @private
 */
sophis.VideoControl.prototype.handleKeyDown_ = function(e) {
  e.preventDefault();
  e.stopPropagation();
  var keyCode = e.keyCode;
  if (keyCode) {
    switch (keyCode) {
      case KeyCodes.DOWN:
      case KeyCodes.LEFT:
        this.decreaseSpeed();
      break;
      case KeyCodes.UP:
      case KeyCodes.RIGHT:
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
  e.preventDefault();
  e.stopPropagation();
  e.cancelBubble = true;
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
  var clickHandler = this.handleClick_.bind(this);
  this.el_.removeEventListener('click', clickHandler);
  this.el_.removeEventListener('dblclick', clickHandler);
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

////////////////////////////////////////////////////////////////////////////////
//})();
