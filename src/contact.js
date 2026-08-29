document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const toastContainer = document.getElementById("toast-container");
  
  // Tắt bong bóng mặc định bằng tiếng Anh
  form.setAttribute("novalidate", "");
  
  function messageFor(field) {
    const v = field.validity;
    if (v.valueMissing) return "Vui lòng điền mục này.";
    if (v.typeMismatch) return "Email chưa đúng dạng, ví dụ: name@company.com";
    if (v.patternMismatch) return "Nhập 10 chữ số, bắt đầu bằng 0. Ví dụ: 0912345678";
    if (v.tooShort) return `Nội dung quá ngắn (ít nhất ${field.minLength} ký tự).`;
    return field.validationMessage;
  }
  
  function clearError(field) {
    field.removeAttribute("aria-invalid");
    const errorBox = field.parentElement.querySelector(".error-msg");
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.classList.add("hidden");
    }
  }
  
  function showError(field) {
    field.setAttribute("aria-invalid", "true");
    const errorBox = field.parentElement.querySelector(".error-msg");
    if (errorBox) {
      errorBox.textContent = messageFor(field);
      errorBox.classList.remove("hidden");
    }
  }
  
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "success" ? "border-success/50 text-success" : "border-danger/50 text-danger"}`;
    toast.innerHTML = `<div class="flex items-center gap-2">
      ${type === 'success' ? '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' : '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'}
      <span class="text-sm font-medium">${message}</span>
    </div>`;
    
    toastContainer.appendChild(toast);
    
    // trigger animation
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    
    // auto hide
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Clear error on input
  form.querySelectorAll(".field-input").forEach(field => {
    field.addEventListener("input", () => {
      if (field.hasAttribute("aria-invalid")) {
        clearError(field);
      }
      // Điểm tinh tế: tự bật lỗi tooShort khi người dùng gõ
      if (field.validity.tooShort) {
        showError(field);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isValid = true;
    let firstInvalidField = null;
    
    form.querySelectorAll(".field-input").forEach(field => {
      if (!field.checkValidity()) {
        showError(field);
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      } else {
        clearError(field);
      }
    });
    
    if (!isValid && firstInvalidField) {
      firstInvalidField.focus();
      showToast("Vui lòng kiểm tra lại thông tin.", "error");
      return;
    }
    
    // Success
    showToast("Gửi liên hệ thành công!");
    form.reset();
  });
  
  // Theme toggle logic just for this page
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const isLight = document.documentElement.classList.toggle("light");
      try {
        localStorage.setItem("cf-theme", isLight ? "light" : "dark");
      } catch (e) {}
      document.documentElement.classList.add("theme-anim");
      setTimeout(() => {
        document.documentElement.classList.remove("theme-anim");
      }, 400);
    });
  });

  // Mobile menu logic
  const menuButton = document.querySelector("#menu-button");
  const mobileMenu = document.querySelector("#mobile-menu");

  if (menuButton && mobileMenu) {
    const isMenuOpen = () => !mobileMenu.classList.contains("hidden");

    const closeMobileMenu = () => {
      mobileMenu.classList.add("hidden");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.focus();
    };

    menuButton.addEventListener("click", () => {
      const open = isMenuOpen();
      mobileMenu.classList.toggle("hidden", open);
      menuButton.setAttribute("aria-expanded", String(!open));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMenuOpen()) {
        closeMobileMenu();
      }
    });
  }
});
