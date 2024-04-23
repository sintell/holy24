const Stack = require("../challenges/stack_challenge");
const assert = require("assert");

describe("new Stack", () => {
  it("должен быть пустым, при создании", () => {
    assert.equal(new Stack().size(), 0);
  });

  it("должен добавлять элементы по порядку", () => {
    const myStack = new Stack();
    const expected = [1, 3, 7];
    expected.forEach((el) => myStack.add(el));

    assert.equal(myStack.size(), expected.length);
    assert.equal(myStack.peek(), expected[expected.length - 1]);
  });

  it("должен удалять элементы по порядку", () => {
    const myStack = new Stack();
    const expected = [1, 3, 7];
    expected.forEach((el) => myStack.add(el));

    assert.equal(myStack.remove(), expected.pop());
    assert.equal(myStack.remove(), expected.pop());
    assert.equal(myStack.remove(), expected.pop());
  });

  it("должен возвращать последний элемент при вызове peek()", () => {
    const myStack = new Stack();
    const expected = [1, 3, 7];
    expected.forEach((el) => myStack.add(el));

    assert.equal(myStack.peek(), expected[expected.length - 1]);

    myStack.add(11);
    assert.equal(myStack.peek(), 11);
  });
});
