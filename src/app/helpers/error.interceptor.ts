import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from '../error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor{
    constructor( private dialog: MatDialog){}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log()
        return next.handle(request).pipe(catchError(err => {
            if(err.status === 401) {
                location.reload(true);
            }
            let error = "An unknown error occured!";
            if(err.error.text) {
                error = err.error.text;
            }
        
            this.dialog.open(ErrorComponent, {data: {message: error}, width: '400px'});
            
            this.dialog.afterAllClosed.subscribe(
                () => {
                    location.reload(true);
                }
            )
            return throwError(error);
        }))
    }
}