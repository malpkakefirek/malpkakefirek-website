function titleCase(str) {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, function(match) {
    return match.toUpperCase();
  });
}

function beautifyFileName(filename) {
    // Remove the file extension
    const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "");

    // Replace underscores and hyphens with spaces
    const nameWithSpaces = nameWithoutExtension.replace(/[_-]/g, " ");

    // Capitalize the first letter of each word
    const beautifiedName = titleCase(nameWithSpaces);

    return beautifiedName;
}

function filterProjectsByTags(projects, tags) {
    if (!tags || tags.length === 0) return projects;
    const filtered = {};
    for (const [key, project] of Object.entries(projects)) {
        if (project.tags && tags.every(tag => project.tags.includes(tag))) {
            filtered[key] = project;
        }
    }
    return filtered;
}

function createProjectDiv(project, key) {
    const div = document.createElement('div');
    div.className = 'project-item';

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = project.title;

    const img = document.createElement('img');
    img.className = 'project-thumbnail';
    if (Array.isArray(project.images) && project.images.includes("thumb.png")) {
        img.src = `media/projects/${key}/thumb.png`;
    } else {
        img.src = 'media/projects/missing.png';
    }
    img.alt = project.title;

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'project-tags';
    if (project.tags && project.tags.length) {
        project.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.classList.add('tag', `tag-${tag}`);
            tagSpan.textContent = tag;
            tagsDiv.appendChild(tagSpan);
        });
    }

    div.appendChild(title);
    div.appendChild(img);
    div.appendChild(tagsDiv);

    // Add click event to show popup
    div.addEventListener('click', () => showProjectPopup(project, key));

    return div;
}

function createPagination(totalPages, currentPage) {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';

    // Left arrow
    const leftArrow = document.createElement('a');
    leftArrow.innerHTML = '←';
    leftArrow.href = updateUrlParam(window.location.href, 'page', Math.max(1, currentPage - 1));
    leftArrow.className = 'arrow left-arrow';
    if (currentPage === 1) {
        leftArrow.classList.add('disabled');
        leftArrow.href = '#';
    }
    paginationDiv.appendChild(leftArrow);

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = updateUrlParam(window.location.href, 'page', i);
        pageLink.textContent = i;
        pageLink.className = 'page-number';
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        paginationDiv.appendChild(pageLink);
    }

    // Right arrow
    const rightArrow = document.createElement('a');
    rightArrow.innerHTML = '→';
    rightArrow.href = updateUrlParam(window.location.href, 'page', Math.min(totalPages, currentPage + 1));
    rightArrow.className = 'arrow right-arrow';
    if (currentPage === totalPages) {
        rightArrow.classList.add('disabled');
        rightArrow.href = '#';
    }
    paginationDiv.appendChild(rightArrow);

    return paginationDiv;
}

function updateUrlParam(url, param, value) {
    const u = new URL(url);
    u.searchParams.set(param, value);
    return u.toString();
}

function renderProjects(projects, tags, page) {
    const projectList = document.getElementById('project-list');
    if (!projectList) return;

    const filteredObj = filterProjectsByTags(projects, tags);
    const filteredKeys = Object.keys(filteredObj);
    const projectsPerPage = 12;
    const totalPages = Math.ceil(filteredKeys.length / projectsPerPage);
    const currentPage = Math.max(1, parseInt(page) || 1);
    const start = (currentPage - 1) * projectsPerPage;
    const end = start + projectsPerPage;
    const pageProjects = filteredKeys.slice(start, end).map(key => filteredObj[key]);

    if ((currentPage > totalPages || currentPage < 1) && totalPages > 0) {
        window.location.href = updateUrlParam(window.location.href, 'page', 1);
        return;
    }

    let grid = document.getElementById('project-grid');
    if (!grid) return;

    // Clear existing grid content if there are any projects
    if (pageProjects.length > 0) {
        grid.innerHTML = '';
    } else {
        return;
    }

    filteredKeys.slice(start, end).forEach(key => {
        grid.appendChild(createProjectDiv(filteredObj[key], key));
    });

    projectList.appendChild(grid);

    if (totalPages > 1) {
        projectList.appendChild(createPagination(totalPages, currentPage));
    }
}

// --- Popup logic ---
let slideIndex;

function showProjectPopup(project, key) {
    // Remove existing popup if any
    closeProjectPopup();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'project-popup-overlay';

    // Popup container
    const popup = document.createElement('div');
    popup.className = 'project-popup';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.className = 'popup-close-btn';
    closeBtn.addEventListener('click', closeProjectPopup);

    // Title
    const title = document.createElement('h2');
    title.className = 'project-popup-title';
    title.textContent = project.title;

    // Description
    const desc = document.createElement('p');
    desc.className = 'project-description';
    desc.textContent = project.description || 'No description provided :/';

    // Member count
    const memberCount = document.createElement('p');
    memberCount.className = 'project-member-count';
    memberCount.textContent = `Made by ${(project.members === 1 || project.members === undefined) ? "myself" : `a team of ${project.members} people`}`;

    // Tags
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'project-tags';
    if (project.tags && project.tags.length) {
        project.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.classList.add(`tag-${tag}`);
            tagSpan.textContent = tag;
            tagsDiv.appendChild(tagSpan);
        });
    }

    // Media (images & videos)
    let mediaDiv;
    if ((project.images && project.images.length > 0) || (project.videos && project.videos.length > 0)) {
        project.images = (project.images || []).filter(imageName => imageName !== 'thumb.png');
        
        mediaDiv = document.createElement('div');
        mediaDiv.className = 'project-media';
        mediaDiv.innerHTML = `
            <!-- Container for the image gallery -->
            <div class="slideshow-container">

                <!-- Full-width images with number text loop -->
                ${project.videos ? project.videos.map((videoName, index) => `<div class="mySlides">
                    <div class="numbertext">${index + 1} / ${project.videos.length + project.images.length}</div>
                    <video controls style="width:100%; max-height: 32rem;">
                        <source src="media/projects/${key}/${videoName}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>`).join('') : ''}
                ${project.images ? project.images.map((imageName, index) => `<div class="mySlides">
                    <div class="numbertext">${index + 1 + project.videos.length} / ${project.videos.length + project.images.length}</div>
                    <div style="display: flex; justify-content: center; align-items: center; height: 32rem; width: 100%;">
                        <img src="media/projects/${key}/${imageName}" alt="${beautifyFileName(imageName)}" style="max-width: 100%; max-height: 100%;">
                    </div>
                </div>`).join('') : ''}

                <!-- Next and previous buttons -->
                <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                <a class="next" onclick="plusSlides(1)">&#10095;</a>
            </div>

            <!-- Image text -->
            <div class="caption-container">
                <p id="caption"></p>
            </div>

            <!-- Thumbnail images -->
            <div class="row">
                ${project.videos ? project.videos.map((videoName, index) => `<div class="column">
                    <!-- Invisible overlay to capture clicks since pointer-events are disabled on the video -->
                    <div class="demo cursor" onclick="currentSlide(${index + 1})" data-alt="${beautifyFileName(videoName)}" style="position: relative;">
                        <video src="media/projects/${key}/${videoName}#t=0.1" preload="metadata" style="width:100%; height: 4rem; object-fit: cover; pointer-events: none;" muted playsinline></video>
                        
                        <!-- Centered Play Button SVG -->
                        <svg viewBox="0 0 24 24" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 32px; height: 32px; fill: white; pointer-events: none; filter: drop-shadow(0px 1px 3px rgba(0,0,0,0.7));">
                            <path d="M8 5v14l11-7z"></path>
                        </svg>
                    </div>
                </div>`).join('') : ''}
                ${project.images ? project.images.map((imageName, index) => `<div class="column">
                    <img class="demo cursor" src="media/projects/${key}/${imageName}" style="width:100%" onclick="currentSlide(${index + 1 + project.videos.length})" alt="${beautifyFileName(imageName)}">
                </div>`).join('') : ''}
            </div>
        `;
    }




    // Use images and videos from the project object if available
    // if (Array.isArray(project.images)) {
    //     project.images.forEach(imageName => {
    //         const img = new Image();
    //         img.src = `media/projects/${key}/${imageName}`;
    //         img.alt = project.title;
    //         img.style.maxWidth = '200px';
    //         img.style.maxHeight = '150px';
    //         img.style.objectFit = 'cover';
    //         img.onerror = function() { this.style.display = 'none'; };
    //         mediaDiv.appendChild(img);
    //     });
    // }

    // if (Array.isArray(project.videos)) {
    //     project.videos.forEach(videoName => {
    //         const video = document.createElement('video');
    //         video.src = `media/projects/${key}/${videoName}`;
    //         video.controls = true;
    //         video.style.maxWidth = '200px';
    //         video.style.maxHeight = '150px';
    //         video.onerror = function() { this.remove(); };
    //         mediaDiv.appendChild(video);
    //     });
    // }

    popup.appendChild(closeBtn);
    popup.appendChild(title);
    popup.appendChild(desc);
    if (mediaDiv) {
        popup.appendChild(mediaDiv);
    }
    popup.appendChild(memberCount);
    popup.appendChild(tagsDiv);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    if (mediaDiv) {
        slideIndex = 1;
        showSlides(slideIndex);
    }

    // Close popup when clicking outside the popup area
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeProjectPopup();
        }
    });
}

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("demo");
    let captionText = document.getElementById("caption");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
    if (dots[slideIndex-1].alt !== undefined) {
        captionText.innerHTML = dots[slideIndex-1].alt;
    } else if (dots[slideIndex-1].getAttribute('data-alt') !== null) {
        captionText.innerHTML = dots[slideIndex-1].getAttribute('data-alt');
    } else {
        captionText.innerHTML = '';
    }

    // Target the specific thumbnail that just became active
    const activeThumbnail = document.querySelectorAll('.demo')[slideIndex - 1]; 

    // Scroll it into the center of the view
    if (activeThumbnail) {
        activeThumbnail.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
        });
    }
}

function closeProjectPopup() {
    const overlay = document.querySelector('.project-popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}


// Load projects from projects.json
var projects = {};
fetch("projects.json")
    .then(response => response.json())
    .then(data => {
        projects = data;

        // Get URL parameters
        const url = new URL(window.location.href);

        var tags = url.searchParams.get("tags");
        if (tags) {
            tags = tags.split(",");
        }
        var page = url.searchParams.get("page");

        console.log(tags);
        console.log(page);

        // Render projects based on tags and page
        renderProjects(projects, tags, page);
    });