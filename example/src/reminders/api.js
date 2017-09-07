import fetch from 'isomorphic-fetch';

export function documentUrl(key) {
  return `/documents/${key}`;
}

export function createIfMissing(key, document) {
  return fetch(documentUrl(key), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'If-None-Match': '*'
    },
    body: JSON.stringify(document)
  }).then((response) => {
    if (response.ok) {
      return true;
    } else if (response.status === 412) {
      return false;
    }

    throw new Error(response.statusText);
  });
}
