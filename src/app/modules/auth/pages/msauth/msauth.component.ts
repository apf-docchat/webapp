import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAuthService } from '../../../../common/services/user-auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-msauth',
  standalone: true,
  imports: [],
  templateUrl: './msauth.component.html',
  styleUrl: './msauth.component.less'
})
export class MsauthComponent {
  userAuthSer = inject(UserAuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  notification = inject(NzNotificationService)

  ngOnInit() {
    this.route.queryParams
      .subscribe((params: any) => {
        console.log(params)
        if (params?.token) {
          this.userAuthSer.setUserToken(params.token)
          this.userAuthSer.setUsername(params.username)
          this.userAuthSer.setUserAdminStatus(params.sysadmin)
          this.router.navigate(['/dashboard'])
        } else {
          this.notification.create(
            'warning',
            'Warning',
            'Login Failed',
            { nzPlacement: 'bottomLeft' }
          );
          this.router.navigate(['/auth'])
        }

      });
  }
}
