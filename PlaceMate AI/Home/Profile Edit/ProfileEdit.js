const editButtons = document.querySelectorAll(".edit-btn");

editButtons.forEach(button => {
    button.addEventListener("click", () => {
        alert("Edit functionality will be added here.");
    });
});

document.querySelector(".download-btn")
.addEventListener("click", () => {
    alert("Download Profile functionality will be added here.");
});