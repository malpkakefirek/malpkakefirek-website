function filterProjectsByTags(projects, tags) {
    if (!tags || tags.length === 0) return Object.values(projects);
    return Object.values(projects).filter(project =>
        tags.every(tag => project.tags && project.tags.includes(tag))
    );
}

function createProjectDiv(project) {
    const div = document.createElement('div');
    div.className = 'project-item';

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = project.title;

    const img = document.createElement('img');
    img.className = 'project-thumbnail';
    img.src = `images/projects/${project.id}/0.png`;
    img.onerror = function() {
        this.onerror = null;
        this.src = 'images/projects/missing.png';
    };
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
    div.addEventListener('click', () => showProjectPopup(project));

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

    const filtered = filterProjectsByTags(projects, tags);
    const projectsPerPage = 20;
    const totalPages = Math.ceil(filtered.length / projectsPerPage);
    const currentPage = Math.max(1, parseInt(page) || 1);
    const start = (currentPage - 1) * projectsPerPage;
    const end = start + projectsPerPage;
    const pageProjects = filtered.slice(start, end);

    let grid = document.getElementById('project-grid');
    if (!grid) return;

    // Clear existing grid content if there are any projects
    if (filtered.length > 0) {
        grid.innerHTML = '';
    } else {
        return;
    }

    pageProjects.forEach(project => {
        grid.appendChild(createProjectDiv(project));
    });

    projectList.appendChild(grid);

    if (totalPages > 1) {
        projectList.appendChild(createPagination(totalPages, currentPage));
    }
}

// --- Popup logic ---

function showProjectPopup(project) {
    // Remove existing popup if any
    closeProjectPopup();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'project-popup-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.zIndex = 10000;
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // Popup container
    const popup = document.createElement('div');
    popup.className = 'project-popup';
    popup.style.background = '#fff';
    popup.style.padding = '2rem';
    popup.style.borderRadius = '8px';
    popup.style.maxWidth = '800px';
    popup.style.maxHeight = '90vh';
    popup.style.overflowY = 'auto';
    popup.style.position = 'relative';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.className = 'popup-close-btn';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '1rem';
    closeBtn.style.right = '1rem';
    closeBtn.style.fontSize = '1.5rem';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', closeProjectPopup);

    // Title
    const title = document.createElement('h2');
    title.textContent = project.title;

    // Description
    const desc = document.createElement('p');
    desc.textContent = project.description || '';

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

    // Try to load images and videos from images/projects/{project.id}/
    // We'll try 0.png, 1.png, ..., 9.png and 0.mp4, 1.mp4, ..., 9.mp4
    for (let i = 0; i < 10; i++) {
        // Image
        const img = new Image();
        img.src = `images/projects/${project.id}/${i}.png`;
        img.alt = project.title;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '150px';
        img.style.objectFit = 'cover';
        img.onerror = function() { this.style.display = 'none'; };
        img.onload = function() { mediaDiv.appendChild(img); };

        // Video
        const video = document.createElement('video');
        video.src = `images/projects/${project.id}/${i}.mp4`;
        video.controls = true;
        video.style.maxWidth = '200px';
        video.style.maxHeight = '150px';
        video.style.display = 'none';
        video.onloadeddata = function() { this.style.display = 'block'; mediaDiv.appendChild(video); };
        video.onerror = function() { this.remove(); };

        // Preload image to check if it exists
        document.body.appendChild(img);
        document.body.removeChild(img);

        // Preload video to check if it exists
        document.body.appendChild(video);
        document.body.removeChild(video);
    }

    popup.appendChild(closeBtn);
    popup.appendChild(title);
    popup.appendChild(desc);
    popup.appendChild(tagsDiv);
    popup.appendChild(mediaDiv);

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
        console.log(projects);

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