document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY = 'uploadedProfilePic';

    if (fileInput && profilePic) {

        const savedPicUrl = localStorage.getItem(STORAGE_KEY);
        if (savedPicUrl) {
            profilePic.style.backgroundImage = `url('${savedPicUrl}')`;
        }

        fileInput.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    const newPicUrl = e.target.result;

                    profilePic.style.backgroundImage = `url('${newPicUrl}')`;

                    localStorage.setItem(STORAGE_KEY, newPicUrl);
                };

                reader.readAsDataURL(event.target.files[0]);
            }
        });
    } else {
        console.error("Profile upload element not found.");
    }
});
