export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export class ApiResponse {
  static success(data = null, message = 'Success', statusCode = 200) {
    return { success: true, message, ...(data !== null && { data }) };
  }

  static error(message = 'Something went wrong', statusCode = 400) {
    return { success: false, message };
  }
}
