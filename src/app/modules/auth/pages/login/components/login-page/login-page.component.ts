import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../../service/auth.service';
import { UserAuthService } from '../../../../../../common/services/user-auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzCheckboxModule,
    NzButtonModule,
    NzDividerModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.less'
})
export class LoginPageComponent {
  private fb = inject(NonNullableFormBuilder);
  loginService = inject(AuthService);
  userAuthSer = inject(UserAuthService);
  router = inject(Router)

  validateForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
    // remember: FormControl<boolean>;  
  }> = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    // remember: [true]
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      this.loginService.login(this.validateForm.value).subscribe((data: any) => {
        this.userAuthSer.setUserToken(data.data.token)
        this.userAuthSer.setUsername(this.validateForm.value.username || '')
        this.userAuthSer.setUserAdminStatus(data.data.sysadmin)
        this.router.navigate(['/dashboard'])
      })
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  msAuth() {
    this.loginService.msLogin();
  }
}
