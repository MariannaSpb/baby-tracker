import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { switchMap, from } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only intercept requests to our specific API
  if (req.url.startsWith(environment.apiUrl)) {
    return from(authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          // console.log('token', token);
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next(authReq);
        }
        //console.log('token2', token);
        return next(req);
      })
    );
  }

  return next(req);
};
