const { myVeryOwnFunction } = require("../challenges/ch01");
const assert = require("assert");

describe("myVeryOwnFunction", () => {
  it("should return 3", () => {
    assert.equal(myVeryOwnFunction(), 3);
  });

  it("should never return null", () => {
    assert.notEqual(myVeryOwnFunction(), null);
  });
});
