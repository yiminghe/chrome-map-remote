// ucs-2 string to base64 encoded ascii
export function utoa(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}
// base64 encoded ascii to ucs-2 string
export function atou(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function getHeaderString(headers) {
    let responseHeader = '';
    headers.forEach((header, key) => {
        responseHeader += key + ':' + header + '\n';
    })
    return responseHeader;
}

export async function fetchResource(url, headers, method, postData, success, error) {
    let finalResponse = {};
    let response = await fetch(url, {
        method,
        mode: 'cors',
        headers,
        redirect: 'follow',
        body: postData
    });
    finalResponse.response = await response.text();
    finalResponse.headers = getHeaderString(response.headers);
    if (response.ok) {
        success(finalResponse);
    } else {
        error(finalResponse);
    }
}