import { fetchMangasFromBackend, updateBackendWithNewChapters } from './api';
import { MangaDexScraper } from './scrapers/MangaDex';
import { Manga } from '../src/models/Manga';
import cron from 'node-cron';
import { Chapter } from './models/Chapter';

const runScraping = async () => {

  // Atualização de mangas 
  
  //const mangas = await fetchMangasFromBackend();
  const url = 'https://mangadex.org/title/aa6c76f7-5f5f-46b6-a800-911145f81b9b/sono-bisque-doll-wa-koi-o-suru'
  const mangas : Manga[] = []
  
  const placeholder: Manga = {
    id: '65416',
    title: 'Sono Bisquet',
    numberChapters: 1,
    url: url,
    site: 'MangaDex',
    language: 'English',
    status: 'Ongoing',
    uploader: 'stupid_chris',
    updateAt: new Date('01/30/2024') //Teste este ano.
    //updateAt: new Date('01/30/2023') // Teste ano passado
  }
  
  //mangas.push(placeholder);
  
  for (const manga of mangas) {

    console.log("Realizando o Scrap - "+ manga.title + " - " + manga.site);
    switch(manga.site){
      case 'MangaDex':
        
        const scraper = new MangaDexScraper(); // Pode ser dinâmico dependendo do site
        if (manga.numberChapters == 0){
            console.log('Realizando BulkImport');
            await scraper.bulkImportChapters(manga);
          }
          if (manga.numberChapters >= 1 && manga.status == "Ongoing"){
            console.log('Realizando CheckMangaUpdate - Data da ultima atualização: ' + manga.updateAt);
            await scraper.checkMangaUpdate(manga);
          }
        
        break;
      default:
        console.log(`Site ${manga.site} não suportado`);        
        continue;
    }
    

    // Exemplo de atualização de capítulos no backend
    //const newChapters = [{ title: 'Chapter 123', link: '/chapter/123' }];
    //await updateBackendWithNewChapters(manga.id, newChapters);
  }

  // -- Atualização de mangas FIM

  // const chapters = await fetchChaptersFromBackend();
  const urlChapter = '';
  const chapters: Chapter[] = []

  const placeholderChapter: Chapter = {
    mangaId: '65416',
    chapterNumber: 0,
    link: '/chapter/e7a41ef1-367f-4525-b9dc-afe371be7122',
    title: 'teste',
    uploadDate: new Date('01/30/2024'),
    uploader: 'stupid_chris'    
  }

  chapters.push(placeholderChapter);

  for (const chapter of chapters){
    console.log("Realizando o Scrap - "+ chapter.title );
    
    const scraper = new MangaDexScraper(); // Pode ser dinâmico dependendo do site
    scraper.chapterDownload(chapter);

  }

};

// Agendar a execução do scraper uma vez por dia
//cron.schedule('0 0 * * *', runScraping);

// Rodar manualmente no startup
runScraping();
