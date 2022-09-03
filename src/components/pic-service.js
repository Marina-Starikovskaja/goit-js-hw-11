const axios = require('axios').default;


export default class GalleryApi {
  // поисковый запрос для запроса к API
  #searchQuery;
  // текущий номер страницы
  #page;
  // текущее количество изображений на странице
  #imagesOnPage;

  API_URL = "https://pixabay.com/api/";
  API_KEY = "29642861-56a252d940506f5c6c49d45ba";

  // Макс количество изображений в каждом ответе
  PER_PAGE = 40;

  constructor() {
    this.#searchQuery = '';
    this.#page = 1;
    this.#imagesOnPage = this.PER_PAGE;
  }

  /**
   * Запрос на Pixaby Api - https://pixabay.com/api/ с параметрами
   * получает массив объектов, если все в порядке
   * или сообщает об ошибке сбоя, если нет изображений, соответствующих поисковому запросу
   */
  async getImagesByQuery(searchQuery = this.#searchQuery) {
    this.searchQuery = searchQuery;

    if(this.#searchQuery !== '') {
      // Параметры запроса
      const params = {
        key: this.API_KEY,
        q: this.#searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: this.#page,
        per_page: this.PER_PAGE
      }

      const response = await axios.get(this.API_URL, {params})
      .then(response => {
        if(response.data.total === 0) {
          const errorMessage = "Sorry, there are no images matching your search query. Please try again.";
          throw new Error(errorMessage);
        }
        return response.data.hits;
      });
      
      return response;      
    }
  }

  // Увеличевает текущее количество изображений не более чем на 500
  incrementImagesOnPage() {
    this.#imagesOnPage += this.PER_PAGE;
    this.#imagesOnPage = this.#imagesOnPage > 500 ? 500 : this.#imagesOnPage;
  }

  resetImagesOnPage() {
    this.#imagesOnPage = this.PER_PAGE;
  }

  getImagesOnPage() {
    return this.#imagesOnPage;
  }

  incrementPage() {
    this.#page += 1;
  }

  resetPage() {
    this.#page = 1;
  }

  set searchQuery(query) {
    this.#searchQuery = query.trim();
  }

  get searchQuery() {
    return this.#searchQuery;
  }
}