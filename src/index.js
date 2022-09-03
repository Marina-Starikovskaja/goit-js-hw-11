import './sass/index.scss';
import "simplelightbox/dist/simple-lightbox.min.css";
import SimpleLightbox from "simplelightbox";
import { Notify } from "notiflix";
import GalleryApi from './components/pic-service';


// максимальное количество изображений, которые API может отдать
const IMAGES_LIMIT = 500;

const refs = {
  searchForm: document.querySelector('.search-form'),
  galeryContainer: document.querySelector('.gallery'),
  observe: document.querySelector('.for-observer')
}

// Экземпляр класса GalleryApi
const gallery = new GalleryApi();
// Создает экземпляр IntersectionObserver
const observer = new IntersectionObserver(updateImagesList, { root: null, rootMargin: "300px", treshold: 1 });

let lightbox = null;
// Событие при отправке формы поиска
refs.searchForm.addEventListener('submit', onSearch);


/** 
 * Функция получает объект изображений и отображает их в DOM HTML
 * работает только при первом новом запросе
 */
async function onSearch(e) {
  e.preventDefault();

  gallery.resetPage();
  gallery.resetImagesOnPage();

  // Отключаем наблюдатель перед очисткой галереи
  observer.unobserve(refs.observe);
  clearGalleryContainer();

  // Получаем значение элемента ввода с атрибутом имени «searchQuery»
  const queryString = e.target.elements.searchQuery.value;

  try {
    // Отправляем запрос для получения изображений
    await gallery.getImagesByQuery(queryString)
      .then(markupGalleryContainer)

    // Экземпляр Lightbox
    lightbox = new SimpleLightbox('.gallery__item', { showCounter: false });

    // Включает наблюдателя
    observer.observe(refs.observe);
  } catch (e) {
    Notify.failure(e.message)
  }
}

/**
 * Функция Пересматривает объекты до наблюдаемого тега
 * и получает следующие объекты старого запроса
 */
async function updateImagesList(entries) {
  if (entries[0].isIntersecting) {
    // when images limit done show notification and stop observe
    if (gallery.getImagesOnPage() >= IMAGES_LIMIT) {
      Notify.failure("We're sorry, but you've reached the end of search results.");
      observer.unobserve(refs.observe);
      return;
    }

    // Новый запрос увеличит страницу и подсчитать изображения на странице
    gallery.incrementPage();
    gallery.incrementImagesOnPage();

    try {
      // Отправляет запрос, чтобы получить следующую часть объекта и разместить их ниже
      await gallery.getImagesByQuery().then(markupGalleryContainer);
    } catch (e) {
      Notify.failure(e.message)
    }

    // Обновляет экземпляр лайтбокса для подключения новых изображений
    lightbox.refresh();
  }
}
// Создает разметку 
function markupGalleryContainer(data) {
  const markup = data.map(({ largeImageURL, id, webformatURL, tags, likes, views, comments, downloads }) => {
    return `<a class="gallery__item" href="${largeImageURL}">
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
  // Добавляет разметку в DOM
  refs.galeryContainer.insertAdjacentHTML('beforeend', markup);
}

function clearGalleryContainer() {
  refs.galeryContainer.innerHTML = "";
}

