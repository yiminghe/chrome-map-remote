import { VERSION } from './constants.js';

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

  modifyRemotes((remotes) => {
    remotes.push({ from: fromVal, to: toVal, enable: true });
    $from.val('');
    $to.val('');
  }, 'MapRemote added.');
}

function remove(e) {
  const id = parseInt(e.currentTarget.value);
  modifyRemotes((remotes) => {
    remotes.splice(id, 1);
  }, 'MapRemote removed.');
}

function modifyRemotes(fn, msg) {
  getRemotes((remotes) => {
    if (!remotes) {
      storageUpdate();
      return;
    }
    remotes = fn(remotes) || remotes;
    setRedirects(remotes);
    alert(msg);
  });
}

function saveItem(id, v) {
  modifyRemotes((remotes) => {
    id = parseInt(id);
    const r = remotes[id] = remotes[id] || {};
    Object.assign(r, v);
  }, 'MapRemote edited.');
}

function editHolder(fromInput, toInput) {
  return function edit(e) {
    const id = parseInt(e.currentTarget.value);
    const r = {};
    r.from = fromInput.val().trim();
    r.to = toInput.val().trim();
    saveItem(id, r);
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
    var $tbody = $('#remotes table tbody');
    $tbody.html('');
    $('#remotes').toggle(remotes.length > 0);
    for (var i = 0; i < remotes.length; i++) {
      addToTable(i, remotes[i]);
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
  const id = parseInt(currentTarget.dataset.id);
  const data = {
    enable: currentTarget.checked,
  }
  saveItem(id, data);
}

function up(e) {
  const { currentTarget } = e;
  const id = parseInt(currentTarget.dataset.id);
  if (id) {
    const preId = id-1;
    modifyRemotes((remotes) => {
      ([remotes[preId], remotes[id]] = [remotes[id], remotes[preId]]);
    }, 'MapRemote updated.');
  }
}

function down(e) {
  const { currentTarget } = e;
  const id = parseInt(currentTarget.dataset.id);
  modifyRemotes((remotes) => {
    if (id >= remotes.length - 1) {
      return;
    }
    const preId = id+1;
    ([remotes[preId], remotes[id]] = [remotes[id], remotes[preId]]);
  }, 'MapRemote updated.');
}

function addToTable(id, data) {
  var $row = tmpl('table_row_tpl', {
    id,
    ...data,
  });
  $row.find('input.enable')[0].checked = data.enable;
  $row.find('button.up').on('click', up);
  $row.find('button.down').on('click', down);
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