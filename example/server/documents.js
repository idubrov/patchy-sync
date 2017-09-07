import express from 'express';
import Document from './Document';

const router = express.Router();
const documents = new Map();

router.put('/:key', (req, res) => {
  if (req.is('application/json')) {
    const key = req.params.key;
    if (req.get('If-None-Match') === '*' && documents.has(key)) {
      res.sendStatus(412);
    } else {
      documents.set(key, new Document(req.body));
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(415);
  }
});

router.get('/:key', (req, res) => {
  const key = req.params.key;
  if (documents.has(key)) {
    const doc = documents.get(key);
    res.set('X-Revision', doc.revision);
    res.set('ETag', doc.etag);
    res.set('Last-Modified', doc.lastModified);
    res.status(200);
    res.json(doc.current);
  } else {
    res.sendStatus(404);
  }
});

router.delete('/:key', (req, res) => {
  const key = req.params.key;
  documents.delete(key);
  res.sendStatus(200);
});

module.exports = router;
