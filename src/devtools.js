import { VERSION } from './constants.js';
import { fetchResource, utoa } from './utils.js';

chrome.devtools.panels.create("MapRemote",
  "",
  "../panel/panel.html",
  (panel) => {
    panel.onShown.addListener(pinTab);
  }
);

function getRemoteUrl(url, callback) {
  chrome.storage.local.get(['remotes', 'version'], (ret) => {
    if (ret.version !== VERSION) {
      return callback();
    }
    var pattern;
    var remotes = ret.remotes || [];
    for (var i = 0; i < remotes.length; i++) {
      const { from, to, enable } = remotes[i];
      if (!enable) {
        continue;
      }
      try {
        pattern = new RegExp(from, 'ig');
      } catch (err) {
        //bad pattern
        continue;
      }
      const match = url.match(pattern);
      if (match) {
        const toUrl = url.replace(pattern, to);
        console.info(`Rewriting URL ${url} to ${toUrl}`);
        return callback(toUrl);
      }
    }

    callback();
  });
}

function setupDebugger(target, panelWindow) {
  const debugee = { tabId: target.id };

  panelWindow.mapRemoteDebugee = debugee;

  chrome.debugger.attach(debugee, "1.0", () => {
    chrome.debugger.sendCommand(debugee, "Fetch.enable", { patterns: [{ urlPattern: '*' }] });
  });

  chrome.debugger.onEvent.addListener((source, method, params) => {
    var request = params.request;
    var continueParams = {
      requestId: params.requestId,
    };
    if (source.tabId === target.id) {
      if (method === "Fetch.requestPaused") {
        getRemoteUrl(request.url, (remoteUrl) => {
          if (remoteUrl) {
            fetchResource(remoteUrl, request.headers, request.method, request.postData, (data) => {
              continueParams.responseCode = 200;
              continueParams.binaryResponseHeaders = utoa(data.headers.replace(/(?:\r\n|\r|\n)/g, '\0'));
              continueParams.body = utoa(data.response);
              chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', continueParams);
            }, (status) => {
              chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', continueParams);
            });
            return;
          } else {
            chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', continueParams);
          }
        });
      }
    }
  });
}

function startMapRemote(panelWindow) {
  chrome.tabs.getSelected(null, (tab) => {
    setupDebugger(tab, panelWindow);
  });
}

function pinTab(panelWindow) {
  panelWindow.addEventListener('message', (event) => {
    if (event.source !== panelWindow) {
      return;
    }
    let message = event.data;
    if (message && message.source !== 'map-remote-debug') {
      return;
    }
    switch (message.action) {
      case 'start': {
        startMapRemote(panelWindow);
        break;
      }
      case 'stop': {
        chrome.debugger.detach(panelWindow.mapRemoteDebugee);
      }
    }
  })
}
