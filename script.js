const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("#main-nav");
const revealItems = document.querySelectorAll(".reveal");
const form = document.querySelector("[data-lead-form]");
const formError = document.querySelector("[data-form-error]");
const formSuccess = document.querySelector("[data-form-success]");
const toast = document.querySelector("[data-toast]");
const channelSelect = document.querySelector("[data-channel-select]");
const channelButtons = document.querySelectorAll("[data-channel]");
const videoButtons = document.querySelectorAll("[data-video-button]");
const videoModal = document.querySelector("[data-video-modal]");
const videoCloseButtons = document.querySelectorAll("[data-video-close]");
const modalVideo = videoModal?.querySelector("video");
const modalVideoTitle = videoModal?.querySelector("[data-video-title]");
const modalDialog = videoModal?.querySelector("[data-video-dialog]");
const mobileDock = document.querySelector("[data-mobile-dock]");
const mobileDockLinks = mobileDock?.querySelectorAll("a") || [];
const applicationSection = document.querySelector("#application");
const mobileViewport = window.matchMedia("(max-width: 680px)");
const tariffTabs = document.querySelector("[data-tariff-tabs]");
const tariffTabButtons = tariffTabs?.querySelectorAll("[data-tariff-tab]") || [];
const tariffCards = document.querySelectorAll("[data-tariff-card]");
let lastVideoTrigger = null;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const leadEndpoint = "https://formsubmit.co/ajax/batuninivan3@gmail.com";
const submitButton = form?.querySelector("button[type='submit']");
const submitLabel = submitButton?.querySelector("[data-submit-label]");
const paymentApiBase = String(document.querySelector('meta[name="payment-api"]')?.content || "").replace(/\/$/, "");

function setMobileDockState() {
  if (!mobileDock) return;

  const applicationRect = applicationSection?.getBoundingClientRect();
  const applicationInView = Boolean(
    applicationRect && applicationRect.top < window.innerHeight * 0.78 && applicationRect.bottom > 0
  );
  const menuIsOpen = nav?.classList.contains("is-open");
  const isVisible = mobileViewport.matches
    && window.scrollY > Math.max(460, window.innerHeight * 0.66)
    && !applicationInView
    && !menuIsOpen;

  mobileDock.classList.toggle("is-visible", isVisible);
  mobileDock.setAttribute("aria-hidden", String(!isVisible));
  mobileDockLinks.forEach((link) => {
    if (isVisible) {
      link.removeAttribute("tabindex");
    } else {
      link.setAttribute("tabindex", "-1");
    }
  });
}

function setActiveMobileTariff(planKey, moveFocus = false) {
  const safePlanKey = ["economy", "standard", "premium"].includes(planKey) ? planKey : "standard";
  const isMobile = mobileViewport.matches;

  tariffTabButtons.forEach((button) => {
    const isActive = button.dataset.tariffTab === safePlanKey;
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    if (isActive && moveFocus) button.focus();
  });

  tariffCards.forEach((card) => {
    const isActive = card.dataset.tariffCard === safePlanKey;
    card.classList.toggle("is-mobile-active", isActive);
    if (isMobile) {
      card.setAttribute("aria-hidden", String(!isActive));
    } else {
      card.removeAttribute("aria-hidden");
    }
  });
}

tariffTabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveMobileTariff(button.dataset.tariffTab || "standard"));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...tariffTabButtons];
    const currentIndex = tabs.indexOf(button);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    setActiveMobileTariff(tabs[nextIndex].dataset.tariffTab || "standard", true);
  });
});

setActiveMobileTariff("standard");
mobileViewport.addEventListener?.("change", () => {
  const activeTab = [...tariffTabButtons].find((button) => button.getAttribute("aria-selected") === "true");
  setActiveMobileTariff(activeTab?.dataset.tariffTab || "standard");
  setMobileDockState();
});

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
  setMobileDockState();
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", setHeaderState);

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.classList.toggle("is-open", !isOpen);
  nav?.classList.toggle("is-open", !isOpen);
  setMobileDockState();
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.classList.remove("is-open");
    nav.classList.remove("is-open");
    setMobileDockState();
  }
});

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -70px 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".faq-list details").forEach((details) => {
  const summary = details.querySelector("summary");
  if (!summary || prefersReducedMotion) return;

  let animation = null;
  let isClosing = false;
  let isExpanding = false;

  const finishAnimation = (isOpen) => {
    details.open = isOpen;
    animation = null;
    isClosing = false;
    isExpanding = false;
    details.style.height = "";
    details.style.overflow = "";
  };

  const expand = () => {
    const startHeight = `${details.offsetHeight}px`;
    const endHeight = `${details.scrollHeight}px`;

    animation?.cancel();
    isExpanding = true;
    animation = details.animate(
      { height: [startHeight, endHeight] },
      { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
    animation.onfinish = () => finishAnimation(true);
    animation.oncancel = () => {
      isExpanding = false;
    };
  };

  const open = () => {
    details.style.height = `${details.offsetHeight}px`;
    details.open = true;
    window.requestAnimationFrame(expand);
  };

  const close = () => {
    const startHeight = `${details.offsetHeight}px`;
    const endHeight = `${summary.offsetHeight}px`;

    animation?.cancel();
    isClosing = true;
    animation = details.animate(
      { height: [startHeight, endHeight] },
      { duration: 260, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
    );
    animation.onfinish = () => finishAnimation(false);
    animation.oncancel = () => {
      isClosing = false;
    };
  };

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    details.style.overflow = "hidden";

    if (isClosing || !details.open) {
      open();
    } else if (isExpanding || details.open) {
      close();
    }
  });
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 4200);
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const channel = String(data.get("channel") || "Telegram").trim();
  const experience = String(data.get("experience") || "").trim();

  if (!name || !phone) {
    if (formError) formError.textContent = "Заполните имя и телефон, чтобы мы могли связаться с вами.";
    if (formSuccess) formSuccess.textContent = "";
    const firstInvalid = form.querySelector(!name ? "[name='name']" : "[name='phone']");
    firstInvalid?.focus();
    return;
  }

  if (formError) formError.textContent = "";
  if (formSuccess) formSuccess.textContent = "";
  if (submitButton) submitButton.disabled = true;
  if (submitLabel) submitLabel.textContent = "Отправляем...";

  const payload = {
    name,
    phone,
    channel,
    experience: experience || "Не указан",
    source: window.location.href,
    submittedAt: new Date().toLocaleString("ru-RU"),
    _subject: "Новая бронь на обучение брокеров",
    _template: "table",
    _captcha: "false"
  };

  fetch(leadEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then((response) => {
      if (!response.ok) throw new Error("Lead request failed");
      form.reset();
      if (channelSelect) channelSelect.value = "Telegram";
      form.classList.add("is-submitted");
      form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.disabled = true;
      });
      if (submitLabel) submitLabel.textContent = "Спасибо за отклик";
      if (formSuccess) formSuccess.textContent = "Заявка отправлена. Мы свяжемся с вами в ближайшее время.";
      showToast("Заявка отправлена.");
    })
    .catch(() => {
      if (submitButton) submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = "Оставить заявку";
      if (formError) formError.textContent = "Не получилось отправить заявку. Попробуйте еще раз или напишите в Telegram.";
    });
});

channelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const channel = button.dataset.channel;
    if (channelSelect && channel) {
      channelSelect.value = channel;
    }
    document.querySelector("#application")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    window.setTimeout(() => {
      form?.querySelector("[name='name']")?.focus();
    }, prefersReducedMotion ? 0 : 420);
  });
});

function openVideoModal(trigger) {
  if (!videoModal || !modalVideo) return;
  const source = trigger.dataset.videoSrc;
  if (!source) return;

  lastVideoTrigger = trigger;
  modalVideo.src = source;
  modalVideo.poster = trigger.dataset.videoPoster || "";
  if (modalVideoTitle) modalVideoTitle.textContent = trigger.dataset.videoTitle || "Видео";
  if (modalDialog) modalDialog.setAttribute("aria-label", trigger.dataset.videoTitle || "Видео о практике обучения");
  videoModal.classList.add("is-open");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  videoModal.querySelector("button")?.focus();
  modalVideo?.play().catch(() => {});
}

function closeVideoModal() {
  if (!videoModal) return;
  videoModal.classList.remove("is-open");
  videoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (modalVideo) {
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.removeAttribute("src");
    modalVideo.load();
  }
  lastVideoTrigger?.focus();
}

videoButtons.forEach((button) => {
  button.addEventListener("click", () => openVideoModal(button));
});
videoCloseButtons.forEach((button) => button.addEventListener("click", closeVideoModal));

const paymentModal = document.querySelector("[data-payment-modal]");
const paymentDialog = paymentModal?.querySelector("[data-payment-dialog]");
const paymentForm = paymentModal?.querySelector("[data-payment-form]");
const paymentOpenButtons = document.querySelectorAll("[data-payment-open]");
const paymentCloseButtons = paymentModal?.querySelectorAll("[data-payment-close]") || [];
const paymentPlanInput = paymentForm?.querySelector("[data-payment-plan]");
const paymentPlanName = paymentModal?.querySelector("[data-payment-plan-name]");
const paymentTotal = paymentForm?.querySelector("[data-payment-total]");
const paymentEmail = paymentForm?.querySelector('input[name="email"]');
const paymentPhone = paymentForm?.querySelector('input[name="phone"]');
const paymentConsent = paymentForm?.querySelector('input[name="legalConsent"]');
const paymentSubmit = paymentForm?.querySelector("[data-payment-submit]");
const paymentLabel = paymentForm?.querySelector("[data-payment-label]");
const paymentStatus = paymentForm?.querySelector("[data-payment-status]");
let lastPaymentTrigger = null;

const paymentPlans = {
  economy: { name: "Эконом", price: 3000 },
  standard: { name: "Стандарт", price: 5000 },
  premium: { name: "Премиум", price: 15000 }
};
const rubles = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

function setPaymentStatus(message, state = "") {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
  paymentStatus.dataset.state = state;
}

function setPaymentPlan(planKey) {
  const selected = paymentPlans[planKey] || paymentPlans.economy;
  const safePlanKey = paymentPlans[planKey] ? planKey : "economy";
  if (paymentPlanInput) paymentPlanInput.value = safePlanKey;
  if (paymentPlanName) paymentPlanName.textContent = selected.name;
  if (paymentTotal) paymentTotal.textContent = `${rubles.format(selected.price)} ₽`;
  if (paymentLabel) paymentLabel.textContent = `Перейти к оплате · ${rubles.format(selected.price)} ₽`;
  setPaymentStatus();
}

function closePaymentModal() {
  if (!paymentModal) return;
  paymentModal.classList.remove("is-open");
  paymentModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("payment-modal-open");
  lastPaymentTrigger?.focus();
}

function openPaymentModal(trigger) {
  if (!paymentModal) return;
  lastPaymentTrigger = trigger;
  setPaymentPlan(trigger.dataset.plan || "economy");
  paymentModal.classList.add("is-open");
  paymentModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("payment-modal-open");
  window.setTimeout(() => paymentEmail?.focus(), prefersReducedMotion ? 0 : 180);
}

paymentOpenButtons.forEach((button) => {
  button.addEventListener("click", () => openPaymentModal(button));
});
paymentCloseButtons.forEach((button) => button.addEventListener("click", closePaymentModal));

paymentDialog?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePaymentModal();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [...paymentDialog.querySelectorAll("button, input, a")].filter(
    (item) => !item.hasAttribute("disabled") && item.getAttribute("tabindex") !== "-1" && item.type !== "hidden"
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

paymentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = String(paymentEmail?.value || "").trim();
  const phone = String(paymentPhone?.value || "").trim();
  const phoneDigits = phone.replace(/\D/g, "");

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setPaymentStatus("Укажите корректную почту для получения чека.", "error");
    paymentEmail?.focus();
    return;
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    setPaymentStatus("Укажите телефон с кодом страны.", "error");
    paymentPhone?.focus();
    return;
  }
  if (!paymentConsent?.checked) {
    setPaymentStatus("Подтвердите согласие с условиями оплаты и обработки данных.", "error");
    paymentConsent?.focus();
    return;
  }
  if (!paymentApiBase) {
    setPaymentStatus("Платежный сервис еще не подключен. Напишите нам в Telegram.", "error");
    return;
  }

  const selected = paymentPlans[paymentPlanInput?.value] || paymentPlans.economy;
  if (paymentSubmit) paymentSubmit.disabled = true;
  if (paymentLabel) paymentLabel.textContent = "Создаем платеж...";
  setPaymentStatus("Соединяемся с защищенной платежной системой Т-Банка.", "loading");

  try {
    const response = await fetch(`${paymentApiBase}/api/payment/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        plan: paymentPlanInput?.value || "economy",
        email,
        phone
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.paymentUrl) {
      throw new Error(result.error || "Не удалось создать платеж.");
    }

    localStorage.setItem("victoryRealtyPaymentId", result.paymentId || "");
    localStorage.setItem("victoryRealtyOrderId", result.orderId || "");
    setPaymentStatus("Платеж создан. Открываем защищенную страницу банка.", "success");
    window.location.assign(result.paymentUrl);
  } catch (error) {
    if (paymentSubmit) paymentSubmit.disabled = false;
    if (paymentLabel) paymentLabel.textContent = `Повторить · ${rubles.format(selected.price)} ₽`;
    setPaymentStatus(error.message || "Не удалось создать платеж. Попробуйте еще раз.", "error");
  }
});

const installmentModal = document.querySelector("[data-installment-modal]");
const installmentDialog = installmentModal?.querySelector("[data-installment-dialog]");
const installmentOpenButtons = document.querySelectorAll("[data-installment-open]");
const installmentCloseButtons = installmentModal?.querySelectorAll("[data-installment-close]") || [];
const installmentPlanName = installmentModal?.querySelector("[data-installment-plan-name]");
const installmentTotal = installmentModal?.querySelector("[data-installment-total]");
const installmentMonthly = installmentModal?.querySelector("[data-installment-monthly]");
const installmentTermInputs = installmentModal?.querySelectorAll('input[name="installmentTerm"]') || [];
const tbankButtonHost = installmentModal?.querySelector("[data-tbank-button-host]");
const installmentFallback = installmentModal?.querySelector("[data-tbank-fallback]");
const installmentShopId = "71b6f5de-46e6-4695-b4cd-bdeada85e12a";
const installmentShowcaseId = "775b4264-5a84-4296-9493-ec699aa1999e";
let activeInstallmentPlan = "standard";
let lastInstallmentTrigger = null;
let installmentFallbackTimer = null;

function getSelectedInstallmentTerm() {
  return [...installmentTermInputs].find((input) => input.checked) || installmentTermInputs[0];
}

function renderInstallmentButton() {
  if (!tbankButtonHost) return;

  const selectedPlan = paymentPlans[activeInstallmentPlan] || paymentPlans.standard;
  const selectedTerm = getSelectedInstallmentTerm();
  const months = Number(selectedTerm?.dataset.months || 3);
  const promoCode = selectedTerm?.value || "installment_0_0_3_5";
  const monthly = Math.ceil(selectedPlan.price / months);
  const productName = `Обучение профессии брокера — тариф ${selectedPlan.name}`;
  const productData = new URLSearchParams({
    "items.0.name": productName,
    "items.0.price": String(selectedPlan.price),
    "items.0.quantity": "1",
    sum: String(selectedPlan.price)
  });

  if (installmentMonthly) installmentMonthly.textContent = rubles.format(monthly);
  if (installmentFallback) installmentFallback.hidden = true;

  const bankButton = document.createElement("tinkoff-create-button");
  bankButton.setAttribute("size", "M");
  bankButton.setAttribute("subtext", `≈ ${rubles.format(monthly)} ₽ в месяц`);
  bankButton.setAttribute("shopId", installmentShopId);
  bankButton.setAttribute("showcaseId", installmentShowcaseId);
  bankButton.setAttribute("ui-data", "view=newTab");
  bankButton.setAttribute("payment-data", `${productData.toString()}&promoCode=${promoCode}`);
  tbankButtonHost.replaceChildren(bankButton);

  window.clearTimeout(installmentFallbackTimer);
  installmentFallbackTimer = window.setTimeout(() => {
    if (!window.customElements?.get("tinkoff-create-button") && installmentFallback) {
      installmentFallback.hidden = false;
    }
  }, 6000);
}

function setInstallmentPlan(planKey) {
  activeInstallmentPlan = planKey === "premium" ? "premium" : "standard";
  const selectedPlan = paymentPlans[activeInstallmentPlan];
  if (installmentPlanName) installmentPlanName.textContent = selectedPlan.name;
  if (installmentTotal) installmentTotal.textContent = `${rubles.format(selectedPlan.price)} ₽`;
  renderInstallmentButton();
}

function closeInstallmentModal() {
  if (!installmentModal) return;
  installmentModal.classList.remove("is-open");
  installmentModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("payment-modal-open");
  lastInstallmentTrigger?.focus();
}

function openInstallmentModal(trigger) {
  if (!installmentModal) return;
  lastInstallmentTrigger = trigger;
  setInstallmentPlan(trigger.dataset.plan || "standard");
  installmentModal.classList.add("is-open");
  installmentModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("payment-modal-open");
  window.setTimeout(() => getSelectedInstallmentTerm()?.focus(), prefersReducedMotion ? 0 : 180);
}

installmentOpenButtons.forEach((button) => {
  button.addEventListener("click", () => openInstallmentModal(button));
});
installmentCloseButtons.forEach((button) => button.addEventListener("click", closeInstallmentModal));
installmentTermInputs.forEach((input) => input.addEventListener("change", renderInstallmentButton));

installmentDialog?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeInstallmentModal();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [...installmentDialog.querySelectorAll("button, input, a, tinkoff-create-button")].filter(
    (item) => !item.hasAttribute("disabled") && item.getAttribute("tabindex") !== "-1" && item.type !== "hidden"
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

window.customElements?.whenDefined("tinkoff-create-button").then(() => {
  if (installmentFallback) installmentFallback.hidden = true;
});

const paymentResult = new URLSearchParams(window.location.search).get("payment");
if (paymentResult === "success") {
  showToast("Оплата прошла. Чек придет на указанную почту.");
} else if (paymentResult === "failed") {
  showToast("Оплата не завершена. Можно повторить или выбрать другой способ.");
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (installmentModal?.classList.contains("is-open")) {
    closeInstallmentModal();
  } else if (paymentModal?.classList.contains("is-open")) {
    closePaymentModal();
  } else if (videoModal?.classList.contains("is-open")) {
    closeVideoModal();
  }
});
