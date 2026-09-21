import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

export const configuracion: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),    
    provideServiceWorker('ngsw-worker.js', 
      { enabled: !isDevMode(), 
        registrationStrategy: 'registerImmediately' 
      }
    )
  ]
};
