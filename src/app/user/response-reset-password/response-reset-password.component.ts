import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

function passwordMatcher(c: AbstractControl) {
  const passwordControl = c.get('password');
  const confirmPasswordControll = c.get('confirmPassword');

  if (passwordControl.pristine || confirmPasswordControll.pristine) {
    return null;
  }

  if (passwordControl.value === confirmPasswordControll.value) {
    return null;
  }
  return { match: true };
}

@Component({
  selector: 'app-response-reset-password',
  templateUrl: './response-reset-password.component.html',
  styleUrls: ['./response-reset-password.component.scss']
})
export class ResponseResetPasswordComponent implements OnInit {
  responseForm: FormGroup;
  passwordMessage: string;
  successMessage: string;
  resetToken = null;
  CurrentState: any;
  private validationMessageForPassword = {
    required: 'Please enter password',
    minlength: 'Password should be minimum of 8 characters'
  }

  
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.CurrentState = 'Wait';
    this.route.paramMap.subscribe(params => {
      this.resetToken = params.get('token');
      this.VerifyToken();
    });
    this.responseForm = this.fb.group({
      passwordGroup: this.fb.group({
        resetToken: [this.resetToken],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
        { validator: passwordMatcher }),
    })

    const passwordController = this.responseForm.get('passwordGroup.password');
    passwordController.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => {
        this.setMessage(passwordController, this.validationMessageForPassword);
      })

  }

  setMessage(c: AbstractControl, messageObject): void {
    this.passwordMessage = '';
    if ((c.touched || c.dirty) && !c.valid) {
      this.passwordMessage = Object.keys(c.errors).map(
        key => messageObject[key]
      ).join(' ');
    }
  }

  VerifyToken() {
    this.authService.ValidPasswordToken(this.resetToken).subscribe(
      data => {
        this.CurrentState = 'Verified';
      },
      err => {
        this.CurrentState = 'NotVerified';
        this.router.navigate(['login']);
      }
    );
  }

  onSubmit() {
    if(this.responseForm.valid) {
      this.responseForm.value.resetToken = this.resetToken;
      this.authService.newPassword(this.responseForm.value.resetToken,this.responseForm.value.passwordGroup.password).subscribe(
        data => {
          this.responseForm.reset();
          this.successMessage = data.message;
          this.CurrentState = null;
          setTimeout(() => {
            this.successMessage = null;
            this.router.navigate(['login']);
          }, 3000);
        },
        err => {
         console.log(err);
         this.router.navigate(['login']);
        }
      );
    }
  }

}
