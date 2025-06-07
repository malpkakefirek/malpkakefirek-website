// Load projects from projects.json
var projects = {};
fetch("projects.json")
    .then(response => response.json())
    .then(data => {
        projects = data;
        console.log(projects);

        // Get URL parameters
        const url = new URL(window.location.href);

        let tags = url.searchParams.get("tags");
        if (tags) {
            tags = tags.split(",");
        }
        let page = url.searchParams.get("page");

        console.log(tags);
        console.log(page);
    });