// Saves options to chrome.storage
function save_options() {
  var increment = document.getElementById('increment').value;
  var keys = document.getElementById('keys').checked;
  chrome.storage.sync.set({
    increment: increment,
    keys: keys
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    increment: '0.1',
    keys: "udar"
  }, function(items) {
    document.getElementById('increment').value = items.favoriteColor;
    document.getElementById('keys').checked = items.likesColor;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
