// JavaScript Hoisting demonstration
// Run: node src/js-concepts/hoisting.js

// Function declarations are hoisted, so this works before the declaration.
sayHello();

function sayHello() {
  console.log('Function declaration was hoisted.');
}

// var is hoisted and initialized with undefined.
console.log('var before assignment:', message);
var message = 'Hello from var';
console.log('var after assignment:', message);

// let and const are hoisted but remain in the Temporal Dead Zone until
// their declaration is evaluated. Uncommenting the next example would throw
// a ReferenceError:
// console.log(name);
// let name = 'Khushal';
