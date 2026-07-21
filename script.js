(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const mainNav = document.querySelector("#main-nav");
  const menuLabel = menuButton?.querySelector(".sr-only");

  const setMenu = (open) => {
    if (!header || !menuButton) return;
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    if (menuLabel) menuLabel.textContent = open ? "Закрыть меню" : "Открыть меню";
  };

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setMenu(false);
  });

  const revealItems = [...document.querySelectorAll(".reveal")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const animatedDetails = [
    ...document.querySelectorAll(".system-list details, .faq-list details"),
  ];
  const detailsAnimations = new WeakMap();

  const setDetailsState = (detail, shouldOpen) => {
    const summary = detail.querySelector("summary");
    if (!summary) return;

    if (reduceMotion || typeof detail.animate !== "function") {
      detail.open = shouldOpen;
      return;
    }

    const activeAnimation = detailsAnimations.get(detail);
    const startHeight = detail.getBoundingClientRect().height;
    activeAnimation?.cancel();

    if (shouldOpen) {
      detail.open = true;
      detail.style.height = "auto";
    }

    const endHeight = shouldOpen
      ? detail.getBoundingClientRect().height
      : summary.getBoundingClientRect().height;

    detail.style.height = `${startHeight}px`;
    detail.classList.add("is-animating");
    detail.dataset.animatingTo = shouldOpen ? "open" : "closed";

    const animation = detail.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      {
        duration: shouldOpen ? 360 : 280,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      }
    );

    detailsAnimations.set(detail, animation);
    animation.addEventListener("finish", () => {
      if (!shouldOpen) detail.open = false;
      detail.style.height = "";
      detail.classList.remove("is-animating");
      delete detail.dataset.animatingTo;
      detailsAnimations.delete(detail);
    });
  };

  animatedDetails.forEach((detail) => {
    const summary = detail.querySelector("summary");
    summary?.addEventListener("click", (event) => {
      event.preventDefault();

      const currentTarget = detail.dataset.animatingTo;
      const shouldOpen = currentTarget ? currentTarget !== "open" : !detail.open;

      if (shouldOpen) {
        const group = detail.closest("[data-exclusive-details]");
        group?.querySelectorAll("details").forEach((other) => {
          if (other !== detail && (other.open || other.dataset.animatingTo === "open")) {
            setDetailsState(other, false);
          }
        });
      }

      setDetailsState(detail, shouldOpen);
    });
  });

  const toast = document.querySelector("[data-toast]");
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  };

  const form = document.querySelector("[data-lead-form]");

  if (form) {
    const nameInput = form.querySelector("[name='name']");
    const phoneInput = form.querySelector("[name='phone']");
    const errorMessage = form.querySelector("[data-form-error]");
    const successMessage = form.querySelector("[data-form-success]");
    const submitButton = form.querySelector("button[type='submit']");
    const submitLabel = form.querySelector("[data-submit-label]");

    const setInvalid = (input, invalid) => {
      input?.setAttribute("aria-invalid", String(invalid));
    };

    const clearFieldError = (event) => {
      setInvalid(event.currentTarget, false);
      if (errorMessage) errorMessage.textContent = "";
    };

    nameInput?.addEventListener("input", clearFieldError);
    phoneInput?.addEventListener("input", clearFieldError);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = nameInput?.value.trim() || "";
      const phone = phoneInput?.value.trim() || "";
      const phoneDigits = phone.replace(/\D/g, "");
      const invalidName = name.length < 2;
      const invalidPhone = phoneDigits.length < 10;

      setInvalid(nameInput, invalidName);
      setInvalid(phoneInput, invalidPhone);
      if (successMessage) successMessage.textContent = "";

      if (invalidName || invalidPhone) {
        if (errorMessage) {
          errorMessage.textContent = invalidName
            ? "Укажите имя, чтобы мы знали, как к вам обращаться."
            : "Проверьте номер телефона: нужно не меньше 10 цифр.";
        }
        (invalidName ? nameInput : phoneInput)?.focus();
        return;
      }

      if (errorMessage) errorMessage.textContent = "";
      if (submitButton) submitButton.disabled = true;
      if (submitLabel) submitLabel.textContent = "Отправляем…";

      const payload = new FormData(form);
      payload.append("_subject", "Новая заявка с сайта Денисова и партнеры");
      payload.append("_template", "table");
      payload.append("_captcha", "false");
      payload.append("source", window.location.href);

      try {
        const response = await fetch("https://formsubmit.co/ajax/batuninivan3@gmail.com", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: payload,
        });

        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        form.querySelectorAll("input, select, textarea").forEach((field) => {
          field.disabled = true;
        });
        if (submitLabel) submitLabel.textContent = "Спасибо за отклик";
        if (successMessage) {
          successMessage.textContent = "Заявка отправлена. С вами свяжутся по выбранному каналу.";
        }
        showToast("Заявка отправлена. Спасибо за отклик.");
      } catch (error) {
        if (submitButton) submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = "Повторить отправку";
        if (errorMessage) {
          errorMessage.textContent = "Не получилось отправить заявку. Попробуйте еще раз или напишите в Telegram.";
        }
      }
    });
  }

  const modal = document.querySelector("[data-video-modal]");
  const dialog = modal?.querySelector("[data-video-dialog]");
  const player = modal?.querySelector(".video-player");
  const modalTitle = modal?.querySelector("[data-video-title]");
  const closeButtons = modal?.querySelectorAll("[data-video-close]") || [];
  let lastVideoTrigger = null;

  const closeVideo = () => {
    if (!modal || !player) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    player.pause();
    player.removeAttribute("src");
    player.removeAttribute("poster");
    player.load();
    lastVideoTrigger?.focus();
  };

  document.querySelectorAll("[data-video-button]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!modal || !player) return;
      lastVideoTrigger = button;
      player.src = button.dataset.videoSrc || "";
      player.poster = button.dataset.videoPoster || "";
      if (modalTitle) modalTitle.textContent = button.dataset.videoTitle || "Видео";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      modal.querySelector(".video-close")?.focus();
      player.play().catch(() => {});
    });
  });

  closeButtons.forEach((button) => button.addEventListener("click", closeVideo));

  dialog?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("button, video[controls]")].filter(
      (item) => !item.hasAttribute("disabled")
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

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (modal?.classList.contains("is-open")) {
      closeVideo();
    } else if (header?.classList.contains("is-open")) {
      setMenu(false);
      menuButton?.focus();
    }
  });
})();
