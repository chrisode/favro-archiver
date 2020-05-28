"use strict";

const async = require("async");
const needle = require("needle");
const secrets = require("../config/secrets.json");
const baseUrl = "https://favro.com/api/v1";

let backendIdentifier;

function fetch(path, qs, callback) {
  backendIdentifier = null;
  getRequest(path, qs, (err, body) => {
    if (err) return callback(err);
    if (!body.entities) return callback(`No entities found for path: ${path}`);

    if (body.pages <= 1) {
      return callback(null, body.entities);
    }
    fetchPages(path, qs, body.pages, body.entities, (pageErr, entities) => {
      if (pageErr) return callback(err);
      callback(null, entities);
    });
  });
}

function fetchPages(path, qs, pages, entities, callback) {
  const funcs = [];
  for (let page = 1; page < pages; ++page) {
    const query = Object.assign({}, qs);
    query.page = page;
    funcs.push(getRequest.bind(null, path, query));
  }

  async.parallel(funcs, (err, results) => {
    if (err) return callback(err);
    results.forEach((result) => {
      entities = entities.concat(result.entities);
    });
    callback(null, entities);
  });
}

function updateCard(card, callback) {
  const options = {
    headers: getHeaders(),
    json: true
  };

  needle.put(`${baseUrl}/cards/${card.cardId}`, card, options, (err, res, body) => {
    if (err) return callback(err);
    if (res.statusCode !== 200) return callback(JSON.stringify({ options, body }));
    callback(null);
  });
}

function getRequest(path, qs, callback) {
  const options = {
    headers: getHeaders(backendIdentifier),
  };

  needle.request("get", baseUrl + path, qs, options, (err, res) => {
    if (err || !res.body) return callback(err);
    if (res.statusCode !== 200) return callback(res.body.message);
    backendIdentifier = backendIdentifier || res.headers["x-favro-backend-identifier"];
    callback(null, res.body);
  });
}

function getHeaders(backend) {
  const headers = {
    organizationId: secrets.organizationId,
    Authorization: `Basic ${getAuthToken()}`
  };
  if (backend) {
    headers["X-Favro-Backend-Identifier"] = backend;
  }
  return headers;
}

function getAuthToken() {
  const buffer = Buffer.from(`${secrets.username}:${secrets.token}`);
  return buffer.toString("base64");
}

module.exports = {
  fetch, updateCard
};
