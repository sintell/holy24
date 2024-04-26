function swap(arr, a, b) {
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function quickSort(arr) {
  return quick(arr, 0, arr.length - 1);
}

function quick(arr, left, right) {
  let i;
  if (arr.length > 1) {
    i = partition(arr, left, right);
    if (left < i - 1) {
      quick(arr, left, i - 1);
    }
    if (i < right) {
      quick(arr, i, right);
    }
  }
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[Math.floor((right + left) / 2)];
  let i = left;
  let j = right;

  while (i <= j) {
    while (arr[i] < pivot) {
      i++;
    }
    while (arr[j] > pivot) {
      j--;
    }
    if (i <= j) {
      swap(arr, i, j);
      i++;
      j--;
    }
  }
  return i;
}

module.exports = { quickSort, swap };
