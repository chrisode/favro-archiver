"use strict";

const cardData = require("../data/card.json");
const pageData = require("../data/cardsByWidget.json");
const columnsData = require("../data/columns.json");

function getCard(override = {}) {
  const card = _getData(cardData);
  return Object.assign({}, card, override);
}

function getPage(page = 0, pages = 1) {
  const pagedata = _getData(pageData);
  pagedata.pages = pages;
  pagedata.page = page;

  return pagedata;
}

function _getData(type) {
  return JSON.parse(JSON.stringify(type));
}

function getWidget(cards = []) {
  return {
    "entities": cards,
    "limit": 100,
    "page": 0,
    "pages": 1,
    "requestId": "e161ea573bba8ccfb4932f23"
  };
}

function getColumns() {
  return _getData(columnsData);
}

module.exports = {
  getPage, getCard, getWidget, getColumns
};
