import { chromium, Page } from 'playwright';
import { Manga } from '../models/Manga';
import axios from 'axios';
import { resolve } from 'path';
import { Chapter } from '../models/Chapter';

export interface Image {
  nomeImage: string;
  url: string; // Assuming URLs are stored in the "data" property
}

export interface ChapterData {
  data: string[]; // List of image objects
  dataSaver?: Image[]; // Optional list of data saver images (if present)
}

export interface ApiResponse {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: ChapterData;
  };
}

export abstract class BaseScraper {
  abstract libraryName: string;
  abstract urlBase: string;

  async createPage(): Promise<Page> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();    
    const page = await context.newPage();

    return page;
  }

  async scrapePage(url: string): Promise<Page> {
    const page = await this.createPage();
    this.disableResources(page);

    await page.goto(url);
    
    return page; // Retorna o objeto Page do Playwright
  }
  
  /*
  async scrapePageImage(url: string, urlImages: string): Promise<Page> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      //viewport: { width: 1280, height: 720 }
    });    
    const page = await context.newPage();
    //this.disableResourcesImage(page);
    let parsedData: ApiResponse;

    let imagensJorge = [
      { "nome": "1-4c1ca4f5e83abf01799238ace17541914b0f6c79f6171357eced8bc51c117a94.png", "url": "" },
      { "nome": "2-a44cb060f74b850372355ab985de22811d9892635d4302408d0e283561af9991.png", "url": "" },
      { "nome": "3-613a86b20004b8c075496941ddc5163fdb943315e8c7bab108e875bf357ed742.png", "url": "" },
      { "nome": "4-7a4925057ce330ff219dae4f1c68dab31da4b0e841553ed85923d8f344447cb1.png", "url": "" },
      { "nome": "5-8d7cd64beb1a68e4e5263542131ff813e2f9eb4eae5c0eecf31fcccbbf3e6479.png", "url": "" },
      { "nome": "6-282f96f55b8292534260cac119cc54e53bd4e0fe4b1c166a73613f2e54606424.png", "url": "" },
      { "nome": "7-26a21cd8520206ba47f3a29097f12ae08a8b9f64087d9277503f8a6392bb3a07.png", "url": "" },
      { "nome": "8-65d13282dfda8468be753dd158a1565dcf53249372cef6dff8e5a82987bbbd89.png", "url": "" },
      { "nome": "9-aadb268206a9bc404a2dea725c642628109f7d73435b1ff5c30edb786648d6a4.png", "url": "" },
      { "nome": "10-b9fdd5a103de8e14d50c7590ebe86140ab228cf4388b4b6cfe0964103605db89.png", "url": "" },
      { "nome": "11-8da9f7970838b044cb72e57415cad6b8202fa9fca408b36f5444afdd28261589.png", "url": "" },
      { "nome": "12-a3ba69f1078d5b76613dffec263519fcab3935e5d96c05bd6cde610fa054fd1d.png", "url": "" },
      { "nome": "13-f2ff6ec6d1a721b0a503d22b9513980c05285ecc82e20b1bb3f44654cfc01dac.png", "url": "" }
    ]
    

    page.on('response', async (response) =>{
        const urlResponse = response.url();
                        
        const returnType =  JSON.stringify(await response.headerValue("content-type"));
        if(returnType == '"image/png"'){
          //console.log("urlResponse - " + urlResponse);
        }

        if (response.url().includes(urlImages)){          
          //console.log(await response.text());

          const jsonString = response.text();
          parsedData = parseJsonResponse(await jsonString);

          //console.log(parsedData.chapter.data);
        }

        if(parsedData){        
          const imagesCodes: string[] = parsedData.chapter.data.data;

          const itemEncontrado =  imagensJorge.find( item => urlResponse.endsWith(item.nome) );
          if (itemEncontrado)
            itemEncontrado.url = urlResponse;

        }
        
      }
    )

    await page.goto(url , {waitUntil: "domcontentloaded"});

    while(true){
      const pending = imagensJorge.some( item => item.url === "")

      
      if (!pending){
        break;
      }

      await sleep(500);
    }

    console.log('acabou porra');
    console.log(imagensJorge);
    
    return imagensJorge; // Retorna o objeto Page do Playwright
  }
  */

  async downloadImageAndConvertToBase64(imageUrl: string) {
    try {
      // Faz a requisição para a imagem
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
  
      // Converte o buffer para base64
      const base64Image = buffer.toString('base64');
  
      // Aqui você enviaria a imagem em base64 para outro endpoint
      // Exemplo usando o Axios novamente:
      // const responseToSend = await axios.post('seu_outro_endpoint', {
      //   image: base64Image
      // });
  
      //console.log('Imagem enviada com sucesso:', responseToSend.data);
      console.log('Imagem enviada com sucesso:', base64Image);
    } catch (error) {
      console.error('Erro ao baixar ou enviar a imagem:', error);
    }
  }


  async disableResources(page: Page, types = ['image', 'font', 'stylesheet', 'other']){
    await page.route('**/*', (route, request) =>{
      // Verifica o tipo de recurso da requisição
      if (types.includes(request.resourceType())){
        route.abort();
      }else{
        route.continue();
        if (types.includes('image') ){
          page.on('response', (response) =>
            console.log('<<', response.status(), response.url())
          )
        }
      }
    })
  }

  async disableResourcesImage(page: Page){
    await page.route('**/*', (route, request) =>{
      // Verifica o tipo de recurso da requisição      
      route.continue();
      if ("image".includes('image')){
        page.on('response', (response) =>{
          if(response.url().endsWith('.png') ){
            //console.log('<<', response.status(), response.url())
          }
        }
        )
      }
    
    })
  }

  abstract bulkImportChapters(manga: Manga): Promise<void>;

  abstract scrapePageImage(chapter: Chapter): Promise< Image[]>;

  
}

export function sleep (ms: number): Promise<void> {  
  return new Promise (resolve => setTimeout(resolve, ms));
}

export function parseImageData(dataString: string): ChapterData {
  // Split the data string into individual image URLs
  const imageUrls: string[] = dataString.split(",");

  // Map each URL to an Image object with the correct format
  // const images: Image[] = imageUrls.map((url) => ({
  //   url: url.trim(), // Remove any leading/trailing whitespace
  // }));

  const images: string[] = imageUrls.map((url) => (url.trim()));

  return { data: images };
}

export function parseJsonResponse(jsonString: string): ApiResponse {
  const data: ApiResponse = JSON.parse(jsonString);

  // Extract and parse the image data
  const imageDataString = (data.chapter.data as unknown as string[]).join(","); // Type assertion
  data.chapter.data = parseImageData(imageDataString);
  
  return data;
}