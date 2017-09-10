import fetch from 'isomorphic-fetch';
import appendQuery from 'append-query';

// TODO: custom headers, credentials?
function processResponse(response) {
  const contentType = response.headers.get('Content-Type');
  const responseData = contentType && contentType.indexOf('application/json') !== -1
    ? response.json()
    : response.text();
  const revisionStr = response.headers.get('X-Revision');
  const revision = revisionStr !== null
    ? parseInt(revisionStr, 10)
    : undefined;
  if (revision === undefined) {
    console.warn('Cannot get X-Revision header from the response. ' +
      'Check that CORS is properly configured on the server');
  }
  if (response.ok) {
    return responseData.then(data => ({ data, revision }));
  }
  return responseData.then((data) => {
    const error = new Error(response.statusText);
    error.data = data;
    error.revision = revision;
    throw error;
  });
}

export function get(action, state) {
  return fetch(state.url).then(processResponse);
}

export function patch(action, state) {
  // Specify which "remote" revision we have so far, so server knows how many patches to return
  const url = appendQuery(state.url, { revision: state.remoteRevision }, { removeNull: true });
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    method: 'PATCH',
    body: JSON.stringify(action.payload.patch)
  }).then(processResponse);
}

export default { get, patch };
