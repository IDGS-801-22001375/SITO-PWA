import { bootstrapApplication } from '@angular/platform-browser';
import { Aplicacion } from './app/app.component';
import { configuracion } from './app/app.config';

bootstrapApplication(Aplicacion, configuracion)
.catch(console.error);
