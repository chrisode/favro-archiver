"use strict";
const async = require("async");
const favroApi = require("./favroApi");

function archive(options, callback) {
  async.parallel([
    getDoneCardIdsFromBoard.bind(null, options.boardId, options.doneColumn),
    fetchBacklogCards.bind(null, options.backlogId)
  ], (err, results) => {
    if (err) return callback(err);
    const doneCardIds = results[0];
    const backlogCards = results[1];

    const cardsToArchive = backlogCards.filter((card) => doneCardIds.includes(card.cardCommonId));
    if (cardsToArchive.length === 0) {
      return callback(null, response(options.name, 0));
    }

    archiveCards(options.name, cardsToArchive, callback);
  });
}

function fetchBacklogCards(backlogId, callback) {
  const fetchFn = [];
  if (!Array.isArray(backlogId)) {
    backlogId = [backlogId];
  }
  backlogId.forEach((id) => {
    fetchFn.push(fetchFavroWidgets.bind(null, "cards", id, false));
  });

  async.parallel(fetchFn, (err, results) => {
    if (err) return callback(err);
    let backlogCards = [];
    results.forEach((result) => {
      backlogCards = backlogCards.concat(result);
    });
    callback(null, backlogCards);
  });
}

function archiveCards(name, cards, callback) {
  async.each(cards, archiveCard, (err) => {
    if (err) return callback(err);
    callback(null, response(name, cards.length));
  });
}

function response(name, archivedCards) {
  return {
    name,
    archivedCards
  };
}

function archiveCard(card, callback) {
  const update = {
    cardId: card.cardId,
    archive: true
  };

  favroApi.updateCard(update, (err) => {
    if (err) return callback(err);
    callback(null, card.cardId);
  });
}

function getDoneColumnIdFromBoard(id, doneColumn, callback) {
  doneColumn = doneColumn ? doneColumn.toLowerCase() : "done";
  fetchFavroWidgets("columns", id, false, (err, columns) => {
    if (err) return callback(err);
    const columnId = columns.reduce((cId, column) => {
      if (column.name.toLowerCase() === doneColumn) {
        cId = column.columnId;
      }
      return cId;
    }, 0);
    callback(null, columnId);
  });
}

function getDoneCardIdsFromBoard(id, doneColumn, callback) {
  getDoneColumnIdFromBoard(id, doneColumn, (error, columnId) => {
    if (error) return callback(error);

    fetchFavroWidgets("cards", id, true, (err, cards) => {
      if (err) return callback(err);
      const doneCardIds = cards.reduce((tmpCards, card) => {
        if (card.columnId !== columnId) return tmpCards;
        tmpCards.push(card.cardCommonId);
        return tmpCards;
      }, []);

      callback(null, doneCardIds);
    });
  });
}

function fetchFavroWidgets(type, widgetId, includeArchived, callback) {
  const url = `/${type}/`;
  const qs = {
    widgetCommonId: widgetId
  };
  if (includeArchived === false) {
    qs.archived = false;
  }
  favroApi.fetch(url, qs, (err, entities) => {
    if (err) return callback(err);
    callback(null, entities);
  });
}

module.exports = archive;
