"use strict";

const async = require("async");
const closeIssues = require("./lib/closeIssue");
const secrets = require("./config/secrets.json");

const collections = secrets.collections.map((collection) => {
  return runCollection.bind(null, collection);
});

async.parallel(collections, (err, archivedCardsList) => {
  if (err) {
    // eslint-disable-next-line no-console
    return console.log(`Failed with error\n${err}`);
  }

  archivedCardsList.forEach((archived) => {
    if (archived === null) return;
    // eslint-disable-next-line no-console
    console.log(`Archived ${archived.archivedCards} cards in collection ${archived.name}`);
  });
});

function runCollection(collection, callback) {
  if (collection.active !== true) return callback(null, null);
  closeIssues(options(collection), callback);
}

function options(collection) {
  collection.boardId = getIdFromFavroUrl(collection.board);

  if (!Array.isArray(collection.backlog)) {
    collection.backlog = [collection.backlog];
  }
  collection.backlogId = [];
  collection.backlog.forEach((backlog) => {
    collection.backlogId.push(getIdFromFavroUrl(backlog));
  });
  return collection;
}

function getIdFromFavroUrl(url) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}
