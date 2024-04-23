// program to implement stack data structure
function Stack() {
  let items = [];

  return {
    // add element to the stack
    add: (element) => {
      return items.push(element);
    },

    // remove element from the stack
    remove: () => {
      if (items.length > 0) {
        return items.pop();
      }
    },

    // view the last elements
    peek: () => {
      return items[items.length - 1];
    },

    // check if the stack is empty
    isEmpty: () => {
      return items.length == 0;
    },

    // the size of the stack
    size: () => {
      return items.length;
    },

    // empty the stack
    clear: () => {
      items = [];
    },
  };
}

module.exports = Stack;
