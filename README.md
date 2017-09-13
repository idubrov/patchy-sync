[![npm](https://img.shields.io/npm/v/patchy-sync.svg)](https://www.npmjs.com/package/patchy-sync)
[![npm](https://img.shields.io/npm/dt/patchy-sync.svg)](https://www.npmjs.com/package/patchy-sync)
[![CircleCI](https://img.shields.io/circleci/project/github/idubrov/patchy-sync.svg)]()

# patchy-sync

Client-side library for [React](https://facebook.github.io/react/)/[React Redux](https://github.com/reactjs/react-redux)/[Redux Saga](https://github.com/redux-saga/redux-saga)
that implements [JSON Patch](https://tools.ietf.org/html/rfc6902)-based protocol to synchronize client-side state (JSON document) with server.
The main idea is that client generates changes by submitting `patchy-sync` JSON Patch actions
to the Redux store and `patchy-sync` takes care of communicating these changes with the server.

Main features:
 * Optimistic updates
 * Generic client and server, both server and client "speak" standard JSON patches
 * Generic handling of synhronization and conflict resolution on the client side
 * (potentially) server-initated updates
 * Pretty minimalistic
 * Document scheme is controlled by the client (no server changes are required)
 * Support for generic pre-conditions via JSON Patch "test" operation. Client could verify, for example,
   that certain field has expected value before changing it. Or it could use that mechanism to implement
   optimistic locking by testing/incrementing version stored somewhere in the document.

See [example/](example/) for the application using this library to build a todo list.

This library should be considered a toy.

The disadvantages are:
 * Conflict resolution is done via discarding of patches which do not apply. Proper handling would require
   backtracing the failed JSON Patch to the semantic action which initiated it and handling it according to
   the context.
 * Document scheme is controlled by the client.
 * More like "all-or-nothing" security, supporting complex security rules could be hard. Simple, path-based
   rules are easy to implement. However, more complex scenarios would either require whitelisting of patches
   or require server to interpret patch to figure out the semantics.   

## Server Protocol

Minimal protocol which should be implemented by server is the following:
 * GET method to retrieve the latest version of the JSON document. Should also return document revision.
 * PATCH method which accepts JSON patch object and document revision, applies patch to the server state (if possible)
   and returns list of patches that client does not have (all the patches after the revision given by the client).  

## License

`patchy-sync` is released under the [MIT License](LICENSE).
