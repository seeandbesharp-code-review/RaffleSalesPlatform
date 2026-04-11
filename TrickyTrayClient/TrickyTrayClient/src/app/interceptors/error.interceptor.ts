import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

  

      if (error.status === 401) {
        errorMessage = 'עליך להיות מחובר כדי לבצע פעולה זו.';
      }
      else if (error.error instanceof ErrorEvent) {
        errorMessage = `שגיאת רשת: ${error.error.message}`;
      }
      else {
        const serverError = error.error;

        errorMessage = typeof serverError === 'string'
          ? serverError
          : serverError?.detail ||
          serverError?.message ||
          (serverError?.errors ? Object.values(serverError.errors).flat()[0] : null) ||
          error.message ||
          `שגיאה: ${error.status}`;
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};