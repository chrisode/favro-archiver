"use strict";

const nock = require("nock");

class FavroNock {

  constructor() {
    nock.disableNetConnect();
    this.api = nock("https://favro.com/api/v1");
    this.headers = [];
    this.called = 0;
    this.putRequests = [];
    this.backend;
  }

  get(path, data) {
    const req = this;
    const backend = this.backend || Math.round(Math.random() * 10000000, 0);
    this.api
      .get(path)
      .reply(200, function () {
        ++req.called;
        req.backend = this.req.headers["x-favro-backend-identifier"];
        req.headers.push(this.req.headers);
        return JSON.stringify(data);
      }, { "x-favro-backend-identifier": backend });
    return backend;
  }

  put(path, data) {
    const req = this;
    this.api
      .put(path, data)
      .reply(200, () => {
        req.putRequests.push(path);
        return JSON.stringify({});
      });
  }
}

module.exports = FavroNock;
