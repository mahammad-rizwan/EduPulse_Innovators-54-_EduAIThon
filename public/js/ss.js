// User dropdown toggle
const userProfile = document.querySelector(".user-profile");
const dropdownMenu = document.querySelector(".dropdown-menu");

userProfile.addEventListener("click", () => {
  dropdownMenu.classList.toggle("active");
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (!userProfile.contains(event.target)) {
    dropdownMenu.classList.remove("active");
  }
});
