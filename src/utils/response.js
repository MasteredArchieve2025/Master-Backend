// src/utils/response.js

const successResponse = (
  res,
  message = "Success",
  data = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  error = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
