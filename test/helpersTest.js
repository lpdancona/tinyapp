const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(
      user.id === expectedUserID,
      `${user.id} is equal to ${expectedUserID}`
    );
  });
  it("should return undefined", function () {
    const user = getUserByEmail("not@valid.com", testUsers);
    const expectedUserID = undefined;
    // Write your assert statement here
    assert(user === expectedUserID, `${user} is equal to ${expectedUserID}`);
  });
});
