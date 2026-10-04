// Promises vs Callbacks demonstration
// Run: node src/js-concepts/promises-vs-callbacks.js

// CALLBACK STYLE
function getComplaintWithCallback(callback) {
  setTimeout(() => {
    callback(null, 'Complaint received using callback');
  }, 100);
}

getComplaintWithCallback((error, data) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(data);
});

// PROMISE STYLE
function getComplaintWithPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Complaint received using Promise');
    }, 100);
  });
}

getComplaintWithPromise()
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

// In the main SmartCampus application, database and API operations use
// Promises with async/await because it keeps asynchronous workflows readable
// and makes error handling easier with try/catch.
