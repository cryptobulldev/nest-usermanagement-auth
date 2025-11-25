import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Check for unique constraint violations
    const driverError = exception.driverError as any;
    if (driverError?.code === '23505') {
      // PostgreSQL unique constraint violation
      const constraint = driverError?.constraint;
      const detail = driverError?.detail || '';

      // Extract field name from constraint or detail
      let field = 'field';
      let message = 'This value already exists';

      if (constraint?.includes('email') || detail.includes('email')) {
        field = 'email';
        message = 'Email already exists';
      } else if (constraint?.includes('username') || detail.includes('username')) {
        field = 'username';
        message = 'Username already exists';
      }

      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
      });
      return;
    }

    // Generic database error
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'A database error occurred',
      error: 'Internal Server Error',
    });
  }
}
