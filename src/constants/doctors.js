// src/constants/doctors.js
import { SPECIALTIES } from './specialties';

// Mapa especialidad -> lista de médicos
export const DOCTORS = {
  'Medicina general / familiar': ['Dr. Sergio Cárdenas', 'Dra. Paula Medina'],
  'Medicina interna': ['Dra. Laura Ríos', 'Dr. Jorge Prieto'],
  Pediatría: ['Dr. Andrés Ramírez', 'Dra. Mariana Torres'],
  'Ginecología y obstetricia': ['Dra. Sofía Herrera', 'Dr. Camilo Duarte'],
  Cardiología: ['Dr. Julián Pérez', 'Dra. Natalia Cruz'],
  Dermatología: ['Dr. Mateo Vega', 'Dra. Ana Robledo'],
  Oftalmología: ['Dr. Felipe Mora', 'Dra. Isabel Peña'],
  'Otorrinolaringología (ORL)': ['Dr. Dario León', 'Dra. Ángela Barrios'],
  'Traumatología y ortopedia': ['Dr. Mauricio Castro', 'Dra. Lina Ocampo'],
  'Cirugía general': ['Dr. Esteban Ríos', 'Dra. Catalina Nieto'],
  Anestesiología: ['Dr. Ricardo Gil', 'Dra. Viviana Soto'],
  Psiquiatría: ['Dr. Samuel Ortega', 'Dra. Patricia Díaz'],
  Neurología: ['Dr. Andrés Pardo', 'Dra. Juliana Rincón'],
  Urología: ['Dr. Henry Bernal', 'Dra. Paulina Rivas'],
  Gastroenterología: ['Dr. Luis Beltrán', 'Dra. Marcela Pino'],
  'Neumología (pulmonar)': ['Dr. Oscar Muñoz', 'Dra. Karina Borda'],
  Endocrinología: ['Dr. Iván Acosta', 'Dra. Verónica Ruiz'],
};

// CC por médico
export const DOCTOR_CC = {
  'Dr. Sergio Cárdenas': '1000000001',
  'Dra. Paula Medina': '1000000002',
  'Dra. Laura Ríos': '1000000003',
  'Dr. Jorge Prieto': '1000000004',
  'Dr. Andrés Ramírez': '1029673456',
  'Dra. Mariana Torres': '1098765432',
  'Dra. Sofía Herrera': '1000000005',
  'Dr. Camilo Duarte': '1000000006',
  'Dr. Julián Pérez': '1011122233',
  'Dra. Natalia Cruz': '1000000007',
  'Dr. Mateo Vega': '1000000008',
  'Dra. Ana Robledo': '1000000009',
  'Dr. Felipe Mora': '1000000010',
  'Dra. Isabel Peña': '1000000011',
  'Dr. Dario León': '1000000012',
  'Dra. Ángela Barrios': '1000000013',
  'Dr. Mauricio Castro': '1000000014',
  'Dra. Lina Ocampo': '1000000015',
  'Dr. Esteban Ríos': '1000000016',
  'Dra. Catalina Nieto': '1000000017',
  'Dr. Ricardo Gil': '1000000018',
  'Dra. Viviana Soto': '1000000019',
  'Dr. Samuel Ortega': '1000000020',
  'Dra. Patricia Díaz': '1000000021',
  'Dr. Andrés Pardo': '1000000022',
  'Dra. Juliana Rincón': '1000000023',
  'Dr. Henry Bernal': '1000000024',
  'Dra. Paulina Rivas': '1000000025',
  'Dr. Luis Beltrán': '1000000026',
  'Dra. Marcela Pino': '1000000027',
  'Dr. Oscar Muñoz': '1000000028',
  'Dra. Karina Borda': '1000000029',
  'Dr. Iván Acosta': '1000000030',
  'Dra. Verónica Ruiz': '1000000031',
};

// Lista de todos los médicos (útil para checkboxes, etc.)
export const ALL_DOCTORS = Object.values(DOCTORS).flat();

// Mapa rápido doctor -> especialidad
export const SPECIALTY_OF_DOCTOR = ALL_DOCTORS.reduce((acc, name) => {
  const spec = SPEC
