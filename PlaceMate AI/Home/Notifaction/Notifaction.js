const notifications =
document.querySelectorAll(".notification-card");

notifications.forEach(card => {

    card.addEventListener("click", () => {

        card.classList.remove("unread");

        alert("Notification Opened");

    });

});