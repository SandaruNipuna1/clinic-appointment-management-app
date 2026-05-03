// This is a helper function that makes it easier to handle errors in async functions.
// It wraps async route handlers so that any errors are automatically passed to the error handling middleware.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
