/**
 * @filedescription This is a simple script for adding HTML5 speed controls to
 * video elements.
 * @author Benedict Chen (benedict@benedictchen.com)
 */

var sophis = sophis || {};



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
  container.appendChild(minusButton);
  container.appendChild(speedIndicator);
  container.appendChild(plusButton);
  speedIndicator.classList.add('speed-indicator');
  minusButton.textContent = "-";
  minusButton.classList.add('btn', 'decrease');
  plusButton.textContent = "+";
  plusButton.classList.add('btn', 'increase');
  fragment.appendChild(container);
  this.videoEl_.parentElement.insertBefore(fragment, this.videoEl_);
  this.el_ = container;
  this.el_.classList.add(sophis.VideoControl.CLASS_NAME);
  this.speedIndicator_ = speedIndicator;
  this.minusButton_ = minusButton;
  this.plusButton_ = plusButton;
};


/**
 * Post-dom creation actions such as adding event listeners.
 */
sophis.VideoControl.prototype.enterDocument = function() {
  var clickHandler = this.handleClick.bind(this);
  this.el_.addEventListener('click', clickHandler);
  this.el_.addEventListener('dblclick', clickHandler);
  // Set speed indicator to correct amount.
  this.speedIndicator_.textContent = this.getSpeed();
};

sophis.VideoControl.prototype.handleClick = function(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target == this.minusButton_) {
    this.videoEl_.playbackRate -= 0.25;
  } else if (e.target == this.plusButton_) {
    this.videoEl_.playbackRate += 0.25;
  }
  this.speedIndicator_.textContent = this.getSpeed();
  return false;
};
 
/**
 * Gets the current speed of the player.
 */
sophis.VideoControl.prototype.getSpeed = function() {
  return parseFloat(this.videoEl_.playbackRate).toFixed(2);
};


window.console.log("Hello world");
var videoTags = document.getElementsByTagName('video');
window.console.log("Video tags found: ", videoTags.length);
videoTags.forEach = Array.prototype.forEach;
videoTags.forEach(function(videoTag) {
  var control = new sophis.VideoControl(videoTag);
});

