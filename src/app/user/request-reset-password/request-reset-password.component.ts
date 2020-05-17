import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-request-reset-password',
  templateUrl: './request-reset-password.component.html',
  styleUrls: ['./request-reset-password.component.scss']
})
export class RequestResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  forbiddenEmails: any;
  beforeSubmit = true;
  constructor(private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email], this.forbiddenEmails]
    })
  }

  onSubmit() {
    this.authService.requestReset(this.resetForm.value.email);
    this.beforeSubmit = false;
  }

}
