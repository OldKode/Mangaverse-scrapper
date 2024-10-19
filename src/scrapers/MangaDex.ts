import { ElementHandle, expect, Page } from '@playwright/test';
import { Chapter } from '../models/Chapter';
import { ApiResponse, BaseScraper, parseJsonResponse, sleep, Image } from './MangaScraper';
import { Manga } from '../models/Manga';

export class MangaDexScraper extends BaseScraper {
  libraryName = 'MangaDex';
  urlBase = 'https://mangadex.org';

  async bulkImportChapters(manga: Manga): Promise<void> {
    const page = await this.scrapePage(manga.url);
    const newChapters: Chapter[] = []
    const debugMode = process.env.DEBUG_MODE == "TRUE";
    var scrapping = true;

    // Extraindo capítulos diretamente da página

    // Faz algo com os capítulos
    while (scrapping) {
      // Aguarda até que os capítulos estejam visíveis
      await page.waitForSelector('div.flex.chapter.relative',{timeout:5000});

      // Coleta todos os capítulos
      const chapters = await page.$$('[class*="flex chapter relative"]');
                
      for (const chapter of chapters) {
          const text = await chapter.textContent();
          // console.log(text +"\n");
          if ((await chapter.$$('[title="' + manga.language + '"]')).toString() != "" ){              

              const newChapter: Chapter = await this.scrapeChapterElements(chapter, manga.id);

              newChapters.push(newChapter);
                
          }
      }    

      scrapping = await this.checkButton(page);
    }

    console.log('Novos capítulos encontrados:', newChapters);

    await page.context().browser()?.close();
  }

  async scrapePageImage(chapter: Chapter): Promise< Image[]> {
    const page = await this.createPage();
    //this.disableResourcesImage(page);
    let parsedData: ApiResponse;

    // TO-DO Coleta dos chapters.

    let imagensJorge: Image[] = [
      { "nomeImage": "1-4c1ca4f5e83abf01799238ace17541914b0f6c79f6171357eced8bc51c117a94.png", "url": "" },
      { "nomeImage": "2-a44cb060f74b850372355ab985de22811d9892635d4302408d0e283561af9991.png", "url": "" },
      { "nomeImage": "3-613a86b20004b8c075496941ddc5163fdb943315e8c7bab108e875bf357ed742.png", "url": "" },
      { "nomeImage": "4-7a4925057ce330ff219dae4f1c68dab31da4b0e841553ed85923d8f344447cb1.png", "url": "" },
      { "nomeImage": "5-8d7cd64beb1a68e4e5263542131ff813e2f9eb4eae5c0eecf31fcccbbf3e6479.png", "url": "" },
      { "nomeImage": "6-282f96f55b8292534260cac119cc54e53bd4e0fe4b1c166a73613f2e54606424.png", "url": "" },
      { "nomeImage": "7-26a21cd8520206ba47f3a29097f12ae08a8b9f64087d9277503f8a6392bb3a07.png", "url": "" },
      { "nomeImage": "8-65d13282dfda8468be753dd158a1565dcf53249372cef6dff8e5a82987bbbd89.png", "url": "" },
      { "nomeImage": "9-aadb268206a9bc404a2dea725c642628109f7d73435b1ff5c30edb786648d6a4.png", "url": "" },
      { "nomeImage": "10-b9fdd5a103de8e14d50c7590ebe86140ab228cf4388b4b6cfe0964103605db89.png", "url": "" },
      { "nomeImage": "11-8da9f7970838b044cb72e57415cad6b8202fa9fca408b36f5444afdd28261589.png", "url": "" },
      { "nomeImage": "12-a3ba69f1078d5b76613dffec263519fcab3935e5d96c05bd6cde610fa054fd1d.png", "url": "" },
      { "nomeImage": "13-f2ff6ec6d1a721b0a503d22b9513980c05285ecc82e20b1bb3f44654cfc01dac.png", "url": "" }
    ]
    

    page.on('response', async (response) =>{
        const urlResponse = response.url();
                        
        const returnType =  JSON.stringify(await response.headerValue("content-type"));
        if(returnType == '"image/png"'){
          //console.log("urlResponse - " + urlResponse);
        }

        if (response.url().includes('/at-home/')){          
          //console.log(await response.text());

          const jsonString = response.text();
          parsedData = parseJsonResponse(await jsonString);

          //console.log(parsedData.chapter.data);
        }

        if(parsedData){        
          const imagesCodes: string[] = parsedData.chapter.data.data;

          const itemEncontrado =  imagensJorge.find( item => urlResponse.endsWith(item.nomeImage) );
          if (itemEncontrado)
            itemEncontrado.url = urlResponse;

        }
        
      }
    )

    await page.goto(this.urlBase +  chapter.link , {waitUntil: "domcontentloaded"});

    while(true){
      const pending = imagensJorge.some( item => item.url === "")

      
      if (!pending){
        break;
      }

      await sleep(500);
    }

    //console.log(imagensJorge);
    await page.context().browser()?.close();
    
    return imagensJorge; // Retorna o objeto Page do Playwright
  }
  

  async checkMangaUpdate(manga: Manga): Promise<void> {
    const page = await this.scrapePage(manga.url);
    const newChapters: Chapter[] = []
    let newChapter: Chapter | null;
    const debugMode = process.env.DEBUG_MODE == "TRUE";
    
    let scrapping = true;

    // Faz algo com os capítulos
    while (scrapping) {
      // Aguarda até que os capítulos estejam visíveis
      await page.waitForSelector('div.flex.chapter.relative',{timeout:5000});

      // Coleta todos os capítulos
      const chapters = await page.$$('[class*="flex chapter relative"]');

      for (const chapter of chapters) {
        const text = await chapter.textContent();
        
        if ((await chapter.$$('[title="' + manga.language + '"]')).toString() != "" ){     
                

          if (manga.uploader){
            if ((await chapter.$$('[title="' + manga.uploader + '"]')).toString() != "" ){
              newChapter = await this.scrapeChapterElements(chapter, manga.id);
            }else{
              newChapter = null;
            }

          }else{
            newChapter = await this.scrapeChapterElements(chapter, manga.id);
          }

          if (newChapter){
            if (newChapter.uploadDate > manga.updateAt ){
              newChapters.push(newChapter);
            }else {
              scrapping = false;
            }             
          }else{
            scrapping = false;
          }                      
        }
      }

      console.log('Validação normal - ' + scrapping);

      if (scrapping)
        scrapping = await this.checkButton(page);
        console.log('CheckButton - ' + scrapping);

    }    

    console.log('Novos capítulos encontrados:', newChapters);
    await page.context().browser()?.close();
  }

  async scrapeChapterElements(chapter: ElementHandle, mangaId: string): Promise<Chapter> {
    const titleElement = (await chapter.$$('[style="grid-area: title;"]')).at(0);
    const title = await titleElement?.textContent() || "";
  
    const uploaderElement = (await chapter.$$('[style="grid-area: uploader;"]')).at(0);
    const uploader = await uploaderElement?.textContent() || "";
  
    const linksElement = (await chapter.$$('[data-v-c031ce93]'));
    const link = await linksElement[1].getAttribute('href') || "";
  
    const updateElements = (await (await chapter.$$('[style="grid-area: timestamp;"]')).at(0)?.$$('[class="whitespace-nowrap"]'))?.at(0);
    const update = await updateElements?.getAttribute('datetime') || Date.now();
  
    return {
      title,
      chapterNumber: 0, // You might need to scrape chapter number differently
      link,
      mangaId,
      uploader,
      uploadDate: new Date(update),
      pages: [],
    };
  }

  async chapterDownload(chapter: Chapter): Promise<void>{
    
    const images: Image[] = await this.scrapePageImage(chapter);

    for (const image of images){
      this.downloadImageAndConvertToBase64(image.url);
    }

    // TO-DO 
    // Feito -  Migrar o codigo do MangaScraper pra cá
    // Manipulação das imagens com o axios chamando do MangaScrapper salvando em uma pasta TEMP
    // Envia para o Backend as imagens da TEMP
    // Limpa pasta TEMP
    
         
    //await page.context().browser()?.close();
  }

  async checkButton(pagina: Page) : Promise<boolean> {
    const selector = 'div[data-v-52e9986a] [data-v-8d292eb9].rounded-full:last-child'; // Combinando o atributo e a classe
    const botao = await pagina.locator(selector);
  
    // Verificações adicionais (opcional)
    try{
      await expect(botao).toHaveAttribute('data-v-8d292eb9'); // Redundante, mas reforça a verificação
      await expect(botao.locator('span svg.feather-arrow-right')).toBeVisible();      
      //await expect(botao).toHaveClass('disabled');      
      await botao.click();
      //console.log('O botão não está desabilitado.');
      return true;
    } catch (error) {      
      //console.log('O botão está desabilitado.');
      return false;
    }
  }

}
