// JavaScript Event Loop demonstration
// Run: node src/js-concepts/eventLoop.js
// Demonstrates JavaScript Event Loop,
// including synchronous code, microtasks, and macrotasks.

console.log('1. Synchronous code starts');

setTimeout(() => {
  console.log('4. setTimeout callback (task/macrotask queue)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise callback (microtask queue)');
});

console.log('2. Synchronous code ends');

// Expected order:
// 1 -> 2 -> 3 -> 4
// The current call stack finishes first. Microtasks are processed before
// the timer task, which demonstrates how the event loop coordinates async work.
