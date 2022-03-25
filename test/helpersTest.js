const { assert } = require("chai");
const { test } = require("mocha");
const findUserByEmail = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "user1ID",
    email: "u1@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2ID",
    email: "u2@example.com",
    password: "456",
  },
};

describe("findUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = findUserByEmail("u1@example.com", testUsers).id;
    const expectedUserID = "user1ID";
    assert.equal(user, expectedUserID);
  });
});
