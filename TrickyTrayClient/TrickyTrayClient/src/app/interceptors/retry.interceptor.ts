import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import {
  retry,
  throwError,
  timer
} from 'rxjs';

const MAX_RETRY_ATTEMPTS = 3;

const RETRYABLE_METHODS = new Set([
  'GET'
]);

const RETRYABLE_STATUS_CODES = new Set([
  0,
  408,
  429,
  500,
  502,
  503,
  504
]);

export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  const method = request.method.toUpperCase();

  if (!RETRYABLE_METHODS.has(method)) {
    return next(request);
  }

  return next(request).pipe(
    retry({
      count: MAX_RETRY_ATTEMPTS,

      delay: (error: unknown, retryCount: number) => {
        if (!(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }

        if (!RETRYABLE_STATUS_CODES.has(error.status)) {
          return throwError(() => error);
        }

        const delayMilliseconds =
          500 * Math.pow(2, retryCount - 1);

        console.warn(
          `[HTTP Retry] GET ${request.url} failed ` +
          `with status ${error.status}. ` +
          `Retry ${retryCount}/${MAX_RETRY_ATTEMPTS} ` +
          `in ${delayMilliseconds}ms.`
        );

        return timer(delayMilliseconds);
      }
    })
  );
};
