// import './css/styles.css';
import Notiflix from 'notiflix';
import PictureApiService from "./components/pic-service";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

window.addEventListener('scroll', infiniteScroll);
document.querySelector('.search-form').addEventListener('submit', onSubmitClick);
const galleryContainer = document.querySelector('.gallery');
const apiService = new PictureApiService()
let simpleLightBox = null;
let isExecuted = false;
let totalPics = 0;

function onSubmitClick(event) {
  event.preventDefault();
  clearArticles();
  apiService.query = event.currentTarget.elements.searchQuery.value;
  apiService.resetPage();
  
  apiService.fetchArticles()
    .then(articles => {
      if (articles.hits.length === 0) {
        return  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      };
      
      Notiflix.Notify.success(`Hooray! We found ${articles.totalHits} images.`);
      totalPics = articles.total;
      articlesMarkup(articles)
    })
};

function loadMore() {
if (apiService.page > Math.ceil(totalPics / apiService.picsPerPage)) {
  return;
  }  
  apiService.fetchArticles()
    .then(articles => {
      articlesMarkup(articles);
      if (apiService.page > Math.ceil(totalPics / apiService.picsPerPage)) {
        Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
      }
    })
};

// Сздание Шаблона разметки карточки одного изображения для галереи
function articlesMarkup(articles) {
  const markup = articles.hits.map(({largeImageURL, id, webformatURL, tags, likes, views, comments, downloads}) => {
    return `<a class="gallery__link" href="${largeImageURL}">
     <div class="photo-card" id='${id}'>
            <img class="photo-card__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
      <div class="info">
            <p class="info-item">
              <b>Likes</b>${likes}
            </p>
            <p class="info-item">
              <b>Views</b>${views}
            </p>
            <p class="info-item">
              <b>Comments</b>${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>${downloads}
            </p> 
        </div>
    </div>
    </a>`
  }).join('');
//   Добавление разметки в DOM
  galleryContainer.insertAdjacentHTML('beforeend', markup);
  simpleLightBox = new SimpleLightbox('.gallery a')
};

// Очищение разметки в DOM
function clearArticles() {
  galleryContainer.innerHTML = '';
};

// Бесконечный скролл
function infiniteScroll() {
    if (window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight && !isExecuted) {
    isExecuted = true;
    setTimeout(() => {
      isExecuted = false;
    }, 3000);
    loadMore();
  }
  simpleLightBox.refresh();
}