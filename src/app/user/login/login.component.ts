import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { Subscription, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  isLoading = false;
  emailMessage: string = '';
  email: string = '';
  password: string = '';
  loginForm: FormGroup;
  invalidLogin = false;
  errorMessage: string = '';
  
  private validationMessageForEmail = {
    required: 'Please enter an email address.',
    email: 'Please enter a valid email address.'
  }
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {

    if(this.authService.login) {
      this.router.navigate(['home']);
    }

    this.loginForm = this.fb.group({
      'email': ['', [Validators.required, Validators.email]],
      'password': ['', Validators.required]
    });

    const emailController = this.loginForm.get('email');
    emailController.valueChanges.pipe(
      debounceTime(2000)
    ).subscribe(
      value => {
        this.setMessage(emailController);
      })
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessageForEmail[key]
      ).join(' ');
    }
  }

  submit() {
    // this.isLoading = true;
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
  }
}
