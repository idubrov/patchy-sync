import express from 'express';
import Document from './Document';

const router = express.Router();
const documents = new Map();

router.put('/:key', (req, res) => {
  if (!req.is('application/json')) {
    res.sendStatus(415);
    return;
  }

  const key = req.params.key;
  if (req.get('If-None-Match') === '*' && documents.has(key)) {
    res.sendStatus(412);
    return;
  }

  documents.set(key, new Document(req.body));
  res.sendStatus(200);
});

router.get('/:key', (req, res) => {
  const key = req.params.key;
  if (!documents.has(key)) {
    res.sendStatus(404);
    return;
  }

  const doc = documents.get(key);
  res.set('X-Revision', doc.revision);
  res.set('ETag', doc.etag);
  res.set('Last-Modified', doc.lastModified);
  res.set('Expires', '0');
  res.status(200);
  res.json(doc.current);
});

router.delete('/:key', (req, res) => {
  const key = req.params.key;
  documents.delete(key);
  res.sendStatus(200);
});

router.patch('/:key', (req, res) => {
  const key = req.params.key;
  if (!documents.has(key)) {
    res.sendStatus(404);
    return;
  }

  if (!req.is('application/json-patch+json')) {
    res.sendStatus(415);
    return;
  }

  const doc = documents.get(key);
  const response = doc.patch(req.body,
    req.query.revision && Number.parseInt(req.query.revision, 10));
  res.set('X-Revision', doc.revision);
  if (response.errorCode === 'conflict') {
    res.status(409);
  } else {
    res.status(200);
  }
  res.json(response);
});

module.exports = router;
