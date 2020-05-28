"use strict";

const FavroNock = require("../helpers/FavroNock");

const chai = require("chai");
const expect = chai.expect;

const favroApi = require("../../lib/favroApi");

Scenario("Fetching", () => {
  let api, data, path, fetched;
  Given("Endpoint exists", () => {
    data = getPage();
    path = "/cards?widgetCommonId=123";
    api = new FavroNock();

    api.get(path, data);
  });

  When("fetching", (done) => {
    favroApi.fetch(path, undefined, (err, res) => {
      fetched = res;
      done(err);
    });
  });

  Then("It return all entities data", () => {
    expect(fetched).to.deep.equal(data.entities);
  });

  And("Headers should contain an organizationId", () => {
    expect(api.headers[0]).to.have.property("organizationid").and.not.be.null;
  });

  And("Headers should contain Basic Authorization", () => {
    expect(api.headers[0]).to.have.property("authorization").and.to.contain("Basic");
  });
});

Scenario("Fetching widget with multiple pages", () => {
  let api, path, backend, result;
  const pages = [];

  Given("We have a first page with more than 100 items", () => {
    const page = getPage(0, 3);
    api = new FavroNock();
    path = "/cards?widgetCommonId=123";
    pages.push(page);
    backend = api.get(path, page);
  });

  [1, 2].forEach((i) => {
    And(`page ${i} exists`, () => {
      const page = getPage(i, 3);
      pages.push(page);
      api.get(`${path}&page=${i}`, page);
    });
  });

  When("Fetching resource with multiple pages", (done) => {
    favroApi.fetch("/cards", {widgetCommonId: 123}, (err, entities) => {
      result = entities;
      done(err);
    });
  });

  Then("Api should have been called three times", () => {
    expect(api.called).to.equal(3);
  });

  And("Second call should use same header as first call", () => {
    expect(api.headers[1]["x-favro-backend-identifier"]).to.equal(backend);
  });

  And("Third call should use same as first call", () => {
    expect(api.headers[2]["x-favro-backend-identifier"]).to.equal(backend);
  });

  And("It should return all entities from all pages", () => {
    const entitiesCount = getPage().entities.length;
    expect(result.length).to.equal(entitiesCount * 3);
  });
});

function getPage(page = 0, pages = 1) {
  const pagedata = JSON.parse(JSON.stringify(require("../data/cardsByWidget.json")));
  pagedata.pages = pages;
  pagedata.page = page;

  return pagedata;
}
