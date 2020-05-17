import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { SignUpComponent } from './user/sign-up/sign-up.component';
import { FilesComponent } from './files/files.component';
import { HomeComponent } from './home/home.component';
import { FileDetailComponent } from './files/file-detail/file-detail.component';
import { AuthGuard } from './user/auth.guard';
import { RequestResetPasswordComponent } from './user/request-reset-password/request-reset-password.component';
import { ResponseResetPasswordComponent } from './user/response-reset-password/response-reset-password.component';
import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  }, 
  {
    path: 'signUp',
    component: SignUpComponent,
    
  },
  {
    path: 'files',
    component: FilesComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'files/:id',
    component: FileDetailComponent,
    canActivate: [AuthGuard]

  },
  {
    path: 'resetPassword',
    component: RequestResetPasswordComponent

  },
  {
    path: 'responseToReset/:token',
    component: ResponseResetPasswordComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
