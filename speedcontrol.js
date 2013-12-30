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
  this.createDom();
};


/** @const */
sophis.VideoControl.CLASS_NAME = 'sophis-video-control';


/**
 * Creates the HTML body of the controls.
 */
sophis.VideoControl.prototype.createDom = function() {
  var fragment = document.createDocumentFragment();
  var container = document.createElement('div');
  container.textContent = 'Hello!';
  fragment.appendChild(container);
  this.videoEl_.parentElement.insertBefore(fragment, this.videoEl_);
  this.el_ = container;
  this.el_.classList.add(sophis.VideoControl.CLASS_NAME);
};


/**
 * Post-dom creation actions such as adding event listeners.
 */
sophis.VideoControl.prototype.enterDocument = function() {
  
};


window.console.log("Hello world");
var videoTags = document.getElementsByTagName('video');
window.console.log("Video tags found: ", videoTags.length);
videoTags.forEach = Array.prototype.forEach;
videoTags.forEach(function(videoTag) {
  var control = new sophis.VideoControl(videoTag);
});

