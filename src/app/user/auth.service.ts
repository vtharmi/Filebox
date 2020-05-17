import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserData } from '../user/user-data.model'
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private userId: string;
    private token: string;
    private isAuthenticated = false;
    private errorMessage: string;
    private authStatusListener = new Subject<boolean>();
    private tokenTimer: any;

    constructor( private http: HttpClient, private router: Router) {}

    getErrorMessage() {
        return this.errorMessage;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getToken() {
        return this.token;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }
    signUp(email: string, password: string) {
        const userData: UserData = {email: email, password: password}
        this.http.post<{token: string, expiresIn: number}>('http://127.0.0.1:3000/users/signUp', userData).subscribe(
            (response) => {
                const token = response.token;
                this.token = token;
                if(token) {
                    const expiresInDuration = response.expiresIn;
                    this.tokenTimer = setTimeout(() => {
                        this.logout();
                    }, expiresInDuration * 1000)
                    this.isAuthenticated = true;
                    this.authStatusListener.next(true);
                    this.router.navigate(['home']);
                }
            },
            (error) => {
                console.log("Error in authService", error)
                this.errorMessage = error;
            }
        )
    }

    login(email: string, password: string) {
        const userData: UserData = {email: email, password: password}
        this.http.post<{token: string, userId: string, expiresIn: number}>('http://127.0.0.1:3000/users/login', userData).subscribe(
            (response) => {
                const token = response.token;
                this.token = token;
                 
                if(token) {
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.authStatusListener.next(true);
                    this.userId = response.userId;
                    const now = new Date()
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token, expirationDate);
                    console.log(expirationDate);
                    this.router.navigate(['home']);
                }
            },
            (error) => {
                console.log('Error in login', error);
                this.errorMessage = "Login with valid credentials";
            }
        )
    }
    logout() {
        this.token = null;
        this.userId = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['login']);
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if(!authInformation) {
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if(expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.setAuthTimer(expiresIn/1000);
            this.authStatusListener.next(true);
        }
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000)
    }

    private saveAuthData(token: string, expirationDate: Date) {
        localStorage.setItem("token", token);
        localStorage.setItem("expiration", expirationDate.toISOString());
    }

    private clearAuthData() {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");

    }

    private getAuthData() {
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expiration");
        if(!token || !expirationDate) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate)
        }
    }

     requestReset(email: string) {
        const resetData = {email: email}
        this.http.post('http://127.0.0.1:3000/users/requestResetPassword', resetData).subscribe(
            () =>{
                console.log("Reset password link sent to mail successfully")
                setTimeout(() => {
                    this.router.navigate(['login'])                    
                  }, 3000)
            },
            error =>{
                console.log("Error in requesting for changing password", error);
                this.router.navigate(['resetPassword']);
            }
        )
    }

    ValidPasswordToken(token: string) {
        const tokenData = {resetToken: token}
        return this.http.post('http://127.0.0.1:3000/validatePasswordToken', tokenData);
   }

   newPassword(resetToken: string, newPassword: string) {
    const passwordData = {
        resetToken: resetToken,
        password: newPassword}
    return this.http.post<{message: string}>('http://127.0.0.1:3000/users/setNewPassword', passwordData);
   }
}