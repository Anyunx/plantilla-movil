document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'AIzaSyCXfw5rNG-Wju93X-QfFFoDnDm98tefQIQ';  // Reemplaza 'apikey' con tu propia API Key de YouTube
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const videoList = document.getElementById('video-list');
    const credits = document.getElementById("credits");

    let videoQueue = [];
    let creditos = 10;

    if (creditos) {
        credits.textContent = creditos;
    }

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = searchInput.value;
        searchYouTube(query);
    });

    function searchYouTube(query) {
        console.log(`Searching for: ${query}`);
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(query)}&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log('Search API data:', data);  // Verifica si se están recibiendo datos de búsqueda
                if (data && data.items) {
                    const videoIds = data.items.map(item => item.id.videoId).join(',');
                    fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${videoIds}&key=${API_KEY}`)
                        .then(response => response.json())
                        .then(detailsData => {
                            console.log('Details API data:', detailsData);  // Verifica si se están recibiendo detalles de los videos
                            const embeddableVideos = data.items.filter((item, index) => {
                                const details = detailsData.items[index];
                                return details && !details.contentDetails.regionRestriction && details.status.embeddable;
                            });
                            console.log('Embeddable videos:', embeddableVideos);  // Verifica los videos embebibles filtrados
                            displayResults(embeddableVideos);
                        })
                        .catch(error => console.error('Error fetching video details:', error));
                } else {
                    console.error('No videos found');
                    videoList.innerHTML = '<li>No videos found</li>';
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function displayResults(videos) {
        console.log('Displaying videos:', videos);  // Verifica los videos que se van a mostrar en el DOM
        videoList.innerHTML = '';
        videos.forEach(video => {
            const videoItem = document.createElement('li');
            videoItem.classList.add('video-item');
            videoItem.innerHTML = `
                <div class="video-result">
                    <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
                    <span class="video-title">${video.snippet.title}</span>
                </div>
            `;
            videoItem.addEventListener('click', () => addVideoToQueue(video));
            videoList.appendChild(videoItem);
        });
    }
    // Manejador para el formulario de almacenamiento en localStorage
    const storageForm = document.getElementById("storage-form");
    const storageInput = document.getElementById("storage-input");
    const idEstacion = document.getElementById("connected");

    // Verificar si hay un valor en localStorage al cargar la página
    const estacionId = localStorage.getItem("estacionId");
    if (estacionId) {
        storageInput.value = estacionId;
        idEstacion.textContent = estacionId;
    }

    function addVideoToQueue(video) {
        const videoItem = document.createElement('li');
        videoItem.classList.add('video-item');
        console.log(video.id.videoId);
        console.log(video.snippet.thumbnails.default.url);
        console.log(video.snippet.title);
        videoItem.dataset.videoId = video.id.videoId; // Store videoId for easy removal later
        
        const videoSelected = {
            idEstacion: estacionId,
            idVideo: video.id.videoId,
            thumbnails: video.snippet.thumbnails.default.url,
            title: video.snippet.title
        }
        console.log(videoSelected);
        if (creditos > 0){
            videoQueue.push(videoSelected);
            console.log(videoQueue);
            creditos -= 1;
            alert(`Creditos actuales ${creditos}`);
            credits.textContent = creditos;
        }
        else{
            alert("No tienes creditos suficientes, recargue su saldo");
        }

        if (videoQueue.length === 1) {
            /* playVideo(video); */
            console.log("video agregado");
        }
    }

    storageForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const valueToStore = storageInput.value;
        localStorage.setItem("estacionId", valueToStore);
        console.log("Guardado en localStorage:", valueToStore);
        alert(`Conectado correctamente a ${valueToStore}`);
        // Asignar el valor guardado en localStorage al elemento con id "connected"
        idEstacion.textContent = valueToStore;
    });

    // Cargar YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

});
