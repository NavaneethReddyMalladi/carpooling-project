import {
    HttpInterceptorFn,
    HttpRequest,
    HttpHandlerFn,
    HttpEvent
  } from '@angular/common/http';
  import { Observable } from 'rxjs';
  
  export const authTokenInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<any>> => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
    }
    return next(req);
  };
  