"use strict";

const FavroNock = require("../helpers/FavroNock");
const dataHelpers = require("../helpers/dataHelpers");

const archive = require("../../lib/archive");

Scenario("Archive done cards", () => {
  let columns, doneCards, api, archivedResult;
  Given("Backlog cards exists", () => {
    api = new FavroNock();
    const backlogCards = dataHelpers.getWidget([
      dataHelpers.getCard({ cardCommonId: "remove1", cardId: "remove1" }),
      dataHelpers.getCard({ cardCommonId: "keep1" }),
      dataHelpers.getCard({ cardCommonId: "remove2", cardId: "remove2" }),
      dataHelpers.getCard({ cardCommonId: "keep2" })
    ]);
    api.get("/cards/?widgetCommonId=backlog&archived=false", backlogCards);
  });

  And("Board have columns", () => {
    columns = dataHelpers.getColumns();
    api.get("/columns/?widgetCommonId=board&archived=false", columns);
  });

  And("Board have cards", () => {
    const doneColumnId = "9ef593b5d9f6609ac36eb30d";
    doneCards = dataHelpers.getWidget([
      dataHelpers.getCard({ columnId: doneColumnId, cardCommonId: "remove1", cardId: "remove1" }),
      dataHelpers.getCard({ columnId: doneColumnId, cardCommonId: "remove2", cardId: "remove2" }),
      dataHelpers.getCard({ columnId: "123123123", cardCommonId: "keep1" }),
      dataHelpers.getCard({ columnId: "64564", cardCommonId: "nooop" }),
      dataHelpers.getCard({ columnId: "123123123", cardCommonId: "keep2" })
    ]);
    api.get("/cards/?widgetCommonId=board", doneCards);
    api.put("/cards/remove1", { cardId: "remove1", archive: true });
    api.put("/cards/remove2", { cardId: "remove2", archive: true });
  });

  When("Looking for cards to archive", (done) => {
    archive({ boardId: "board", backlogId: "backlog", name: "test" }, (err, res) => {
      done(err);
      archivedResult = res;
    });
  });

  Then("it should archive all cards in the done column", () => {
    expect(api.putRequests).to.have.length(2);
  });

  And("it should return name in result", () => {
    expect(archivedResult).to.have.property("name").and.equal("test");
  });

  And("it should return cards archived in result", () => {
    expect(archivedResult).to.have.property("archivedCards").and.equal(2);
  });
});

Scenario("Archive done cards in specified done column", () => {
  let backlogCards, columns, doneCards, api;
  Given("Backlog cards exists", () => {
    api = new FavroNock();
    backlogCards = dataHelpers.getWidget([
      dataHelpers.getCard({ cardCommonId: "remove1", cardId: "remove1" }),
      dataHelpers.getCard({ cardCommonId: "keep1" }),
      dataHelpers.getCard({ cardCommonId: "remove2", cardId: "remove2" }),
      dataHelpers.getCard({ cardCommonId: "keep2" })
    ]);
    api.get("/cards/?widgetCommonId=backlog&archived=false", backlogCards);
  });

  And("Board have columns with done column named finished", () => {
    columns = dataHelpers.getColumns();
    columns.entities.forEach((entity) => {
      if (entity.name === "Done") {
        entity.name = "Finished";
      }
    });
    api.get("/columns/?widgetCommonId=board&archived=false", columns);
  });

  And("Board have cards", () => {
    const doneColumnId = "9ef593b5d9f6609ac36eb30d";
    doneCards = dataHelpers.getWidget([
      dataHelpers.getCard({ columnId: doneColumnId, cardCommonId: "remove1", cardId: "remove1" }),
      dataHelpers.getCard({ columnId: doneColumnId, cardCommonId: "remove2", cardId: "remove2" }),
      dataHelpers.getCard({ columnId: "123123123", cardCommonId: "keep1" }),
      dataHelpers.getCard({ columnId: "64564", cardCommonId: "nooop" }),
      dataHelpers.getCard({ columnId: "123123123", cardCommonId: "keep2" })
    ]);
    api.get("/cards/?widgetCommonId=board", doneCards);
    api.put("/cards/remove1", { cardId: "remove1", archive: true });
    api.put("/cards/remove2", { cardId: "remove2", archive: true });
  });

  When("Looking for cards to archive", (done) => {
    archive({
      boardId: "board", backlogId: "backlog",
      doneColumn: "Finished"
    }, () => {
      done();
    });
  });

  Then("it should archive all cards in the done column", () => {
    expect(api.putRequests).to.have.length(2);
  });
});

Scenario("Archive done cards in multiple backlogs", () => {
  let columns, doneCards, api, archivedResult;
  Given("Backlog 1 cards exists", () => {
    api = new FavroNock();
    const backlogCards = dataHelpers.getWidget([
      dataHelpers.getCard({ cardCommonId: "remove1", cardId: "remove1" }),
      dataHelpers.getCard({ cardCommonId: "keep1" }),
      dataHelpers.getCard({ cardCommonId: "remove2", cardId: "remove2" }),
      dataHelpers.getCard({ cardCommonId: "keep2" })
    ]);
    api.get("/cards/?widgetCommonId=backlog1&archived=false", backlogCards);
  });

  And("Backlog 2 cards exists", () => {
    const backlogCards = dataHelpers.getWidget([
      dataHelpers.getCard({ cardCommonId: "remove1", cardId: "remove3" }),
      dataHelpers.getCard({ cardCommonId: "keep1" }),
      dataHelpers.getCard({ cardCommonId: "keep2" })
    ]);
    api.get("/cards/?widgetCommonId=backlog2&archived=false", backlogCards);
  });

  And("Board have columns", () => {
    columns = dataHelpers.getColumns();
    api.get("/columns/?widgetCommonId=board&archived=false", columns);
  });

  And("Board have cards", () => {
    const doneColumnId = "9ef593b5d9f6609ac36eb30d";
    doneCards = dataHelpers.getWidget([
      dataHelpers.getCard({ columnId: doneColumnId, cardCommonId: "remove1", cardId: "remove1" }),
      dataHelpers.getCard({ columnId: doneColumnId, cardCommonId: "remove2", cardId: "remove2" }),
      dataHelpers.getCard({ columnId: "123123123", cardCommonId: "keep1" }),
      dataHelpers.getCard({ columnId: "64564", cardCommonId: "nooop" }),
      dataHelpers.getCard({ columnId: "123123123", cardCommonId: "keep2" })
    ]);
    api.get("/cards/?widgetCommonId=board", doneCards);
    api.put("/cards/remove1", { cardId: "remove1", archive: true });
    api.put("/cards/remove2", { cardId: "remove2", archive: true });
    api.put("/cards/remove3", { cardId: "remove3", archive: true });
  });

  When("Looking for cards to archive", (done) => {
    archive({ boardId: "board", backlogId: ["backlog1", "backlog2"], name: "test" }, (err, res) => {
      done(err);
      archivedResult = res;
    });
  });

  Then("it should archive all cards existing in both backlogs", () => {
    expect(api.putRequests).to.have.length(3);
  });

  And("it should return name in result", () => {
    expect(archivedResult).to.have.property("name").and.equal("test");
  });

  And("it should return cards archived in result", () => {
    expect(archivedResult).to.have.property("archivedCards").and.equal(3);
  });
});
