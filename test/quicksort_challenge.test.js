const assert = require("assert");
const { quickSort } = require("../challenges/quicksort_challenge");

describe("Array Sorting Tests", () => {
  describe("quickSort", () => {
    it("should sort an array of numbers", () => {
      const array = [1, 3, 4, 1, 2, 6, 5, 5, 3, 5];
      const sortedArray = quickSort(array);
      assert.deepStrictEqual(sortedArray, [1, 1, 2, 3, 3, 4, 5, 5, 5, 6]);
    });

    it("should handle an empty array", () => {
      const array = [];
      const sortedArray = quickSort(array);
      assert.deepStrictEqual(sortedArray, []);
    });

    it("should handle an array with one element", () => {
      const array = [1];
      const sortedArray = quickSort(array);
      assert.deepStrictEqual(sortedArray, [1]);
    });

    it("should handle an array with all identical elements", () => {
      const array = [2, 2, 2, 2];
      const sortedArray = quickSort(array);
      assert.deepStrictEqual(sortedArray, [2, 2, 2, 2]);
    });
  });
});
