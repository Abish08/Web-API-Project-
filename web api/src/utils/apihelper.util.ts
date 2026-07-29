// Helper class for formatting API responses
import { Response } from "express";

// Interface for paginated data metadata
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
}

// Generic API response structure
export interface APIResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationInfo;
}

/**
 * ResponseFormatter provides static methods to create
 * consistent API responses across the application
 */
export class ResponseFormatter {
  
  /**
   * Creates a success response with data
   */
  static successResponse<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200,
    paginationMeta?: PaginationInfo
  ): Response {
    const response: APIResponse<T> = {
      status: statusCode,
      success: true,
      message,
      data,
      meta: paginationMeta
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Creates an error response
   */
  static errorResponse(
    res: Response,
    message: string = "Error occurred",
    statusCode: number = 500,
    errorData: null = null
  ): Response {
    const response: APIResponse<null> = {
      status: statusCode,
      success: false,
      message,
      data: errorData
    };
    return res.status(statusCode).json(response);
  }
}