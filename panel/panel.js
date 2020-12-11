function getRemotes(callback) {
  chrome.storage.local.get(['remotes'], (r) => {
    callback(r.remotes || []);
  });
}

function setRedirects(remotes) {
  chrome.storage.local.set({
    remotes,
  });
}

function add() {
  var $from = $('#from');
  var $to = $('#to');
  if ($from.val() == '') {
    alert('Enter a from url pattern', 'error');
    return;
  }
  if ($to.val() == '') {
    alert('Enter a to url pattern', 'error');
    return;
  }
  try {
    new RegExp($from.val());
  } catch (err) {
    alert('Error: ' + err, 'error');
    return;
  }
  getRemotes((remotes) => {
    remotes.push([$from.val(), $to.val()]);
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

function editHolder(fromInput, toInput) {
  return function edit() {
    getRemotes((remotes) => {
      if (!remotes) {
        storageUpdate();
        return;
      }
      remotes[this.value][0] = fromInput.val();
      remotes[this.value][1] = toInput.val();
      setRedirects(remotes);
      alert('MapRemote edited.');
    });
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
        addToTable(i, remotes[i][0], remotes[i][1]);
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

function addToTable(id, from, to) {
  var $row = tmpl('table_row_tpl', {
    'id': id,
    'from': from,
    'to': to
  });

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