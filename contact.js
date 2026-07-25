// ===============================
// CONTACT FORM - EMAILJS
// ===============================

(function () {
    emailjs.init("YOUR_PUBLIC_KEY");
})();

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (e) {

    e.preventDefault();

    emailjs.sendForm(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        this
    )

    .then(function () {

        alert("✅ Thank you! Your message has been sent successfully.");

        contactForm.reset();

    })

    .catch(function (error) {

        alert("❌ Message failed to send.");

        console.log(error);

    });

});
// FAQ Accordion

const questions = document.querySelectorAll(".faq-question");

questions.forEach(question => {

    question.addEventListener("click", () => {

        const answer = question.nextElementSibling;

        if(answer.style.display === "block"){

            answer.style.display = "none";

            question.querySelector("span").innerHTML = "+";

        }else{

            answer.style.display = "block";

            question.querySelector("span").innerHTML = "−";

        }

    });

});