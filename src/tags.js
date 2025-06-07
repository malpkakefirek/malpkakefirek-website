let allTags = {};
let selectedTags = [];

function tagClass(tag) {
    return 'tag-' + tag.replace(/[^a-zA-Z0-9_-]/g, '_');
}

fetch('tags.json')
    .then(res => res.json())
    .then(tags => {
        allTags = tags;
        let style = document.createElement('style');
        let css = '';
        Object.entries(tags).forEach(([tag, data]) => {
            css += `.${tagClass(tag)} { background: ${data.color}; opacity: 0.9}\n`;
        });
        style.textContent = css;
        document.head.appendChild(style);
        renderDropdown();
        restoreSelectionFromURL();
    });

const dropdownToggle = document.getElementById('tag-dropdown-toggle');
const dropdownContainer = document.getElementById('tag-dropdown-container');
const applyTagsBtn = document.getElementById('apply-tags-btn');
dropdownToggle.addEventListener('click', () => {
    dropdownContainer.classList.toggle('dropdown-collapsed');
});

function renderDropdown() {
    const dropdown = document.getElementById('tag-dropdown');
    dropdown.innerHTML = '';
    Object.keys(allTags).forEach(tag => {
        if (!selectedTags.includes(tag)) {
            const li = document.createElement('li');
            li.textContent = tag;
            li.className = tagClass(tag);
            li.tabIndex = 0;
            li.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                selectedTags.push(tag);
                updateSelectedTags(false);
                renderDropdown();
            });
            dropdown.appendChild(li);
        }
    });
}

function updateSelectedTags(updateURL = false) {
    const selectedTagsSpan = document.getElementById('selected-tags');
    selectedTagsSpan.innerHTML = '';
    selectedTags.forEach(tag => {
        const tagElem = document.createElement('span');
        tagElem.textContent = tag;
        tagElem.style.userSelect = 'none';
        tagElem.className = 'selected-tag ' + tagClass(tag);
        const x = document.createElement('button');
        x.textContent = '×';
        x.className = 'tag-remove';
        tagElem.addEventListener('click', () => {
            selectedTags = selectedTags.filter(t => t !== tag);
            updateSelectedTags(false);
            renderDropdown();
        });
        tagElem.appendChild(x);
        selectedTagsSpan.appendChild(tagElem);
    });
    // Show apply button if selection changed
    applyTagsBtn.style.display = 'inline-block';
    if (updateURL) {
        const url = new URL(window.location);
        if (selectedTags.length) {
            url.searchParams.set('tags', selectedTags.join(','));
        } else {
            url.searchParams.delete('tags');
        }
        window.history.replaceState({}, '', url);
    }
}

function restoreSelectionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const tagsParam = urlParams.get('tags');
    if (tagsParam) {
        selectedTags = tagsParam.split(',').filter(tag => allTags[tag]);
        updateSelectedTags();
        renderDropdown();
        applyTagsBtn.style.display = 'none';
    }
}

applyTagsBtn.addEventListener('click', () => {
    const url = new URL(window.location);
    if (selectedTags.length) {
        // Manually set the search string to avoid encoding the comma
        url.searchParams.set('tags', selectedTags.join(','));
        url.search = url.search.replace(/(tags=)[^&]+/, (match, p1) => {
            return p1 + selectedTags.join(',');
        });
    } else {
        url.searchParams.delete('tags');
    }
    window.location = url;
});

document.addEventListener('click', (e) => {
    if (!dropdownContainer.contains(e.target) && e.target !== dropdownToggle) {
        dropdownContainer.classList.add('dropdown-collapsed');
    }
});