// tecnicos/servicio/TecnicoService.js

let tecnicos = [
  { id: 1, nombre: "Pedro Pisfil", dni: "40232588" },
  { id: 2, nombre: "Danny Reyes", dni: "50808084" },
  { id: 3, nombre: "Daniela Quispealaya", dni: "78945551" },
];

// Obtener todos
export const getTecnicos = () => {
  return Promise.resolve({ data: tecnicos });
};

// Crear
export const createTecnico = (data) => {
  const newTecnico = { id: Date.now(), ...data };
  tecnicos.push(newTecnico);
  return Promise.resolve({ data: newTecnico });
};

// Actualizar
export const updateTecnico = (id, data) => {
  tecnicos = tecnicos.map((t) => (t.id === parseInt(id) ? { ...t, ...data } : t));
  return Promise.resolve({ data });
};

// Eliminar
export const deleteTecnico = (id) => {
  tecnicos = tecnicos.filter((t) => t.id !== parseInt(id));
  return Promise.resolve({ data: true });
};

// Obtener por id
export const getTecnicoById = (id) => {
  const tecnico = tecnicos.find((t) => t.id === parseInt(id));
  return Promise.resolve({ data: tecnico });
};




