// Saves options to chrome.storage
function save_options() {
  var increment = document.getElementById('increment').value;
  var keyCombo = document.getElementById('keyCombo').value;
  var blackListedSites = document.getElementById('blacklist').value;
  chrome.storage.sync.set({
    increment: increment,
    keyCombo: keyCombo,
    blackListedSites: blackListedSites
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
    keyCombo: 'udar',
    blackListedSites: 'vine.com'
  }, function(items) {
    document.getElementById('increment').value = items.increment;
    document.getElementById('keyCombo').value = items.keyCombo;
    document.getElementById('blacklist').value = items.blackListedSites;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
