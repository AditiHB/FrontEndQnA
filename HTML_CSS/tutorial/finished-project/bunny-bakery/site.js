// On small screens the menu is a pop-over. Close it again after a link inside it is used.
const nav = document.getElementById("site-nav");

nav.addEventListener("click", (event) => {
  if (event.target.closest("a") && nav.matches(":popover-open")) {
    nav.hidePopover();
  }
});
