// Powers the click-to-zoom lightbox. Works automatically on any page that
// has thumbnail buttons (class="thumb") and the lightbox markup - nothing
// to configure.

document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll(".thumb").forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      if (!img) return;
      lightboxImg.src = img.src;
      lightbox.classList.add("open");
    });
  });

  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  });
});
