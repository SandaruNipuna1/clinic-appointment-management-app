// This file contains middleware functions for handling errors in the application.
// It provides consistent error responses and handles different types of errors.

const notFound = (req, res, next) => {
  // Create an error for routes that don't exist
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Handle invalid JSON in request body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON request body"
    });
  }

  // Handle file upload size limit errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Uploaded file must be 10 MB or smaller"
    });
  }

  // Get the appropriate status code
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // Send error response
  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
