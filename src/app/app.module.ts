import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './user/login/login.component';
import { SignUpComponent } from './user/sign-up/sign-up.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms' 
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomeComponent } from './home/home.component'; 
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFileUploadModule } from 'angular-material-fileupload';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FilesComponent } from './files/files.component';
import { MatProgressBarModule } from '@angular/material';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogComponent } from './files/dialog/dialog.component';
import { FileService } from './files/file.service';
import { FileListComponent } from './files/file-list/file-list.component';
import { FileUploadComponent } from './files/file-upload/file-upload.component';
import { DetailMessageComponent } from './files/detail-message/detail-message.component';
import { HeaderComponent } from './header/header.component';
import { FileDetailComponent } from './files/file-detail/file-detail.component';
import { MatProgressSpinnerModule } from '@angular/material';
import { AuthService } from './user/auth.service';
import { AuthInterceptor } from './user/auth-interceptor';
import { DatePipe } from '@angular/common';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { ErrorComponent } from './error/error.component';
import { RequestResetPasswordComponent } from './user/request-reset-password/request-reset-password.component';
import { ResponseResetPasswordComponent } from './user/response-reset-password/response-reset-password.component';
import { PageNotFoundComponent } from '../app/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent, 
    LoginComponent,
    SignUpComponent,
    HomeComponent,
    FilesComponent,
    DialogComponent,
    FileListComponent,
    FileUploadComponent,
    DetailMessageComponent,
    HeaderComponent,
    FileDetailComponent,
    ErrorComponent,
    RequestResetPasswordComponent,
    ResponseResetPasswordComponent,
    PageNotFoundComponent
  ],
  entryComponents: [
    DialogComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatFileUploadModule,
    MatDividerModule,
    MatListModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatProgressBarModule,
    FormsModule,
    MatProgressSpinnerModule
    // UserModule,    
  ],
  providers: [
    AuthService,
    FileService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
