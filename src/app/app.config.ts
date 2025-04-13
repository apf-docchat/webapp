import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { requestInterceptor } from './common/interceptor/request.interceptor';
import { errorHandleInterceptor } from './common/interceptor/error-handle.interceptor';
import { EnvConfigService } from './common/services/env-config.service';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';

registerLocaleData(en);

const ngZorroConfig: NzConfig = {
  theme: {
    primaryColor: '#1463db',
    errorColor: '#dd4f51',
  }
};

function initializeApp(configService: EnvConfigService) {
  return (): Promise<any> => {
    return configService.loadConfig();
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideHttpClient(),
    // importProvidersFrom(HttpClientModule),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([requestInterceptor, errorHandleInterceptor]),
    ),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [EnvConfigService],
    },
    { provide: NZ_CONFIG, useValue: ngZorroConfig },
  ]
};
