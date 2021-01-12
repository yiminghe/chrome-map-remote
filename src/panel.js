import { VERSION } from './constants';

function getRemotes(callback) {
  chrome.storage.local.get(['remotes', 'version'], (r) => {
    if (r.version !== VERSION) {
      callback([]);
    } else {
      callback(r.remotes || []);
    }
  });
}

function setRedirects(remotes) {
  chrome.storage.local.set({
    remotes,
    version: VERSION,
  });
}

function add() {
  var $from = $('#from');
  var $to = $('#to');
  const fromVal = $from.val().trim();
  const toVal = $to.val().trim();
  if (fromVal == '') {
    alert('Enter a from url pattern', 'error');
    return;
  }
  if (toVal == '') {
    alert('Enter a to url pattern', 'error');
    return;
  }
  try {
    new RegExp(fromVal);
  } catch (err) {
    alert('Error: ' + err, 'error');
    return;
  }
  getRemotes((remotes) => {
    remotes.push({ from: fromVal, to: toVal, enable: true });
    setRedirects(remotes);
    $from.val('');
    $to.val('');
    alert('MapRemote added.');
  });

}

function remove() {
  getRemotes((remotes) => {
    if (!remotes) {
      // something odd happened, trigger storage update.
      storageUpdate();
      return;
    }
    remotes.splice(this.value, 1);
    setRedirects(remotes);
    alert('MapRemote removed.');
  });
}

function saveItem(id, v) {
  getRemotes((remotes) => {
    if (!remotes) {
      storageUpdate();
      return;
    }
    id = parseInt(id);
    const r = remotes[id] = remotes[id] || {};
    Object.assign(r, v);
    setRedirects(remotes);
    alert('MapRemote edited.');
  });
}

function editHolder(fromInput, toInput) {
  return function edit() {
    const r = {};
    r.from = fromInput.val().trim();
    r.to = toInput.val().trim();
    saveItem(this.value, r);
  }
}

function alert(msg, type) {
  var $alert = $('#alert');
  var timeout;
  type = type || 'success'
  $alert.find('span.msg').html(msg);
  $alert.attr('class', 'alert fade in alert-' + type);
  $alert.show();
  clearTimeout(timeout);
  timeout = setTimeout(function () {
    $alert.slideUp();
  }, 3000);
}

function storageUpdate(remotes3) {
  let remotes;

  function doit() {
    {
      var $tbody = $('#remotes table tbody');
      $tbody.html('');
      $('#remotes').toggle(remotes.length > 0);
      for (var i = 0; i < remotes.length; i++) {
        addToTable(i, remotes[i]);
      }
    }
  }

  if (remotes3) {
    remotes = remotes3;
    doit();
  } else {
    getRemotes((remotes2) => {
      remotes = remotes2;
      doit();
    });
  }
}

function tmpl(id, context) {
  var tmpl = $('#' + id).html()
  for (var v in context) {
    var pattern = '{{' + v + '}}';
    while (tmpl.match(new RegExp(pattern))) {
      tmpl = tmpl.replace(pattern, context[v]);
    }
  }
  return $(tmpl);
}

function enable(e) {
  const { currentTarget } = e;
  const id = currentTarget.dataset.id;
  const data = {
    enable: currentTarget.checked,
  }
  saveItem(id, data);
}

function addToTable(id, data) {
  var $row = tmpl('table_row_tpl', {
    id,
    ...data,
  });
  $row.find('input.enable')[0].checked = data.enable;
  $row.find('input.enable').on('change', enable);
  $row.find('button.remove').on('click', remove);
  $row.find('button.edit').on('click', editHolder(
    $row.find('input.from'),
    $row.find('input.to'))
  );
  $row.appendTo($('#remotes table tbody'));

}


$(document).ready(function () {
  $('#add').on('click', add);
  $('#alert').alert();


  $('#start').on("click", () => {
    window.postMessage({
      action: 'start',
      source: 'map-remote-debug'
    }, '*');
  });
  $('#stop').on("click", () => {
    window.postMessage({
      action: 'stop',
      source: 'map-remote-debug'
    }, '*');
  });


  chrome.storage.onChanged.addListener((changes) => {
    if (changes.remotes) {
      storageUpdate(changes.remotes.newValue);
    }
  });

  storageUpdate();
});