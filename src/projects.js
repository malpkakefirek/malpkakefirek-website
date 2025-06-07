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
    if (Array.isArray(project.images) && project.images.includes("0.png")) {
        img.src = `images/projects/${key}/0.png`;
    } else {
        img.src = 'images/projects/missing.png';
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
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = updateUrlParam(window.location.href, 'page', i);
        pageLink.textContent = i;
        if (i === currentPage) {
            pageLink.className = 'active';
        }
        paginationDiv.appendChild(pageLink);
    }
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

    // Tags
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'project-tags';
    if (project.tags && project.tags.length) {
        project.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagsDiv.appendChild(tagSpan);
        });
    }

    // Media (images & videos)
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'project-media';
    mediaDiv.style.display = 'flex';
    mediaDiv.style.flexWrap = 'wrap';
    mediaDiv.style.gap = '1rem';

    // Use images and videos from the project object if available
    if (Array.isArray(project.images)) {
        project.images.forEach(imageName => {
            const img = new Image();
            img.src = `images/projects/${key}/${imageName}`;
            img.alt = project.title;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '150px';
            img.style.objectFit = 'cover';
            img.onerror = function() { this.style.display = 'none'; };
            mediaDiv.appendChild(img);
        });
    }

    if (Array.isArray(project.videos)) {
        project.videos.forEach(videoName => {
            const video = document.createElement('video');
            video.src = `images/projects/${key}/${videoName}`;
            video.controls = true;
            video.style.maxWidth = '200px';
            video.style.maxHeight = '150px';
            video.onerror = function() { this.remove(); };
            mediaDiv.appendChild(video);
        });
    }

    popup.appendChild(closeBtn);
    popup.appendChild(title);
    popup.appendChild(desc);
    popup.appendChild(mediaDiv);
    popup.appendChild(tagsDiv);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Close popup when clicking outside the popup area
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeProjectPopup();
        }
    });
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