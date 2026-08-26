const legalDocuments = {
  offer: {
    title: "Договор-оферта",
    folder: "offer",
    pages: 11,
    width: 1414,
    height: 2000
  },
  "privacy-policy": {
    title: "Политика конфиденциальности и обработки персональных данных",
    folder: "privacy-policy",
    pages: 9,
    width: 1414,
    height: 2000
  },
  "cookie-policy": {
    title: "Политика использования cookies",
    folder: "cookie-policy",
    pages: 4,
    width: 1547,
    height: 2002
  },
  "payment-and-refund-rules": {
    title: "Правила оплаты услуг и возврата денежных средств",
    folder: "payment-and-refund-rules",
    pages: 7,
    width: 1414,
    height: 2000
  }
};

const params = new URLSearchParams(window.location.search);
const documentId = params.get("doc");
const selectedDocument = legalDocuments[documentId];
const titleNode = document.querySelector("#document-title");
const metaNode = document.querySelector("#document-meta");
const pagesNode = document.querySelector("#document-pages");

function padPage(page) {
  return String(page).padStart(2, "0");
}

if (!selectedDocument) {
  document.title = "Документ не найден | Денисова и партнеры";
  titleNode.textContent = "Документ не найден";
  metaNode.textContent = "Проверьте ссылку или вернитесь на основной сайт.";
  pagesNode.innerHTML = '<p class="legal-error">Запрошенный правовой документ отсутствует.</p>';
} else {
  document.title = `${selectedDocument.title} | Денисова и партнеры`;
  titleNode.textContent = selectedDocument.title;
  metaNode.textContent = `${selectedDocument.pages} ${selectedDocument.pages === 4 ? "страницы" : "страниц"} · версия для ознакомления`;

  const fragment = document.createDocumentFragment();
  for (let page = 1; page <= selectedDocument.pages; page += 1) {
    const figure = document.createElement("figure");
    figure.className = "legal-page";

    const image = document.createElement("img");
    image.src = `legal-pages/${selectedDocument.folder}/page-${padPage(page)}.webp`;
    image.alt = `${selectedDocument.title}, страница ${page} из ${selectedDocument.pages}`;
    image.width = selectedDocument.width;
    image.height = selectedDocument.height;
    image.loading = page === 1 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;

    const caption = document.createElement("figcaption");
    caption.textContent = `Страница ${page} из ${selectedDocument.pages}`;

    figure.append(image, caption);
    fragment.append(figure);
  }
  pagesNode.append(fragment);
}

["copy", "cut", "contextmenu", "dragstart", "selectstart"].forEach((eventName) => {
  document.addEventListener(eventName, (event) => event.preventDefault());
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && ["c", "p", "s", "u"].includes(key)) {
    event.preventDefault();
  }
});
