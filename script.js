//Typing Animation

var typed = new Typed(".typing",{
    strings:["Web Designer","Web Developer","Graphic Designer"],
    typeSpeed:100,
    BackSpeed:60,
    loop:true
})

//Toggle Navigation Option
document.addEventListener('DOMContentLoaded', function() {
    const navToggler = document.querySelector('.nav-toggler');
    const nav = document.querySelector('.nav');
    const body = document.querySelector('body');

    navToggler.addEventListener('click', function() {
        nav.classList.toggle('show');
        navToggler.classList.toggle('active');
        body.classList.toggle('blur-background');
    });
});

//For Screen Swithching Effect
function showScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function (screen) {
        screen.classList.remove('active');
    });

    var selectedScreen = document.getElementById(screenId);
    if (selectedScreen) {
        selectedScreen.classList.add('active');
    }
}

//Download Button Animation
document.getElementById('downloadLink').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default anchor behavior
    // Show the confirmation prompt for file download
    Swal.fire({
        title: "Are you sure?",
        text: "This action will download the file.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, download it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Your file download logic goes here
            const link = document.createElement('a');
            link.href = 'https://drive.google.com/uc?export=download&id=10xMbIc6DT6Afkx2o_ooZZ-Y-M19bGgOb'; // Download Link
            link.download = 'Abhishek_Panda.pdf'; // Specify the desired filename

            // Listen for the click event on the download link
            link.addEventListener('click', function () {
                // Simulate file download success with SweetAlert animation
                Swal.fire({
                    title: "Good job!",
                    text: "File Download Initiated!",
                    icon: "success",
                    showConfirmButton: false, // Hide the default confirmation button
                    timer: 2000 // Auto close after 2 seconds
                });
            });

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Display an error message if the user cancels the download
            Swal.fire({
                title: "Cancelled",
                text: "File download cancelled.",
                icon: "error"
            });
        }
    });
});