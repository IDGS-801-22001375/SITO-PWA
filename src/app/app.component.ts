import {
  Component,
  signal,
  computed,
  inject,
  HostListener,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

function leer<T>(clave: string, inicial: T): T {
  try {
    const valor = JSON.parse(
      localStorage.getItem(clave) || 'null'
    );

    return valor ?? inicial;
  } catch {
    return inicial;
  }
}

interface Aviso {
  id: number;
  titulo: string;
  tipo: string;
  texto: string;
  color: string;
}

@Component({
  selector: 'app-raiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class Aplicacion implements OnInit {
  conexion = signal(navigator.onLine);
  aviso = signal('');

  private http = inject(HttpClient);

  @HostListener('window:online')
  conectar() {
    this.conexion.set(true);
    this.cargar();
  }

  @HostListener('window:offline')
  desconectar() {
    this.conexion.set(false);
  }

  guardar(clave: string, valor: unknown) {
    try {
      localStorage.setItem(
        clave,
        JSON.stringify(valor)
      );
    } catch {
      this.aviso.set(
        'No se pudo guardar en este navegador. Revisa el espacio o los permisos.'
      );
    }
  }

  ngOnInit() {
    this.cargar();
  }

  avisos = signal<Aviso[]>(
    leer('sito-avisos', [])
  );

  busqueda = signal('');
  menu = signal(false);
  abierto = signal('');

  detalle = signal<Aviso | null>(null);

  modulos = [
    '1-REINSCRIPCIÓN Y REFERENCIAS DE PAGO',
    'ALUMNOS',
    'BECAS',
    'BOLSA DE TRABAJO',
    'BUZÓN',
    'CITAS A ÁREAS DE SERVICIOS',
    'CONTROL Y ACCESO',
    'CREDENCIAL',
    'EGRESADOS',
    'ESTADÍAS',
    'EXTRAORDINARIO',
    'FRANCÉS',
    'INGLÉS',
    'MI PERFIL'
  ];

  visibles = computed(() =>
    this.modulos.filter(m =>
      m.toLocaleLowerCase().includes(
        this.busqueda().toLocaleLowerCase()
      )
    )
  );

  cargar() {
    this.http.get<Aviso[]>('/api/avisos').subscribe({
      next: datos => {
        this.avisos.set(datos);
        this.guardar('sito-avisos', datos);
      },

      error: () => {
        this.aviso.set(
          'Sin acceso a la API. Se muestran los avisos guardados.'
        );
      }
    });
  }
}