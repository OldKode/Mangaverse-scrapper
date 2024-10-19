import axios from 'axios';

// Função para buscar mangás do backend
export const fetchMangasFromBackend = async () => {
  const response = await axios.get('http://localhost:3000/api/mangas');
  return response.data;
};

// Função para atualizar o backend com novos capítulos
export const updateBackendWithNewChapters = async (mangaId: string, newChapters: any[]) => {
  await axios.post(`http://localhost:3000/api/mangas/${mangaId}/chapters`, { chapters: newChapters });
};
